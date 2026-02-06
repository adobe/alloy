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

vi.mock(
  "../../../../../../src/components/PushNotifications/helpers/getPushSubscriptionDetails.js",
);

import makeSendPushSubscriptionRequest from "../../../../../../src/components/PushNotifications/request/makeSendPushSubscriptionRequest.js";
import getPushSubscriptionDetails from "../../../../../../src/components/PushNotifications/helpers/getPushSubscriptionDetails.js";

describe("makeSendPushSubscriptionRequest", () => {
  let mockStorage;
  let mockLogger;
  let mockSendEdgeNetworkRequest;
  let mockSetUserData;

  beforeEach(() => {
    vi.clearAllMocks();

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

    vi.mocked(getPushSubscriptionDetails).mockResolvedValue({
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
        getEcidFromCookie: vi.fn().mockReturnValue("ecid"),
      },
      window: { location: { host: "somehost" } },
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

  it("does not make an edge call if the subscription details are not changed", async () => {
    mockStorage.cache.subscriptionDetails = 'ecid{"endpoint":"test"}';
    await callMakeSendPushSubscriptionRequest();

    expect(mockLogger.info).toHaveBeenCalledWith(
      "Subscription details have not changed. Not sending to the server.",
    );
    expect(mockSendEdgeNetworkRequest).not.toHaveBeenCalled();
  });
});
