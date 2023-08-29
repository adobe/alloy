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
import { defer } from "../../utils";
import {
  buildReturnedPropositions,
  buildReturnedDecisions
} from "./handlers/proposition";

const DECISIONS_HANDLE = "personalization:decisions";

export default ({
  prehidingStyle,
  hideContainers,
  mergeQuery,
  collect,
  render,
  pendingDisplayNotifications
}) => {
  return ({ cacheUpdate, personalizationDetails, event, onResponse }) => {
    if (personalizationDetails.isRenderDecisions()) {
      hideContainers(prehidingStyle);
    }
    mergeQuery(event, personalizationDetails.createQueryDetails());

    let handleNotifications;
    if (personalizationDetails.isSendDisplayNotifications()) {
      handleNotifications = decisionsMeta => {
        if (decisionsMeta.length > 0) {
          collect({
            decisionsMeta,
            viewName: personalizationDetails.getViewName()
          });
        }
      };
    } else {
      const displayNotificationsDeferred = defer();
      pendingDisplayNotifications.concat(displayNotificationsDeferred.promise);
      handleNotifications = displayNotificationsDeferred.resolve;
    }

    onResponse(({ response }) => {
      const handles = response.getPayloadsByType(DECISIONS_HANDLE);
      const propositions = cacheUpdate.update(handles);
      if (personalizationDetails.isRenderDecisions()) {
        render(propositions).then(handleNotifications);
      }

      return {
        propositions: buildReturnedPropositions(propositions),
        decisions: buildReturnedDecisions(propositions)
      };
    });
  };
};
