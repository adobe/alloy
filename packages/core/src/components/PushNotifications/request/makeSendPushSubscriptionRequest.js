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

/** @import { Storage } from '../../../utils/types.js' */
/** @import { EventManager, Logger } from '../../../core/types.js' */
/** @import { IdentityManager } from '../../../core/identity/types.js' */
/** @import { ConsentManager } from '../../../core/consent/types.js' */
/** @import { EdgeRequestExecutor } from '../../../core/edgeNetwork/types.js' */

import { sortObjectKeysRecursively } from "../../../utils";
import getPushSubscriptionDetails from "../helpers/getPushSubscriptionDetails";
import createSendPushSubscriptionRequest from "./createSendPushSubscriptionRequest";
import createSendPushSubscriptionPayload from "./createSendPushSubscriptionPayload";
import saveToIndexedDb from "../helpers/saveToIndexedDb";

const SUBSCRIPTION_DETAILS = "subscriptionDetails";

/**
 * Retrieves and returns push subscription details with sorted object keys.
 *
 * This function gets the push subscription details using the provided VAPID public key
 * and returns the details with all object keys sorted recursively for consistent output.
 *
 * @async
 * @function
 *
 * @param {Object} options
 * @param {{vapidPublicKey: string, appId: string}} options.config
 * @param {Storage} options.storage
 * @param {Logger} options.logger
 * @param {EventManager} options.eventManager
 * @param {IdentityManager} options.identity
 * @param {EdgeRequestExecutor} options.sendEdgeNetworkRequest
 * @param {ConsentManager} options.consent
 * @param {Window} options.window
 *
 * @returns {Promise<void>}
 */
export default async ({
  config: { vapidPublicKey, appId },
  storage,
  logger,
  sendEdgeNetworkRequest,
  consent,
  eventManager,
  identity,
  window,
}) => {
  await identity.awaitIdentity();
  const ecid = identity.getEcidFromCookie();

  const pushSubscriptionDetails = await getPushSubscriptionDetails({
    vapidPublicKey,
    window,
  });

  const serializedPushSubscriptionDetails = JSON.stringify(
    sortObjectKeysRecursively(pushSubscriptionDetails),
  );

  const cacheValue = `${ecid}${serializedPushSubscriptionDetails}`;

  if (cacheValue === storage.getItem(SUBSCRIPTION_DETAILS)) {
    logger.info(
      "Subscription details have not changed. Not sending to the server.",
    );

    return;
  }

  storage.setItem(SUBSCRIPTION_DETAILS, cacheValue);

  const payload = await createSendPushSubscriptionPayload({
    eventManager,
    ecid,
    serializedPushSubscriptionDetails,
    appId,
  });

  const request = createSendPushSubscriptionRequest({
    payload,
  });

  await consent.awaitConsent();
  await sendEdgeNetworkRequest({ request });

  await saveToIndexedDb({ ecid }, logger);
};
