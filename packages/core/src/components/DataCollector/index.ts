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
import type {
  ApplyResponseOptions,
  ComponentTools,
  SendEventOptions,
} from "../../core/types.js";

/** The validated options of the `sendEvent` command. */
export interface SendEventCommandOptions extends SendEventOptions {
  type?: string;
  xdm?: Record<string, unknown>;
  data?: Record<string, unknown>;
  documentUnloading?: boolean;
  mergeId?: string;
  /** @deprecated Use `edgeConfigOverrides` instead. */
  datasetId?: string;
  advertising?: { handleAdvertisingData?: string };
}

/** The validated options of the `applyResponse` command. */
export type ApplyResponseCommandOptions = ApplyResponseOptions;

export type DataCollectorOptions = Pick<
  ComponentTools,
  "eventManager" | "logger"
>;

const createDataCollector = ({
  eventManager,
  logger,
}: DataCollectorOptions) => {
  return {
    commands: {
      sendEvent: {
        documentationUri: "https://adobe.ly/3GQ3Q7t",
        optionsValidator: (options: unknown) => {
          return validateUserEventOptions({ options });
        },
        run: (options: SendEventCommandOptions) => {
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

          // createEvent stores undefined as "no user xdm/data"; Event's type is narrower.
          event.setUserXdm(xdm as Record<string, unknown>);
          event.setUserData(data as Record<string, unknown>);

          if (type) {
            event.mergeXdm({
              eventType: type,
            });
          }

          if (mergeId) {
            event.mergeXdm({
              eventMergeId: mergeId,
            });
          }

          if (edgeConfigOverrides) {
            // The rest type drops edgeConfigOverrides, which we put back here.
            (eventManagerOptions as SendEventOptions).edgeConfigOverrides =
              edgeConfigOverrides;
          }

          if (datasetId) {
            logger.warn(
              "The 'datasetId' option has been deprecated. Please use 'edgeConfigOverrides.com_adobe_experience_platform.datasets.event.datasetId' instead.",
            );
            // The rest type drops edgeConfigOverrides, which we put back here.
            (eventManagerOptions as SendEventOptions).edgeConfigOverrides =
              edgeConfigOverrides || {};
            // Assigned on the line above.
            deepAssign(
              (eventManagerOptions as SendEventOptions).edgeConfigOverrides!,
              {
                com_adobe_experience_platform: {
                  datasets: { event: { datasetId } },
                },
              },
            );
          }
          return eventManager.sendEvent(event, eventManagerOptions);
        },
      },
      applyResponse: {
        documentationUri: "",
        optionsValidator: (options: unknown) => {
          return validateApplyResponse({ options });
        },
        run: (options: ApplyResponseCommandOptions) => {
          const {
            renderDecisions = false,
            decisionContext = {},
            responseHeaders = {},
            responseBody = { handle: [] },
            personalization,
          } = options;

          const event = eventManager.createEvent();

          return eventManager.applyResponse(event, {
            renderDecisions,
            decisionContext,
            responseHeaders,
            responseBody,
            personalization,
          });
        },
      },
    },
  };
};

createDataCollector.namespace = "DataCollector";

export default createDataCollector;
