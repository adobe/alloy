/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import validateUserEventOptions from "./validateUserEventOptions.js";
import validateApplyResponse from "./validateApplyResponse.js";
import { deepAssign } from "../../utils/index.js";

const createDataCollector = ({ eventManager, logger }) => {
  return {
    commands: {
      sendEvent: {
        documentationUri: "https://adobe.ly/3GQ3Q7t",
        optionsValidator: options => {
          return validateUserEventOptions({ options });
        },
        run: options => {
          const {
            xdm,
            data,
            documentUnloading,
            type,
            mergeId,
            datasetId,
            edgeConfigOverrides,
            ...eventManagerOptions
          } = options;
          const event = eventManager.createEvent();

          if (documentUnloading) {
            event.documentMayUnload();
          }

          event.setUserXdm(xdm);
          event.setUserData(data);

          if (type) {
            event.mergeXdm({
              eventType: type
            });
          }

          if (mergeId) {
            event.mergeXdm({
              eventMergeId: mergeId
            });
          }

          if (edgeConfigOverrides) {
            eventManagerOptions.edgeConfigOverrides = edgeConfigOverrides;
          }

          if (datasetId) {
            logger.warn(
              "The 'datasetId' option has been deprecated. Please use 'edgeConfigOverrides.com_adobe_experience_platform.datasets.event.datasetId' instead."
            );
            eventManagerOptions.edgeConfigOverrides = edgeConfigOverrides || {};
            deepAssign(eventManagerOptions.edgeConfigOverrides, {
              com_adobe_experience_platform: {
                datasets: { event: { datasetId } }
              }
            });
          }
          return eventManager.sendEvent(event, eventManagerOptions);
        }
      },
      applyResponse: {
        documentationUri: "",
        optionsValidator: options => {
          return validateApplyResponse({ options });
        },
        run: options => {
          const {
            renderDecisions = false,
            decisionContext = {},
            responseHeaders = {},
            responseBody = { handle: [] },
            personalization
          } = options;

          const event = eventManager.createEvent();

          return eventManager.applyResponse(event, {
            renderDecisions,
            decisionContext,
            responseHeaders,
            responseBody,
            personalization
          });
        }
      }
    }
  };
};

createDataCollector.namespace = "DataCollector";

export default createDataCollector;
