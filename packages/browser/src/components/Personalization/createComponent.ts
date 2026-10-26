/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { noop, isNonEmptyArray } from "@adobe/alloy-core/utils";
import createPersonalizationDetails from "./createPersonalizationDetails.js";
import { AUTHORING_ENABLED } from "./constants/loggerMessage.js";
import { PropositionEventType } from "@adobe/alloy-core/constants/propositionEventType.js";
import validateApplyPropositionsOptions from "./validateApplyPropositionsOptions.js";
import type { Event } from "@adobe/alloy-core/core/types.js";
import type {
  mergeDecisionsMeta as mergeDecisionsMetaFn,
  mergeQuery as mergeQueryFn,
} from "@adobe/alloy-core/utils/event.js";
import type createFetchDataHandler from "./createFetchDataHandler.js";
import type createViewChangeHandler from "./createViewChangeHandler.js";
import type createOnClickHandler from "./createOnClickHandler.js";
import type createApplyPropositions from "./createApplyPropositions.js";
import type createSetTargetMigration from "./createSetTargetMigration.js";
import type createOnDecisionHandler from "./createOnDecisionHandler.js";
import type {
  AsyncArray,
  DecisionMeta,
  GetPageLocation,
  IdentityMap,
  Logger,
  OnRequestFailure,
  OnResponse,
  EventPersonalizationOptions,
  ViewCache,
} from "./types.js";

export default ({
  getPageLocation,
  logger,
  fetchDataHandler,
  viewChangeHandler,
  onClickHandler,
  isAuthoringModeEnabled,
  mergeQuery,
  viewCache,
  showContainers,
  applyPropositions,
  setTargetMigration,
  mergeDecisionsMeta,
  renderedPropositions,
  onDecisionHandler,
  handleConsentFlicker,
}: {
  getPageLocation: GetPageLocation;
  logger: Logger;
  fetchDataHandler: ReturnType<typeof createFetchDataHandler>;
  viewChangeHandler: ReturnType<typeof createViewChangeHandler>;
  onClickHandler: ReturnType<typeof createOnClickHandler>;
  isAuthoringModeEnabled: () => boolean;
  mergeQuery: typeof mergeQueryFn;
  viewCache: ViewCache;
  showContainers: () => void;
  applyPropositions: ReturnType<typeof createApplyPropositions>;
  setTargetMigration: ReturnType<typeof createSetTargetMigration>;
  mergeDecisionsMeta: typeof mergeDecisionsMetaFn;
  renderedPropositions: AsyncArray<DecisionMeta>;
  onDecisionHandler: ReturnType<typeof createOnDecisionHandler>;
  handleConsentFlicker: () => void;
}) => {
  return {
    lifecycle: {
      onComponentsRegistered() {
        handleConsentFlicker();
      },
      onDecision: onDecisionHandler,
      onBeforeRequest({
        request,
      }: {
        request: Parameters<ReturnType<typeof createSetTargetMigration>>[0];
      }) {
        setTargetMigration(request);
        return Promise.resolve();
      },
      onBeforeEvent({
        event,
        renderDecisions,
        decisionScopes = [],
        personalization = {},
        onResponse = noop,
        onRequestFailure = noop,
      }: {
        event: Event;
        renderDecisions?: boolean;
        decisionScopes?: string[];
        personalization?: EventPersonalizationOptions;
        onResponse?: OnResponse;
        onRequestFailure?: OnRequestFailure;
      }) {
        // Include propositions on all responses, overridden with data as needed
        onResponse(() => ({ propositions: [] }));
        onRequestFailure(() => showContainers());

        if (isAuthoringModeEnabled()) {
          logger.warn(AUTHORING_ENABLED);

          // If we are in authoring mode we disable personalization
          mergeQuery(event, { enabled: false });
          return Promise.resolve();
        }

        const personalizationDetails = createPersonalizationDetails({
          getPageLocation,
          renderDecisions,
          decisionScopes,
          personalization,
          event,
          isCacheInitialized: viewCache.isInitialized(),
          logger,
        });

        const decisionsMetaPromises: Promise<DecisionMeta[]>[] = [];
        if (personalizationDetails.shouldIncludeRenderedPropositions()) {
          decisionsMetaPromises.push(renderedPropositions.clear());
        }

        if (personalizationDetails.shouldFetchData()) {
          const cacheUpdate = viewCache.createCacheUpdate(
            personalizationDetails.getViewName(),
          );
          onRequestFailure(() => cacheUpdate.cancel());

          // The user identity map is typed loosely by the event but is an identity map.
          const identityMap = event.getUserIdentityMap() as
            | IdentityMap
            | undefined;

          fetchDataHandler({
            cacheUpdate,
            personalizationDetails,
            event,
            onResponse,
            identityMap,
          });
        } else if (personalizationDetails.shouldUseCachedData()) {
          decisionsMetaPromises.push(
            viewChangeHandler({
              personalizationDetails,
              event,
              onResponse,
              onRequestFailure,
            }),
          );
        }

        // This promise.all waits for both the pending display notifications to be resolved
        // (i.e. the top of page call to finish rendering) and the view change handler to
        // finish rendering anything for this view.
        return Promise.all(decisionsMetaPromises).then((decisionsMetas) => {
          // We only want to call mergeDecisionsMeta once, but we can get the propositions
          // from two places: the pending display notifications and the view change handler.
          const decisionsMeta = decisionsMetas.flatMap((dms) => dms);
          if (isNonEmptyArray(decisionsMeta)) {
            mergeDecisionsMeta(event, decisionsMeta, [
              PropositionEventType.DISPLAY,
            ]);
          }
        });
      },
      onClick({
        event,
        clickedElement,
      }: {
        event: Event;
        clickedElement: Node | null;
      }) {
        onClickHandler({ event, clickedElement });
      },
    },
    commands: {
      applyPropositions: {
        optionsValidator: (options: unknown) =>
          validateApplyPropositionsOptions({ logger, options }),
        run: applyPropositions,
      },
    },
  };
};
