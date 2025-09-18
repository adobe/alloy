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

/** @import { ServiceWorkerLogger } from './types.js' */

import serviceWorkerNotificationClickListener from "./helpers/serviceWorkerNotificationClickListener.js";
import serviceWorkerPushListener from "./helpers/serviceWorkerPushListener.js";
import makeSendServiceWorkerTrackingData from "./request/makeSendServiceWorkerTrackingData.js";

/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */

// @ts-check
/// <reference lib="webworker" />

/** @type {ServiceWorkerGlobalScope} */
// @ts-ignore
const sw = self;

/**
 * @type {ServiceWorkerLogger}
 */
const logger = {
  namespace: "[alloy][pushNotificationWorker]",
  info: (...args) => console.log(logger.namespace, ...args),
  error: (...args) => console.error(logger.namespace, ...args),
};

/**
 * @listens install
 */
sw.addEventListener("install", () => {
  sw.skipWaiting();
});

/**
 * @listens activate
 * @param {ExtendableEvent} event
 */
sw.addEventListener("activate", (event) => {
  event.waitUntil(sw.clients.claim());
});

/**
 * @listens push
 * @param {PushEvent} event
 * @returns {Promise<void>}
 */
sw.addEventListener("push", (event) =>
  serviceWorkerPushListener({ event, logger, sw }),
);

/**
 * @listens notificationclick
 * @param {NotificationEvent} event
 */
sw.addEventListener("notificationclick", (event) =>
  serviceWorkerNotificationClickListener({ event, sw, logger, fetch }),
);

/**
 * @listens notificationclose
 * @param {NotificationEvent} event
 */
sw.addEventListener("notificationclose", (event) => {
  const data = event.notification.data;

  makeSendServiceWorkerTrackingData(
    {
      xdm: data._xdm.mixins,
      actionLabel: "Dismiss",
    },
    {
      logger,
      fetch,
    },
  ).catch((error) => {
    logger.error("Failed to send tracking call:", error);
  });
});
