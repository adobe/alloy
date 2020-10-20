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
  logger,
  pageLoadHandler,
  viewChangeHandler,
  onClickHandler,
  isAuthoringModeEnabled,
  mergeQuery,
  viewCache
}) => {
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
          event,
          viewCache
        });

        if (personalization.shouldFetchData()) {
          pageLoadHandler({
            personalization,
            event,
            onResponse,
            onRequestFailure
          });
          return;
        }

        if (personalization.shouldUseCachedData()) {
          viewChangeHandler({ personalization, onResponse, onRequestFailure });
        }
      },
      onClick({ event, clickedElement }) {
        onClickHandler({ event, clickedElement });
      }
    }
  };
};
