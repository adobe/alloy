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

import { noop } from "../../utils";
import createPersonalizationDetails from "./createPersonalizationDetails";
import { AUTHORING_ENABLED } from "./constants/loggerMessage";
import validateApplyPropositionsOptions from "./validateApplyPropositionsOptions";

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
  pendingNotificationsHandler,
  onDecisionHandler,
  subscribeMessageFeed
}) => {
  return {
    lifecycle: {
      onDecision({ viewName, renderDecisions, propositions }) {
        return onDecisionHandler({ viewName, renderDecisions, propositions });
      },
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

        const handlerPromises = [];
        if (personalizationDetails.shouldAddPendingDisplayNotifications()) {
          handlerPromises.push(pendingNotificationsHandler({ event }));
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
          handlerPromises.push(
            viewChangeHandler({
              personalizationDetails,
              event,
              onResponse,
              onRequestFailure
            })
          );
        }
        // We can wait for personalization to be applied and for
        // the fetch data request to complete in parallel.
        return Promise.all(handlerPromises);
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
      },
      subscribeMessageFeed: subscribeMessageFeed.command
    }
  };
};
