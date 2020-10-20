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

export default ({
  config,
  logger,
  onResponseHandler,
  onViewChangeHandler,
  onClickHandler,
  hideContainers,
  showContainers,
  isAuthoringModeEnabled,
  mergeQuery,
  viewCache
}) => {
  const { prehidingStyle } = config;

  const handleViewChange = (personalization, onResponse, onRequestFailure) => {
    if (personalization.isRenderDecisions()) {
      onViewChangeHandler({
        viewName: personalization.getViewName()
      });
      return;
    }
    onResponse(() => {
      return {
        decisions: viewCache.getView(personalization.getViewName())
      };
    });
    onRequestFailure(() => {
      showContainers();
    });
  };
  const handlePageLoad = (
    personalization,
    event,
    onResponse,
    onRequestFailure
  ) => {
    if (personalization.isRenderDecisions()) {
      hideContainers(prehidingStyle);
    }
    mergeQuery(event, personalization.createQueryDetails());

    onResponse(({ response }) =>
      onResponseHandler({
        personalization,
        response
      })
    );
    onRequestFailure(() => {
      showContainers();
    });
  };
  return {
    lifecycle: {
      onBeforeEvent({
        event,
        renderDecisions,
        decisionScopes = [],
        onResponse = noop,
        onRequestFailure = noop
      }) {
        if (isAuthoringModeEnabled()) {
          logger.warn("Rendering is disabled, authoring mode.");

          // If we are in authoring mode we disable personalization
          mergeQuery(event, { enabled: false });
          return;
        }
        const personalization = createPersonalizationDetails({
          renderDecisions,
          decisionScopes,
          event
        });

        if (personalization.hasScopes() || !viewCache.isInitialized()) {
          handlePageLoad(personalization, event, onResponse, onRequestFailure);
          return;
        }
        if (viewCache.isInitialized() && personalization.getViewName()) {
          handleViewChange(personalization, onResponse, onRequestFailure);
        }
      },
      onClick({ event, clickedElement }) {
        onClickHandler({ event, clickedElement });
      }
    }
  };
};
