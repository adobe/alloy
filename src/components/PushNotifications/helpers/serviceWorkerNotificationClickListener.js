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

/** @import { ServiceWorkerLogger } from '../types.js' */

import makeSendServiceWorkerTrackingData from "../request/makeSendServiceWorkerTrackingData.js";

/**
 * @param {string} type
 * @returns {boolean}
 */
const canHandleUrl = (type) => ["DEEPLINK", "WEBURL"].includes(type);

/**
 * @function
 *
 * @param {Object} options
 * @param {ServiceWorkerGlobalScope} options.sw
 * @param {NotificationEvent} options.event
 * @param {Function} options.fetch
 * @param {ServiceWorkerLogger} options.logger
 */
export default ({ event, sw, logger, fetch }) => {
  event.notification.close();

  const data = event.notification.data;
  let targetUrl = null;
  let actionLabel = null;

  if (event.action) {
    const actionIndex = parseInt(event.action.replace("action_", ""), 10);
    if (data?.actions?.buttons[actionIndex]) {
      const button = data.actions.buttons[actionIndex];
      actionLabel = button.label;
      if (canHandleUrl(button.type) && button.uri) {
        targetUrl = button.uri;
      }
    }
  } else if (canHandleUrl(data?.interaction?.type) && data?.interaction?.uri) {
    targetUrl = data.interaction.uri;
  }

  makeSendServiceWorkerTrackingData(
    {
      // eslint-disable-next-line no-underscore-dangle
      xdm: data._xdm.mixins,
      actionLabel,
      applicationLaunches: 1,
    },
    {
      logger,
      fetch,
    },
  ).catch((error) => {
    logger.error("Failed to send tracking call:", error);
  });

  if (targetUrl) {
    event.waitUntil(
      sw.clients.matchAll({ type: "window" }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === targetUrl && "focus" in client) {
            return client.focus();
          }
        }
        if (sw.clients.openWindow) {
          return sw.clients.openWindow(targetUrl);
        }
      }),
    );
  }
};
