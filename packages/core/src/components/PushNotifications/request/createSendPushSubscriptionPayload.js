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

/** @import { EventManager } from "../../../core/types.js" */
/** @import { DataCollectionRequestPayload } from "../../../utils/request/types.js" */

import createDataCollectionRequestPayload from "../../../utils/request/createDataCollectionRequestPayload.js";

/**
 * Creates a data collection request payload for sending push subscription details to Adobe Experience Platform.
 *
 * This function constructs an event containing push notification subscription information,
 * including the subscription details, platform information, and identity data. The event
 * is then packaged into a data collection request payload for transmission to the edge network.
 *
 * @async
 * @function
 *
 * @param {Object} options
 * @param {string} options.ecid
 * @param {EventManager} options.eventManager
 * @param {string} options.serializedPushSubscriptionDetails
 * @param {string} options.appId
 *
 * @returns {Promise<DataCollectionRequestPayload>}
 */
export default async ({
  ecid,
  eventManager,
  serializedPushSubscriptionDetails,
  appId,
}) => {
  const event = eventManager.createEvent();

  event.setUserData({
    pushNotificationDetails: [
      {
        appID: appId,
        token: serializedPushSubscriptionDetails,
        platform: "web",
        denylisted: false,
        identity: {
          namespace: {
            code: "ECID",
          },
          id: ecid,
        },
      },
    ],
  });
  event.finalize();

  const payload = createDataCollectionRequestPayload();
  payload.addEvent(event);

  return payload;
};
