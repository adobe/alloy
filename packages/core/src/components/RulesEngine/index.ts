/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { noop, sanitizeOrgIdForCookieName } from "../../utils/index.js";
import createOnResponseHandler from "./createOnResponseHandler.js";
import createDecisionProvider from "./createDecisionProvider.js";
import createApplyResponse from "./createApplyResponse.js";
import createEventRegistry from "./createEventRegistry.js";
import createContextProvider from "./createContextProvider.js";
import createSubscribeRulesetItems from "./createSubscribeRulesetItems.js";
import {
  CONTEXT_KEY,
  CONTEXT_EVENT_SOURCE,
  CONTEXT_EVENT_TYPE,
} from "./constants/index.js";
import createEvaluateRulesetsCommand from "./createEvaluateRulesetsCommand.js";
import { clearLocalStorage, createInMemoryStorage } from "./utils/storage.js";
import { objectOf, boolean } from "../../utils/validation/index.js";
import createCollect from "../../utils/createCollect.js";
import { mergeDecisionsMeta } from "../../utils/event.js";
import flattenObject from "../../utils/flattenObject.js";
import extractPayloadsFromEventHistoryOperations from "./utils/extractPayloadsFromEventHistoryOperations.js";
import type {
  ComponentCreator,
  ComponentTools,
  Event,
  Lifecycle,
} from "../../core/types.js";

import type { Request } from "../../utils/request/types.js";
import type { ApplyResponse } from "./createApplyResponse.js";
import type { EvaluateRulesetsUserOptions } from "./createEvaluateRulesetsCommand.js";
import type { Proposition } from "./types.js";

type CollectDependencies = Parameters<typeof createCollect>[0];

export type RulesEngineTools = Pick<
  ComponentTools,
  | "config"
  | "eventManager"
  | "consent"
  | "getBrowser"
  | "logger"
  | "platformServices"
>;

export interface RulesEngineBeforeEventOptions {
  event: Event;
  renderDecisions?: boolean;
  personalization?: { decisionContext?: Record<string, unknown> };
  onResponse?: (handler: ReturnType<typeof createOnResponseHandler>) => void;
}

const createRulesEngine = ({
  config,
  eventManager,
  consent,
  getBrowser,
  logger,
  platformServices,
}: RulesEngineTools) => {
  const { orgId, personalizationStorageEnabled } = config;
  // createCollect's parameter types disagree with core's (utils vs core Event,
  // possibly-undefined event types) though runtime matches what it always did;
  // aligning them is a core change (ask-first).
  const collect = createCollect({
    eventManager:
      eventManager as unknown as CollectDependencies["eventManager"],
    mergeDecisionsMeta:
      mergeDecisionsMeta as CollectDependencies["mergeDecisionsMeta"],
  });

  const storage = platformServices.storage.createNamespacedStorage(
    `${sanitizeOrgIdForCookieName(orgId)}.decisioning.`,
  );
  if (!personalizationStorageEnabled) {
    clearLocalStorage(storage.persistent);
  }

  const eventRegistry = createEventRegistry({
    storage: createInMemoryStorage(),
    logger,
  });
  const decisionProvider = createDecisionProvider({ eventRegistry });
  const contextProvider = createContextProvider({
    eventRegistry,
    getWindowContext: platformServices.globals.getWindowContext,
    getBrowser,
  });

  const evaluateRulesetsCommand = createEvaluateRulesetsCommand({
    contextProvider,
    decisionProvider,
  });
  const subscribeRulesetItems = createSubscribeRulesetItems({ collect });
  let applyResponse: ApplyResponse;

  // Events without a personalization query (display, interact, dismiss
  // notifications) are never evaluated on response, so rules that react to
  // them (e.g. "disqualify on dismiss") are evaluated here before sending.
  const applyEventHistoryOperations = (event: Event) => {
    const propositions = decisionProvider.evaluate(
      contextProvider.getContext({
        ...flattenObject(event.getContent()),
        [CONTEXT_KEY.TYPE]: CONTEXT_EVENT_TYPE.EDGE,
        [CONTEXT_KEY.SOURCE]: CONTEXT_EVENT_SOURCE.REQUEST,
      }),
      { recordTrigger: false },
    );

    eventRegistry.addEventPayloads(
      extractPayloadsFromEventHistoryOperations(propositions),
    );
  };

  return {
    lifecycle: {
      onDecision({ propositions }: { propositions: Proposition[] }) {
        subscribeRulesetItems.refresh(propositions);
      },
      onComponentsRegistered(tools: { lifecycle: Lifecycle }) {
        applyResponse = createApplyResponse({
          lifecycle: tools.lifecycle,
          eventRegistry,
        });
        if (personalizationStorageEnabled) {
          consent
            .awaitConsent()
            .then(() => eventRegistry.setStorage(storage.persistent))
            .catch(() => {
              if (storage) {
                clearLocalStorage(storage.persistent);
              }
            });
        }
      },
      onBeforeEvent({
        event,
        renderDecisions,
        personalization = {},
        onResponse = noop,
      }: RulesEngineBeforeEventOptions) {
        const { decisionContext = {} } = personalization;

        onResponse(
          createOnResponseHandler({
            renderDecisions,
            decisionProvider,
            applyResponse,
            event,
            personalization,
            decisionContext: contextProvider.getContext({
              [CONTEXT_KEY.TYPE]: CONTEXT_EVENT_TYPE.EDGE,
              [CONTEXT_KEY.SOURCE]: CONTEXT_EVENT_SOURCE.REQUEST,
              ...decisionContext,
            }),
          }),
        );
      },
      onBeforeRequest({ request }: { request: Request }) {
        // A request payload serializes its events under `events`.
        const payload = request.getPayload().toJSON() as { events?: Event[] };
        const { events = [] } = payload;
        if (events.length === 0) {
          return;
        }
        events.forEach((event) => eventRegistry.addExperienceEdgeEvent(event));
        events
          .filter((event) => !event.hasQuery())
          .forEach(applyEventHistoryOperations);
      },
    },
    commands: {
      evaluateRulesets: {
        run: ({
          renderDecisions,
          personalization = {},
        }: EvaluateRulesetsUserOptions) => {
          const { decisionContext = {} } = personalization;
          return evaluateRulesetsCommand.run({
            renderDecisions,
            decisionContext: {
              [CONTEXT_KEY.TYPE]: CONTEXT_EVENT_TYPE.RULES_ENGINE,
              [CONTEXT_KEY.SOURCE]: CONTEXT_EVENT_SOURCE.REQUEST,
              ...decisionContext,
            },
            applyResponse,
          });
        },
        optionsValidator: evaluateRulesetsCommand.optionsValidator,
      },
      subscribeRulesetItems: subscribeRulesetItems.command,
    },
  };
};

createRulesEngine.namespace = "RulesEngine";
createRulesEngine.configValidators = objectOf({
  personalizationStorageEnabled: boolean().default(false),
});
export default createRulesEngine satisfies ComponentCreator<RulesEngineTools>;
