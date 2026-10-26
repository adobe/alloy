/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import type {
  PushServiceWorkerConfig,
  ReadFromIndexedDb,
  ServiceWorkerLogger,
  TrackingDataPayload,
  XdmTrackingContext,
} from "../types.js";

export const createMakeSendServiceWorkerTrackingData = ({
  readFromIndexedDb,
  uuidv4,
  logger,
  fetch,
}: {
  readFromIndexedDb: ReadFromIndexedDb;
  uuidv4: () => string;
  logger: ServiceWorkerLogger;
  fetch: (url: string, options: object) => Promise<Response>;
}) => {
  /**
   *
   * @throws {Error}
   */
  return async ({
    xdm,
    actionLabel,
    applicationLaunches = 0,
  }: {
    xdm: XdmTrackingContext;
    actionLabel?: string | null;
    applicationLaunches?: number;
  }): Promise<boolean> => {
    const configData = await readFromIndexedDb(logger);
    const { browser, ecid, edgeDomain, edgeBasePath, datastreamId, datasetId } =
      configData || ({} as PushServiceWorkerConfig);
    let customActionData: { customAction?: { actionID: string } } = {};

    if (actionLabel) {
      customActionData = {
        customAction: { actionID: actionLabel },
      };
    }

    const requiredFields: {
      name: keyof PushServiceWorkerConfig;
      errorField: string;
    }[] = [
      { name: "browser", errorField: "Browser" },
      { name: "ecid", errorField: "ECID" },
      {
        name: "edgeDomain",
        errorField: "Edge domain",
      },
      {
        name: "edgeBasePath",
        errorField: "Edge base path",
      },
      {
        name: "datastreamId",
        errorField: "Datastream ID",
      },
      {
        name: "datasetId",
        errorField: "Dataset ID",
      },
    ];

    try {
      for (const field of requiredFields) {
        // configData may be undefined; the resulting TypeError is caught below.
        if (!configData![field.name]) {
          throw new Error(
            `Cannot send tracking call. ${field.errorField} is missing.`,
          );
        }
      }

      const url = `https://${edgeDomain}/${edgeBasePath}/v1/interact?configId=${datastreamId}&requestId=${uuidv4()}`;

      // The requiredFields loop above guarantees these are defined strings.
      const validEcid = ecid as string;
      const validBrowser = browser as string;
      const validDatasetId = datasetId as string;

      const payload: TrackingDataPayload = {
        events: [
          {
            xdm: {
              identityMap: {
                ECID: [{ id: validEcid }],
              },
              timestamp: new Date().toISOString(),
              pushNotificationTracking: {
                ...customActionData,
                pushProviderMessageID: uuidv4(),
                pushProvider: validBrowser.toLowerCase(),
              },
              application: {
                launches: {
                  value: applicationLaunches,
                },
              },
              eventType: actionLabel
                ? "pushTracking.customAction"
                : "pushTracking.applicationOpened",
              _experience: {
                ...xdm._experience,
                customerJourneyManagement: {
                  ...xdm._experience.customerJourneyManagement,
                  pushChannelContext: {
                    platform: "web",
                  },
                  messageProfile: {
                    channel: {
                      _id: "https://ns.adobe.com/xdm/channels/push",
                    },
                  },
                },
              },
            },
            meta: {
              collect: {
                datasetId: validDatasetId,
              },
            },
          },
        ],
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "text/plain; charset=UTF-8",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        logger.error(
          "Tracking call failed: ",
          response.status,
          response.statusText,
        );
        return false;
      }

      return true;
    } catch (error) {
      logger.error("Error sending tracking call:", error);
      return false;
    }
  };
};
