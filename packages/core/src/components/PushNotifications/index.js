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
import saveToIndexedDb from "./helpers/saveToIndexedDb.js";

const isComponentConfigured = ({
  orgId,
  pushNotifications: { vapidPublicKey, appId, trackingDatasetId } = {
    vapidPublicKey: undefined,
    appId: undefined,
    trackingDatasetId: undefined,
  },
}) => orgId && vapidPublicKey && appId && trackingDatasetId;

/**
 * @function
 *
 * @param {Object} options
 * @param {{ orgId: string, datastreamId: string, edgeDomain: string, edgeBasePath: string, pushNotifications: { vapidPublicKey: string, appId: string, trackingDatasetId: string }}} options.config
 * @param {StorageCreator} options.createNamespacedStorage
 * @param {EventManager} options.eventManager
 * @param {Logger} options.logger
 * @param {ConsentManager} options.consent
 * @param {IdentityManager} options.identity
 * @param {function(): string} options.getBrowser
 * @param {EdgeRequestExecutor} options.sendEdgeNetworkRequest
 * @returns {{ lifecycle: object, commands: { sendPushSubscription: object } }}
 */
const createPushNotifications = ({
  createNamespacedStorage,
  eventManager,
  config,
  logger,
  consent,
  identity,
  getBrowser,
  sendEdgeNetworkRequest,
}) => {
  return {
    lifecycle: {
      async onComponentsRegistered() {
        if (isComponentConfigured(config)) {
          const {
            datastreamId,
            edgeDomain,
            edgeBasePath,
            pushNotifications: { trackingDatasetId },
          } = config;
          await saveToIndexedDb(
            {
              datastreamId,
              edgeDomain,
              edgeBasePath,
              datasetId: trackingDatasetId,
              browser: getBrowser(),
            },
            logger,
          );
        }
      },
    },
    commands: {
      sendPushSubscription: {
        run: async () => {
          if (!isComponentConfigured(config)) {
            throw new Error("Push notifications module is not configured.");
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
    trackingDatasetId: string().required(),
  }).noUnknownFields(),
});

export default createPushNotifications;
