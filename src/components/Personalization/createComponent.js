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

import { noop, defer } from "../../utils";
import createPersonalizationDetails from "./createPersonalizationDetails";
import { AUTHORING_ENABLED } from "./constants/loggerMessage";

export default ({
  window,
  logger,
  fetchDataHandler,
  viewChangeHandler,
  onClickHandler,
  isAuthoringModeEnabled,
  mergeQuery,
  viewCache,
  showContainers
}) => {
  return {
    lifecycle: {
      onBeforeEvent({
        event,
        renderDecisions,
        decisionScopes = [],
        surfaces = [],
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
          return;
        }

        const personalizationDetails = createPersonalizationDetails({
          window,
          renderDecisions,
          decisionScopes,
          surfaces,
          event,
          viewCache
        });

        if (personalizationDetails.shouldFetchData()) {
          const decisionsDeferred = defer();

          viewCache.storeViews(decisionsDeferred.promise);
          onRequestFailure(() => decisionsDeferred.reject());
          fetchDataHandler({
            decisionsDeferred,
            personalizationDetails,
            event,
            onResponse
          });
          return;
        }

        if (personalizationDetails.shouldUseCachedData()) {
          // eslint-disable-next-line consistent-return
          return viewChangeHandler({
            personalizationDetails,
            event,
            onResponse,
            onRequestFailure
          });
        }
      },
      onClick({ event, clickedElement }) {
        onClickHandler({ event, clickedElement });
      }
    }
  };
};
