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

/** @import { PushSubscription } from '../types.js' */

import { base64ToBytes, bytesToBase64 } from "../../../utils/index.js";

/**
 * Gets push subscription details for the current browser.
 *
 * @async
 * @function
 *
 * @param {object} options
 * @param {string} options.vapidPublicKey - The VAPID public key in base64 format used for push notification authentication.
 * @param {Window} options.window
 *
 * @returns {Promise<PushSubscription>} A promise that resolves to an object containing the push subscription details.

 * @throws {Error} Throws an error if service workers are not supported in the browser.
 * @throws {Error} Throws an error if user didn't approve push notifications for the domain.
 * @throws {Error} Throws an error if push notifications are not supported in the browser.
 * @throws {Error} Throws an error if no VAPID public key was provided.
 *
 * @example
 * // Get subscription details with VAPID key
 * const vapidKey = "BEl62iUYgUivxIkv69yViEuiBIa40HI5hmjHbKPlXO...";
 * const subscription = await getPushSubscriptionDetails(vapidKey);
 * console.log(subscription.endpoint); // "https://fcm.googleapis.com/fcm/send/..."
 */
const getPushSubscriptionDetails = async ({ vapidPublicKey, window }) => {
  if (!("serviceWorker" in window.navigator)) {
    throw new Error("Service workers are not supported in this browser.");
  }

  if (!("PushManager" in window) || !("Notification" in window)) {
    throw new Error("Push notifications are not supported in this browser.");
  }

  /** @type {object} */
  const notification = window.Notification;
  if (notification.permission !== "granted") {
    throw new Error(
      "The user didn't grant permissions for push notifications.",
    );
  }

  const serviceWorkerRegistration =
    // eslint-disable-next-line compat/compat
    await window.navigator.serviceWorker.getRegistration();

  if (!serviceWorkerRegistration) {
    throw new Error("No service worker registration was found.");
  }

  // Even `applicationServerKey` is not required in the spec, some browsers like Chrome are requiring it.
  if (!vapidPublicKey) {
    throw new Error("No VAPID public key was provided.");
  }

  const subscriptionOptions = {
    userVisibleOnly: true,
    applicationServerKey: base64ToBytes(vapidPublicKey),
  };

  // Push subscription handling strategy:
  //
  // 1. We always call subscribe() to either get the current subscription or create a new one.
  //    - If called with the same VAPID key as an existing subscription, it returns that subscription
  //    - If called with a different VAPID key when a subscription exists, it throws an error
  //
  // 2. Error handling approach:
  //    - Browser error messages vary and don't clearly indicate VAPID key conflicts
  //    - When subscribe() fails, we assume it's likely due to a VAPID key mismatch
  //    - We attempt recovery by unsubscribing the existing subscription and retrying
  //    - If the retry also fails, we re-throw the original error
  //
  // This strategy ensures we can handle both new subscriptions and VAPID key changes
  // while gracefully falling back to error reporting when recovery isn't possible.
  try {
    const subscription =
      await serviceWorkerRegistration.pushManager.subscribe(
        subscriptionOptions,
      );

    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: bytesToBase64(new Uint8Array(subscription.getKey("p256dh"))),
        auth: bytesToBase64(new Uint8Array(subscription.getKey("auth"))),
      },
    };
  } catch (e) {
    const subscription =
      await serviceWorkerRegistration.pushManager.getSubscription();
    if (!subscription) {
      throw e;
    }

    const unsubscribeResult = await subscription.unsubscribe();
    if (!unsubscribeResult) {
      throw e;
    }

    return getPushSubscriptionDetails({ vapidPublicKey, window });
  }
};

export default getPushSubscriptionDetails;
