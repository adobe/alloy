/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { vi, beforeEach, describe, it, expect } from "vitest";

// The only true external boundary here is the browser's push subscription
// API, which isn't available/deterministic in a test environment. Everything
// else (storage, payload/request building, dedup logic) runs for real so the
// test exercises the actual integration between index.js and platformServices.
vi.mock(
  "../../../../../src/components/PushNotifications/helpers/getPushSubscriptionDetails.js",
  () => ({
    default: vi.fn(),
  }),
);

import createPushNotifications from "../../../../../src/components/PushNotifications/index.js";
import getPushSubscriptionDetails from "../../../../../src/components/PushNotifications/helpers/getPushSubscriptionDetails.js";

// Mirrors the real contract from createBrowserStorageService.js, where
// getItem/setItem are async (backed by localStorage/sessionStorage).
const createFakeAsyncStorage = () => {
  const cache = new Map();
  return {
    getItem: (name) =>
      Promise.resolve(cache.has(name) ? cache.get(name) : null),
    setItem: (name, value) => {
      cache.set(name, value);
      return Promise.resolve(true);
    },
  };
};

describe("PushNotifications::index", () => {
  let config;
  let persistentStorage;
  let platformServices;
  let sendEdgeNetworkRequest;

  beforeEach(() => {
    getPushSubscriptionDetails.mockReset().mockResolvedValue({
      endpoint: "https://push.example.com/subscription/abc",
      keys: { p256dh: "p256dh-key", auth: "auth-key" },
    });

    config = {
      orgId: "ABC123@AdobeOrg",
      datastreamId: "datastream-id",
      edgeDomain: "edge.adobedc.net",
      edgeBasePath: "ee",
      pushNotifications: {
        vapidPublicKey: "test-vapid-key",
        appId: "test-app-id",
        trackingDatasetId: "test-dataset-id",
      },
    };

    persistentStorage = createFakeAsyncStorage();
    platformServices = {
      storage: {
        createNamespacedStorage: vi.fn().mockReturnValue({
          persistent: persistentStorage,
          session: createFakeAsyncStorage(),
        }),
      },
    };

    sendEdgeNetworkRequest = vi.fn().mockResolvedValue();
  });

  const buildPushNotifications = () =>
    createPushNotifications({
      eventManager: {
        createEvent: () => ({ setUserData: vi.fn(), finalize: vi.fn() }),
      },
      config,
      logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
      consent: { awaitConsent: vi.fn().mockResolvedValue() },
      identity: {
        awaitIdentity: vi.fn().mockResolvedValue(),
        getEcidFromCookie: vi.fn().mockReturnValue("test-ecid"),
      },
      getBrowser: vi.fn().mockReturnValue("Chrome"),
      sendEdgeNetworkRequest,
      platformServices,
    });

  it("persists the subscription fingerprint in that storage and sends it to the edge network", async () => {
    const pushNotifications = buildPushNotifications();

    await pushNotifications.commands.sendPushSubscription.run();

    await expect(
      persistentStorage.getItem("subscriptionDetails"),
    ).resolves.toContain("test-ecid");
    expect(sendEdgeNetworkRequest).toHaveBeenCalledTimes(1);
  });

  it("does not resend to the edge network when the subscription hasn't changed", async () => {
    const pushNotifications = buildPushNotifications();

    await pushNotifications.commands.sendPushSubscription.run();
    await pushNotifications.commands.sendPushSubscription.run();

    expect(sendEdgeNetworkRequest).toHaveBeenCalledTimes(1);
  });
});
