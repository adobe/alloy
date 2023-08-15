import { VIEW_SCOPE_TYPE } from "./constants/scopeType";
import isPageWideScope from "./utils/isPageWideScope";

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
  collect,
  getView
}) => {
  return ({ decisionsDeferred, personalizationDetails, event, onResponse, displayNotificationsDeferred }) => {
    if (personalizationDetails.isRenderDecisions()) {
      hideContainers(prehidingStyle);
    }
    mergeQuery(event, personalizationDetails.createQueryDetails());

    onResponse(async ({ response }) => {
      const handles = response.getPayloadsByType(DECISIONS_HANDLE);

      const viewTypeHandles = [];
      const pageWideHandles = [];
      const otherHandles = [];
      handles.forEach(handle => {
        const {
          scope,
          scopeDetails: {
            characteristics: {
              scopeType
            } = {}
          } = {}
        } = handle;
        if (isPageWideScope(scope)) {
          pageWideHandles.push(handle);
        } else if (scopeType === VIEW_SCOPE_TYPE) {
          viewTypeHandles.push(handle);
        } else {
          otherHandles.push(handle);
        }
      });
      decisionsDeferred.resolve(viewTypeHandles);
      const viewName = personalizationDetails.getViewName();
      const propositionsToHandle = [
        ...(await getView(viewName)),
        ...pageWideHandles
      ];

      const handler = personalizationDetails.isRenderDecisions() ? renderHandler : nonRenderHandler;

      /*
      const resolveDisplayNotification = decisionsMeta => {
        if (!personalizationDetails.isSendDisplayNotifications()) {
          return displayNotificationsDeferred.resolve({ decisionsMeta, viewName });
        }
        if (decisionsMeta.length > 0) {
          displayNotificationsDeferred.resolve({ decisionsMeta, viewName });
          return collect({ decisionsMeta, viewName });
        }
        return Promise.resolve();
      };
      */
      const sendDisplayNotification = decisionsMeta => {
        if (decisionsMeta.length > 0) {
          return collect({ decisionsMeta, viewName });
        } else {
          return Promise.resolve();
        }
      };

      const { propositions, decisions } = propositionHandler({
        handles: propositionsToHandle,
        handler,
        viewName,
        resolveDisplayNotification: sendDisplayNotification,
        resolveRedirectNotification: sendDisplayNotification
      });

      otherHandles.forEach(handle => {
        propositions.push({
          renderAttempted: false,
          ...handle
        });
        decisions.push(handle);
      });
      return { propositions, decisions };
    });
  };
};
