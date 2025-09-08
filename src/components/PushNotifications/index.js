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

/** @import { StorageCreator } from '../../utils/types.js' */
/** @import { EventManager, Logger } from '../../core/types.js' */
/** @import { IdentityManager } from '../../core/identity/types.js' */
/** @import { ConsentManager } from '../../core/consent/types.js' */
/** @import { EdgeRequestExecutor } from '../../core/edgeNetwork/types.js' */

import { objectOf, string } from "../../utils/validation/index.js";
import { sanitizeOrgIdForCookieName } from "../../utils/index.js";
import makeSendPushSubscriptionRequest from "./request/makeSendPushSubscriptionRequest.js";

const isComponentConfigured = ({
  orgId,
  pushNotifications: { vapidPublicKey, appId } = {
    vapidPublicKey: undefined,
    appId: undefined,
  },
}) => orgId && vapidPublicKey && appId;

/**
 * @function
 *
 * @param {Object} options
 * @param {{ orgId: string, pushNotifications: { vapidPublicKey: string, appId: string }}} options.config
 * @param {StorageCreator} options.createNamespacedStorage
 * @param {EventManager} options.eventManager
 * @param {Logger} options.logger
 * @param {ConsentManager} options.consent
 * @param {IdentityManager} options.identity
 * @param {EdgeRequestExecutor} options.sendEdgeNetworkRequest
 * @returns {{  commands: { sendPushSubscription: object } }}
 */
const createPushNotifications = ({
  createNamespacedStorage,
  eventManager,
  config,
  logger,
  consent,
  identity,
  sendEdgeNetworkRequest,
}) => {
  return {
    commands: {
      sendPushSubscription: {
        run: async () => {
          if (!isComponentConfigured(config)) {
            throw new Error(
              "Push notifications module is not configured. VAPID public key and application ID are required.",
            );
          }

          const {
            orgId,
            pushNotifications: { vapidPublicKey, appId } = {
              vapidPublicKey: undefined,
              appId: undefined,
            },
          } = config || {};

          const storage = createNamespacedStorage(
            `${sanitizeOrgIdForCookieName(orgId)}.pushNotifications.`,
          );

          return makeSendPushSubscriptionRequest({
            config: {
              vapidPublicKey,
              appId,
            },
            storage: storage.persistent,
            logger,
            sendEdgeNetworkRequest,
            consent,
            eventManager,
            identity,
            window,
          });
        },
        optionsValidator: objectOf({}).noUnknownFields(),
      },
    },
  };
};

createPushNotifications.namespace = "Push Notifications";
createPushNotifications.configValidators = objectOf({
  pushNotifications: objectOf({
    vapidPublicKey: string().required(),
    appId: string().required(),
  }).noUnknownFields(),
});

export default createPushNotifications;
