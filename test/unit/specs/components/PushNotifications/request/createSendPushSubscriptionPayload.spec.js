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
  "../../../../../../src/utils/request/createDataCollectionRequestPayload.js",
);

import createSendPushSubscriptionPayload from "../../../../../../src/components/PushNotifications/request/createSendPushSubscriptionPayload.js";
import createDataCollectionRequestPayload from "../../../../../../src/utils/request/createDataCollectionRequestPayload.js";

describe("createSendPushSubscriptionPayload", () => {
  let mockEvent;
  let mockEventManager;
  let mockPayload;
  let mockWindow;
  let ecid;
  let serializedPushSubscriptionDetails;

  beforeEach(() => {
    vi.clearAllMocks();

    ecid = "12345678901234567890123456789012345678";
    serializedPushSubscriptionDetails = JSON.stringify({
      endpoint: "https://fcm.googleapis.com/fcm/send/test-endpoint",
      keys: {
        p256dh: "test-p256dh-key",
        auth: "test-auth-key",
      },
    });

    mockEvent = {
      setUserData: vi.fn(),
      finalize: vi.fn(),
    };

    mockEventManager = {
      createEvent: vi.fn().mockReturnValue(mockEvent),
    };

    mockPayload = {
      addEvent: vi.fn(),
    };

    mockWindow = {
      location: {
        host: "example.com",
      },
    };

    vi.mocked(createDataCollectionRequestPayload).mockReturnValue(mockPayload);
  });

  it("creates event with correct push notification details", async () => {
    await createSendPushSubscriptionPayload({
      ecid,
      eventManager: mockEventManager,
      serializedPushSubscriptionDetails,
      window: mockWindow,
    });

    expect(mockEvent.setUserData).toHaveBeenCalledWith({
      pushNotificationDetails: [
        {
          appID: "example.com",
          token: serializedPushSubscriptionDetails,
          platform: "web",
          denylisted: false,
          identity: {
            namespace: {
              code: "ECID",
            },
            id: ecid,
          },
        },
      ],
    });
  });
});
