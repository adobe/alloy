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

import { vi, beforeEach, describe, it, expect } from "vitest";
import getPushSubscriptionDetails from "../../../../../../src/components/PushNotifications/helpers/getPushSubscriptionDetails.js";

describe("getPushSubscriptionDetails", () => {
  let mockWindow;
  let mockNavigator;
  let mockServiceWorkerRegistration;
  let mockPushManager;
  let mockSubscription;
  let vapidPublicKey;

  beforeEach(() => {
    vapidPublicKey =
      "BEl62iUYgUivxIkv69yViEuiBIa40HI5hmjHbKPlXO_QK_Mu-GZyaL6u0Znn_LO2Z0qBHRo-vHQ6PFgZdmkX0l4";

    mockSubscription = {
      endpoint: "https://fcm.googleapis.com/fcm/send/test-endpoint",
      getKey: vi.fn(),
      unsubscribe: vi.fn(),
    };

    mockPushManager = {
      subscribe: vi.fn(),
      getSubscription: vi.fn(),
    };

    mockServiceWorkerRegistration = {
      pushManager: mockPushManager,
    };

    mockNavigator = {
      serviceWorker: {
        getRegistration: vi.fn(),
      },
    };

    mockNavigator.serviceWorker.getRegistration.mockResolvedValue(
      mockServiceWorkerRegistration,
    );

    mockWindow = {
      navigator: mockNavigator,
      PushManager: () => {},
      Notification: {
        permission: "granted",
      },
    };

    mockSubscription.getKey.mockImplementation((type) => {
      if (type === "p256dh") {
        return new Uint8Array([1, 2, 3, 4]);
      }
      if (type === "auth") {
        return new Uint8Array([5, 6, 7, 8]);
      }
      return null;
    });
    mockPushManager.subscribe.mockResolvedValue(mockSubscription);
  });

  describe("throws error", () => {
    it("when service workers are not supported", async () => {
      delete mockWindow.navigator.serviceWorker;

      await expect(
        getPushSubscriptionDetails({ vapidPublicKey, window: mockWindow }),
      ).rejects.toThrow("Service workers are not supported in this browser.");
    });

    it("when PushManager is not supported", async () => {
      delete mockWindow.PushManager;

      await expect(
        getPushSubscriptionDetails({ vapidPublicKey, window: mockWindow }),
      ).rejects.toThrow(
        "Push notifications are not supported in this browser.",
      );
    });

    it("when Notification is not supported", async () => {
      delete mockWindow.Notification;

      await expect(
        getPushSubscriptionDetails({ vapidPublicKey, window: mockWindow }),
      ).rejects.toThrow(
        "Push notifications are not supported in this browser.",
      );
    });

    it("when notification permission is not granted", async () => {
      mockWindow.Notification.permission = "denied";

      await expect(
        getPushSubscriptionDetails({ vapidPublicKey, window: mockWindow }),
      ).rejects.toThrow(
        "The user has not given permission to send push notifications.",
      );
    });

    it("when notification permission is default", async () => {
      mockWindow.Notification.permission = "default";

      await expect(
        getPushSubscriptionDetails({ vapidPublicKey, window: mockWindow }),
      ).rejects.toThrow(
        "The user has not given permission to send push notifications.",
      );
    });

    it("when no service worker registration is found", async () => {
      mockNavigator.serviceWorker.getRegistration.mockResolvedValue(null);

      await expect(
        getPushSubscriptionDetails({ vapidPublicKey, window: mockWindow }),
      ).rejects.toThrow("No service worker registration was found.");
    });

    for (const [key, value] of Object.entries({
      "is not provided": "",
      "is null": null,
      "is undefined": undefined,
    })) {
      it(`when VAPID public key ${key}`, async () => {
        await expect(
          getPushSubscriptionDetails({
            vapidPublicKey: value,
            window: mockWindow,
          }),
        ).rejects.toThrow("No VAPID public key was provided.");
      });
    }
  });

  describe("successful subscription", () => {
    it("returns subscription details when subscribe succeeds", async () => {
      const result = await getPushSubscriptionDetails({
        vapidPublicKey,
        window: mockWindow,
      });

      expect(result).toEqual({
        endpoint: "https://fcm.googleapis.com/fcm/send/test-endpoint",
        keys: {
          p256dh: "AQIDBA==",
          auth: "BQYHCA==",
        },
      });

      expect(mockPushManager.subscribe).toHaveBeenCalledWith({
        userVisibleOnly: true,
        applicationServerKey: expect.any(Uint8Array),
      });
    });

    it("calls subscribe with correct VAPID key converted to bytes", async () => {
      await getPushSubscriptionDetails({ vapidPublicKey, window: mockWindow });

      const subscribeCall = mockPushManager.subscribe.mock.calls[0][0];
      expect(subscribeCall.applicationServerKey).toBeInstanceOf(Uint8Array);
      expect(subscribeCall.userVisibleOnly).toBe(true);
    });
  });

  describe("error recovery", () => {
    it("recovers from subscription error by unsubscribing and retrying", async () => {
      const subscriptionError = new Error("Subscription failed");
      const existingSubscription = {
        unsubscribe: vi.fn().mockResolvedValue(true),
      };

      // First call fails
      mockPushManager.subscribe.mockRejectedValueOnce(subscriptionError);
      // getSubscription returns existing subscription
      mockPushManager.getSubscription.mockResolvedValueOnce(
        existingSubscription,
      );
      // Second call succeeds
      mockPushManager.subscribe.mockResolvedValueOnce(mockSubscription);

      const result = await getPushSubscriptionDetails({
        vapidPublicKey,
        window: mockWindow,
      });

      expect(result).toEqual({
        endpoint: "https://fcm.googleapis.com/fcm/send/test-endpoint",
        keys: {
          p256dh: "AQIDBA==",
          auth: "BQYHCA==",
        },
      });
    });

    it("throws original error when no existing subscription found", async () => {
      const subscriptionError = new Error("Subscription failed");

      mockPushManager.subscribe.mockRejectedValueOnce(subscriptionError);
      mockPushManager.getSubscription.mockResolvedValueOnce(null);

      await expect(
        getPushSubscriptionDetails({ vapidPublicKey, window: mockWindow }),
      ).rejects.toThrow("Subscription failed");

      expect(mockPushManager.subscribe).toHaveBeenCalledTimes(1);
      expect(mockPushManager.getSubscription).toHaveBeenCalledTimes(1);
    });
  });
});
