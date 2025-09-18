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

/* eslint-disable no-underscore-dangle */

/** @import { ServiceWorkerLogger } from '../types.js' */
/** @import { TrackingDataPayload   } from '../types.js' */

import readFromIndexedDb from "../helpers/readFromIndexedDb.js";
import uuidv4 from "../../../utils/uuid.js";

/**
 * @async
 * @function
 * @param {Object} options
 * @param {Object} options.xdm
 * @param {string} [options.actionLabel]
 * @param {number} [options.applicationLaunches=0]
 * @param {Object} utils
 * @param {ServiceWorkerLogger} utils.logger
 * @param {Function} utils.fetch
 *
 * @returns {Promise<boolean>}
 * @throws {Error}
 */
export default async (
  { xdm, actionLabel, applicationLaunches = 0 },
  { logger, fetch },
) => {
  const configData = await readFromIndexedDb(logger);
  const { browser, ecid, edgeDomain, edgeBasePath, datastreamId, datasetId } =
    configData || {};
  let customActionData = {};

  if (actionLabel) {
    customActionData = {
      customAction: { actionID: actionLabel },
    };
  }

  const requiredFields = [
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
      if (!configData[field.name]) {
        throw new Error(
          `Cannot send tracking call. ${field.errorField} is missing.`,
        );
      }
    }

    const url = `https://${edgeDomain}/${edgeBasePath}/v1/interact?configId=${datastreamId}`;

    /** @type {TrackingDataPayload} */
    const payload = {
      events: [
        {
          xdm: {
            identityMap: {
              ECID: [{ id: ecid }],
            },
            timestamp: new Date().toISOString(),
            pushNotificationTracking: {
              ...customActionData,
              pushProviderMessageID: uuidv4(),
              pushProvider: browser.toLowerCase(),
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
              datasetId,
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
