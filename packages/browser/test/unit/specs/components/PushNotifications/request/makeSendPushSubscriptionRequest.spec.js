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

import makeSendPushSubscriptionRequest from "../../../../../../src/components/PushNotifications/request/makeSendPushSubscriptionRequest.js";
import saveToIndexedDb from "../../../../../../src/components/PushNotifications/helpers/saveToIndexedDb.js";

vi.mock(
  "../../../../../../src/components/PushNotifications/helpers/saveToIndexedDb.js",
  () => ({ default: vi.fn() }),
);

describe("makeSendPushSubscriptionRequest", () => {
  let mockStorage;
  let mockLogger;
  let mockSendEdgeNetworkRequest;
  let mockSetUserData;
  let mockGetPushSubscriptionDetails;
  let mockNoEcid;

  beforeEach(() => {
    mockNoEcid = false;

    saveToIndexedDb.mockReset();
    saveToIndexedDb.mockResolvedValue(true);

    mockStorage = {
      cache: {},
      // eslint-disable-next-line func-names
      getItem: function (key) {
        return this.cache[key];
      },
      // eslint-disable-next-line func-names
      setItem: function (key, value) {
        this.cache[key] = value;
      },
    };

    mockLogger = {
      info: vi.fn(),
    };

    mockSendEdgeNetworkRequest = vi.fn().mockResolvedValue();

    mockGetPushSubscriptionDetails = vi.fn().mockResolvedValue({
      endpoint: "test",
    });
  });

  const callMakeSendPushSubscriptionRequest = () => {
    mockSetUserData = vi.fn();
    return makeSendPushSubscriptionRequest({
      config: {
        vapidPublicKey: "test-vapid-key",
        appId: "test-app-id",
      },
      storage: mockStorage,
      logger: mockLogger,
      sendEdgeNetworkRequest: mockSendEdgeNetworkRequest,
      consent: {
        awaitConsent: vi.fn().mockResolvedValue(),
      },
      eventManager: {
        createEvent: () => ({
          setUserData: mockSetUserData,
          finalize: vi.fn(),
        }),
      },
      identity: {
        awaitIdentity: vi.fn().mockResolvedValue(),
        getEcidFromCookie: vi
          .fn()
          .mockReturnValue(mockNoEcid ? undefined : "ecid"),
      },
      window: { location: { host: "somehost" } },
      getPushSubscriptionDetails: mockGetPushSubscriptionDetails,
    });
  };

  it("makes an edge call with the subscription details", async () => {
    mockStorage.cache.subscriptionDetails = 'ecid{"endpoint":"oldtest"}';

    await callMakeSendPushSubscriptionRequest();
    expect(mockSendEdgeNetworkRequest).toHaveBeenCalled();
    expect(
      mockSetUserData.mock.calls[0][0].pushNotificationDetails[0].token,
    ).not.toContain("ecid");
  });

  it("caches the subscription details after the ECID is saved to IndexedDB", async () => {
    await callMakeSendPushSubscriptionRequest();

    expect(saveToIndexedDb).toHaveBeenCalledWith({ ecid: "ecid" }, mockLogger);
    expect(mockStorage.cache.subscriptionDetails).toBe(
      'ecid{"endpoint":"test"}',
    );
  });

  it("does not cache the subscription details when the IndexedDB save fails", async () => {
    saveToIndexedDb.mockResolvedValue(false);

    await callMakeSendPushSubscriptionRequest();

    expect(mockSendEdgeNetworkRequest).toHaveBeenCalledTimes(1);
    expect(mockStorage.cache.subscriptionDetails).toBeUndefined();
  });

  it("self-heals on the next call after a failed IndexedDB save", async () => {
    saveToIndexedDb.mockResolvedValueOnce(false);

    // First call: send succeeds but the ECID save fails, so nothing is cached.
    await callMakeSendPushSubscriptionRequest();
    expect(mockStorage.cache.subscriptionDetails).toBeUndefined();

    // Second call: the dedupe check does not short-circuit, so it sends again
    // and, now that the save succeeds, caches the subscription details.
    await callMakeSendPushSubscriptionRequest();

    expect(mockSendEdgeNetworkRequest).toHaveBeenCalledTimes(2);
    expect(mockStorage.cache.subscriptionDetails).toBe(
      'ecid{"endpoint":"test"}',
    );
  });

  it("does not make an edge call if the subscription details are not changed", async () => {
    mockStorage.cache.subscriptionDetails = 'ecid{"endpoint":"test"}';
    await callMakeSendPushSubscriptionRequest();

    expect(mockLogger.info).toHaveBeenCalledWith(
      "Subscription details have not changed. Not sending to the server.",
    );
    expect(mockSendEdgeNetworkRequest).not.toHaveBeenCalled();
  });

  it("does not make an edge call when no ECID is available", async () => {
    mockNoEcid = true;

    await callMakeSendPushSubscriptionRequest();

    expect(mockLogger.info).toHaveBeenCalledWith(
      "No ECID is available. Not sending push subscription details to the server.",
    );
    expect(mockSendEdgeNetworkRequest).not.toHaveBeenCalled();
  });
});
