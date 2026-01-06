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
import serviceWorkerPushListener from "./components/PushNotifications/helpers/serviceWorkerPushListener.js";
import serviceWorkerNotificationClickListener from "./components/PushNotifications/helpers/serviceWorkerNotificationClickListener.js";
import makeSendServiceWorkerTrackingData from "./components/PushNotifications/request/makeSendServiceWorkerTrackingData.js";

/**
 * @type {Object} PlatformCapabilities
 * @property {Logger} logger
 *
 * TODO: Remove dependency on sw (service worker)
 */
const createEventListeners = ({ platform, sw }) => {
  return {
    pushNotifications: {
      /**
       *
       * @param {PushEvent} event
       * @returns Promise<void>
       */
      onPush(event) {
        return serviceWorkerPushListener({
          event,
          sw,
          logger: platform.logger,
        });
      },
      /**
       * @param {NotificationEvent} event
       */
      onNotificationClick(event) {
        serviceWorkerNotificationClickListener({
          event,
          sw,
          logger: platform.logger,
          fetch: platform.fetch,
        });
      },
      /**
       *
       * @param {NotificationEvent} event
       */
      async onNotificationClose(event) {
        const data = event.notification.data;

        try {
          await makeSendServiceWorkerTrackingData(
            {
              /* eslint-disable-next-line no-underscore-dangle */
              xdm: data._xdm.mixins,
              actionLabel: "Dismiss",
            },
            { logger: platform.logger, fetch: platform.fetch },
          );
        } catch (error) {
          platform.logger.error("Failed to send tracking call:", error);
        }
      },
    },
  };
};
export default createEventListeners;
