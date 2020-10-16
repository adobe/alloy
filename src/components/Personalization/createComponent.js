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

export default ({
  config,
  logger,
  onResponseHandler,
  onViewChangeHandler,
  onClickHandler,
  hideContainers,
  showContainers,
  isAuthoringModeEnabled,
  getDecisionScopes,
  mergeQuery,
  createQueryDetails,
  viewStore
}) => {
  const { prehidingStyle } = config;

  return {
    lifecycle: {
      onBeforeEvent({
        event,
        renderDecisions,
        decisionScopes = [],
        viewName,
        onResponse = noop,
        onRequestFailure = noop
      }) {
        if (event.isNotification()) {
          return;
        }
        if (isAuthoringModeEnabled()) {
          logger.warn("Rendering is disabled, authoring mode.");

          // If we are in authoring mode we disable personalization
          mergeQuery(event, { enabled: false });
          return;
        }

        onRequestFailure(() => {
          showContainers();
        });

        if (
          decisionScopes.length === 0 &&
          viewStore.isStoreInitialized() &&
          viewName
        ) {
          if (renderDecisions) {
            onViewChangeHandler({ viewName });
            return;
          }
          onResponse(() => {
            return { decisions: viewStore.getView(viewName) };
          });
          return;
        }

        const scopes = getDecisionScopes(decisionScopes);

        if (renderDecisions) {
          hideContainers(prehidingStyle);
        }
        /*  if (!renderDecisions) {
          showContainers();
        }
*/
        mergeQuery(event, createQueryDetails(scopes));

        onResponse(({ response }) =>
          onResponseHandler({ renderDecisions, response, viewName })
        );
      },

      onClick({ event, clickedElement }) {
        onClickHandler({ event, clickedElement });
      }
    }
  };
};
