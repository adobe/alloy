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

import createEventListeners from "@adobe/alloy-core/createEventListeners.js";

/* eslint-disable no-console */

// @ts-check
/// <reference lib="webworker" />

/** @import { ServiceWorkerLogger } from '@adobe/alloy-core/types.js' */

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

const eventListeners = createEventListeners({
  sw,
  platform: {
    logger,
    fetch,
  },
});

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
  eventListeners.pushNotifications.onPush(event),
);

/**
 * @listens notificationclick
 * @param {NotificationEvent} event
 */
sw.addEventListener("notificationclick", (event) =>
  eventListeners.pushNotifications.onNotificationClick(event),
);

/**
 * @listens notificationclose
 * @param {NotificationEvent} event
 */
sw.addEventListener("notificationclose", (event) => {
  eventListeners.pushNotifications.onNotificationClose(event);
});
