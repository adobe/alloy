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
/** @import { ServiceWorkerLogger, PushServiceWorkerConfig } from '../types.js' */

import ecidNamespace from "@adobe/alloy-core/constants/ecidNamespace.js";

/**
 * Determines whether a notification targeted at a specific identity should be
 * shown on this browser. When the payload contains an `identity` with the ECID
 * namespace, the notification is only shown if the ECID in the payload matches
 * the ECID stored in IndexedDB for this browser. When there is no identity, or
 * the namespace is not ECID, the notification is always shown.
 *
 * @param {Object} options
 * @param {PushNotificationData["web"]} options.webData
 * @param {(logger: ServiceWorkerLogger) => Promise<PushServiceWorkerConfig|undefined>} options.readFromIndexedDb
 * @param {ServiceWorkerLogger} options.logger
 * @returns {Promise<boolean>}
 */
const shouldShowNotification = async ({
  webData,
  readFromIndexedDb,
  logger,
}) => {
  const { identity } = webData;

  if (!identity || identity.namespace?.toUpperCase() !== ecidNamespace) {
    return true;
  }

  let storedConfig;
  try {
    storedConfig = await readFromIndexedDb(logger);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.info(`Unable to read the stored ECID for this browser. ${message}`);
    return true;
  }
  const storedEcid = storedConfig?.ecid;

  if (identity.id !== storedEcid) {
    logger.info(
      "Suppressing push notification: payload ECID does not match the ECID stored for this browser.",
    );
    return false;
  }

  return true;
};

/**
 * @async
 * @function
 *
 * @param {Object} options
 * @param {ServiceWorkerGlobalScope} options.sw
 * @param {PushEvent} options.event
 * @param {ServiceWorkerLogger} options.logger
 * @param {(logger: ServiceWorkerLogger) => Promise<PushServiceWorkerConfig|undefined>} options.readFromIndexedDb
 * @returns {Promise<void>}
 */
export default async ({ sw, event, logger, readFromIndexedDb }) => {
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

  const showNotification = await shouldShowNotification({
    webData,
    readFromIndexedDb,
    logger,
  });
  if (!showNotification) {
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
