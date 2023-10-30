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
import { noop, sanitizeOrgIdForCookieName } from "../../utils";
import createOnResponseHandler from "./createOnResponseHandler";
import createDecisionProvider from "./createDecisionProvider";
import createApplyResponse from "./createApplyResponse";
import createEventRegistry from "./createEventRegistry";
import createContextProvider from "./createContextProvider";
import createSubscribeRulesetItems from "./createSubscribeRulesetItems";
import {
  CONTEXT_KEY,
  CONTEXT_EVENT_SOURCE,
  CONTEXT_EVENT_TYPE
} from "./constants";
import createEvaluateRulesetsCommand from "./createEvaluateRulesetsCommand";
import { clearLocalStorage, createInMemoryStorage } from "./utils";
import { objectOf, boolean } from "../../utils/validation";

const createDecisioningEngine = ({
  config,
  createNamespacedStorage,
  consent
}) => {
  const { orgId, personalizationStorageEnabled } = config;
  const storage = createNamespacedStorage(
    `${sanitizeOrgIdForCookieName(orgId)}.decisioning.`
  );
  if (!personalizationStorageEnabled) {
    clearLocalStorage(storage.persistent);
  }

  const eventRegistry = createEventRegistry({
    storage: createInMemoryStorage()
  });
  const decisionProvider = createDecisionProvider({ eventRegistry });
  const contextProvider = createContextProvider({ eventRegistry, window });

  const evaluateRulesetsCommand = createEvaluateRulesetsCommand({
    contextProvider,
    decisionProvider
  });
  const subscribeRulesetItems = createSubscribeRulesetItems();
  let applyResponse;

  return {
    lifecycle: {
      onDecision({ propositions }) {
        subscribeRulesetItems.refresh(propositions);
      },
      onComponentsRegistered(tools) {
        applyResponse = createApplyResponse(tools.lifecycle);
        if (personalizationStorageEnabled) {
          consent
            .awaitConsent()
            .then(() => {
              eventRegistry.setStorage(storage.persistent);
            })
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
        onResponse = noop
      }) {
        const { decisionContext = {} } = personalization;

        onResponse(
          createOnResponseHandler({
            renderDecisions,
            decisionProvider,
            applyResponse,
            event,
            decisionContext: contextProvider.getContext({
              [CONTEXT_KEY.TYPE]: CONTEXT_EVENT_TYPE.EDGE,
              [CONTEXT_KEY.SOURCE]: CONTEXT_EVENT_SOURCE.REQUEST,
              ...decisionContext
            })
          })
        );

        eventRegistry.addExperienceEdgeEvent(event);
      }
    },
    commands: {
      evaluateRulesets: {
        run: ({ renderDecisions, personalization = {} }) => {
          const { decisionContext = {} } = personalization;
          return evaluateRulesetsCommand.run({
            renderDecisions,
            decisionContext: {
              [CONTEXT_KEY.TYPE]: CONTEXT_EVENT_TYPE.RULES_ENGINE,
              [CONTEXT_KEY.SOURCE]: CONTEXT_EVENT_SOURCE.REQUEST,
              ...decisionContext
            },
            applyResponse
          });
        },
        optionsValidator: evaluateRulesetsCommand.optionsValidator
      },
      subscribeRulesetItems: subscribeRulesetItems.command
    }
  };
};

createDecisioningEngine.namespace = "DecisioningEngine";
createDecisioningEngine.configValidators = objectOf({
  personalizationStorageEnabled: boolean().default(true)
});
export default createDecisioningEngine;
