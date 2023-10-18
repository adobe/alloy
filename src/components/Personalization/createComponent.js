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

import { noop, flatMap } from "../../utils";
import createPersonalizationDetails from "./createPersonalizationDetails";
import { AUTHORING_ENABLED } from "./constants/loggerMessage";
import validateApplyPropositionsOptions from "./validateApplyPropositionsOptions";
import { PropositionEventType } from "./constants/propositionEventType";

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
  pendingDisplayNotifications
}) => {
  return {
    lifecycle: {
      onBeforeRequest({ request }) {
        setTargetMigration(request);
        return Promise.resolve();
      },
      onBeforeEvent({
        event,
        renderDecisions,
        decisionScopes = [],
        personalization = {},
        onResponse = noop,
        onRequestFailure = noop
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
          logger
        });

        const decisionsMetaPromises = [];
        if (personalizationDetails.shouldAddPendingDisplayNotifications()) {
          decisionsMetaPromises.push(pendingDisplayNotifications.clear());
        }

        if (personalizationDetails.shouldFetchData()) {
          const cacheUpdate = viewCache.createCacheUpdate(
            personalizationDetails.getViewName()
          );
          onRequestFailure(() => cacheUpdate.cancel());

          fetchDataHandler({
            cacheUpdate,
            personalizationDetails,
            event,
            onResponse
          });
        } else if (personalizationDetails.shouldUseCachedData()) {
          // eslint-disable-next-line consistent-return
          decisionsMetaPromises.push(
            viewChangeHandler({
              personalizationDetails,
              event,
              onResponse,
              onRequestFailure
            })
          );
        }

        // This promise.all waits for both the pending display notifications to be resolved
        // (i.e. the top of page call to finish rendering) and the view change handler to
        // finish rendering anything for this view.
        return Promise.all(decisionsMetaPromises).then(decisionsMetas => {
          // We only want to call mergeDecisionsMeta once, but we can get the propositions
          // from two places: the pending display notifications and the view change handler.
          mergeDecisionsMeta(
            event,
            flatMap(decisionsMetas, dms => dms),
            PropositionEventType.DISPLAY
          );
        });
      },
      onClick({ event, clickedElement }) {
        onClickHandler({ event, clickedElement });
      }
    },
    commands: {
      applyPropositions: {
        optionsValidator: options =>
          validateApplyPropositionsOptions({ logger, options }),
        run: applyPropositions
      }
    }
  };
};
