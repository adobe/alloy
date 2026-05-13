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

// @ts-check
/// <reference lib="webworker" />

/** @import {  PushNotificationData  } from '../types.js' */
/** @import { ServiceWorkerLogger } from '../types.js' */

/**
 * @async
 * @function
 *
 * @param {Object} options
 * @param {ServiceWorkerGlobalScope} options.sw
 * @param {PushEvent} options.event
 * @param {ServiceWorkerLogger} options.logger
 * @returns {Promise<void>}
 */
export default async ({ sw, event, logger }) => {
  if (!event.data) {
    return;
  }

  /** @type {PushNotificationData} */
  let notificationData;
  try {
    notificationData = event.data.json();
  } catch (error) {
    logger.error("Error decoding notification JSON data:", error);
    return;
  }

  const webData = notificationData.web;
  if (!webData?.title) {
    return;
  }

  /** @type {Record<string, unknown>} */
  const notificationOptions = {
    data: webData,
    actions:
      webData.actions?.buttons?.map((button, index) => ({
        action: `action_${index}`,
        title: button.label,
      })) ?? [],
  };

  if (webData.body != null) {
    notificationOptions.body = webData.body;
  }
  if (webData.media != null) {
    notificationOptions.icon = webData.media;
    notificationOptions.image = webData.media;
  }

  return sw.registration.showNotification(
    webData.title,
    /** @type {NotificationOptions} */ (notificationOptions),
  );
};
