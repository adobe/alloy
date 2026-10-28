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

import type {
  ComponentCreator,
  ComponentTools,
  Config,
} from "@adobe/alloy-core/core/types.js";
import { objectOf, string } from "@adobe/alloy-core/utils/validation";
import { sanitizeOrgIdForCookieName } from "@adobe/alloy-core/utils";
import makeSendPushSubscriptionRequest from "./request/makeSendPushSubscriptionRequest.js";
import saveToIndexedDb from "./helpers/saveToIndexedDb.js";

/** The computed configuration, with the options `configValidators` adds. */
interface PushNotificationsConfig extends Config {
  pushNotifications?: {
    vapidPublicKey?: string;
    appId?: string;
    trackingDatasetId?: string;
  };
}

/** A config with every option push notifications needs. */
type ConfiguredPushNotificationsConfig = PushNotificationsConfig & {
  pushNotifications: {
    vapidPublicKey: string;
    appId: string;
    trackingDatasetId: string;
  };
};

type PushNotificationsOptions = Pick<
  ComponentTools,
  | "eventManager"
  | "config"
  | "logger"
  | "consent"
  | "identity"
  | "getBrowser"
  | "sendEdgeNetworkRequest"
  | "platformServices"
>;

const isComponentConfigured = (
  config: PushNotificationsConfig,
): config is ConfiguredPushNotificationsConfig => {
  const {
    orgId,
    pushNotifications: { vapidPublicKey, appId, trackingDatasetId } = {
      vapidPublicKey: undefined,
      appId: undefined,
      trackingDatasetId: undefined,
    },
  } = config;
  return Boolean(orgId && vapidPublicKey && appId && trackingDatasetId);
};

const createPushNotifications: ComponentCreator<PushNotificationsOptions> = ({
  eventManager,
  config: baseConfig,
  logger,
  consent,
  identity,
  getBrowser,
  sendEdgeNetworkRequest,
  platformServices,
}) => {
  // configValidators adds the pushNotifications option to the computed config.
  const config = baseConfig as PushNotificationsConfig;
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
            pushNotifications: { vapidPublicKey, appId },
          } = config;

          const storage = platformServices.storage.createNamespacedStorage(
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
