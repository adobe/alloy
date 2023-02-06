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

import { defer, isNonEmptyArray } from "../../utils";
import { PropositionEventType } from "./constants/propositionEventType";

export default ({
  mergeDecisionsMeta,
  collect,
  viewCache,
  renderHandler,
  nonRenderHandler,
  propositionHandler
}) => {
  return ({ personalizationDetails, event, onResponse }) => {
    const viewName = personalizationDetails.getViewName();

    return viewCache.getView(viewName).then(handles => {
      const handler = personalizationDetails.isRenderDecisions() ? renderHandler : nonRenderHandler;
      const viewName = personalizationDetails.getViewName();
      const decisionsDeferred = defer();
      const sendDisplayNotificationDeferred = defer();
      const sendDisplayNotification = decisionsMeta => {
        if (isNonEmptyArray(decisionsMeta)) {
          mergeDecisionsMeta(event, decisionsMeta, PropositionEventType.DISPLAY);
        } else {
          // if there are no decisions in cache for this view, we will send an empty notification
          onResponse(() => {
            collect({ decisionsMeta: [], viewName });
          });
        }
        sendDisplayNotificationDeferred.resolve();
      }
      const returnValue = propositionHandler({
        handles,
        handler,
        viewName,
        decisionsDeferred,
        sendDisplayNotification
      });
      onResponse(() => returnValue);
      return sendDisplayNotificationDeferred;
    });
  };
};
