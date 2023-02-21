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
const DECISIONS_HANDLE = "personalization:decisions";

export default ({
  prehidingStyle,
  propositionHandler,
  hideContainers,
  mergeQuery,
  renderHandler,
  nonRenderHandler,
  collect
}) => {
  return ({ decisionsDeferred, personalizationDetails, event, onResponse }) => {
    if (personalizationDetails.isRenderDecisions()) {
      hideContainers(prehidingStyle);
    }
    mergeQuery(event, personalizationDetails.createQueryDetails());

    onResponse(({ response }) => {
      const handles = response.getPayloadsByType(DECISIONS_HANDLE);
      const handler = personalizationDetails.isRenderDecisions() ? renderHandler : nonRenderHandler;
      const viewName = personalizationDetails.getViewName();
      const sendDisplayNotification = decisionsMeta => {
        if (decisionsMeta.length > 0) {
          return collect({ decisionsMeta, viewName });
        } else {
          return Promise.resolve();
        }
      };

      return propositionHandler({ handles, handler, viewName, decisionsDeferred, sendDisplayNotification});
    });
  };
};
