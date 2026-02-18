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

import { describe, it, expect, beforeEach, vi } from "vitest";
import createSendPushSubscription from "../../../../../src/lib/actions/sendPushSubscription/createSendPushSubscription";

describe("createSendPushSubscription", () => {
  let instanceManager;
  let instance;
  let sendPushSubscription;

  beforeEach(() => {
    instanceManager = {
      getInstance: vi.fn(),
    };

    instance = vi.fn();
    instanceManager.getInstance.mockReturnValue(instance);

    instance.mockResolvedValue({});

    sendPushSubscription = createSendPushSubscription({
      instanceManager,
    });
  });

  it("send push subscription", async () => {
    await sendPushSubscription({
      instanceName: "myinstance",
    });

    expect(instance).toHaveBeenCalledWith("sendPushSubscription");
  });

  it("throws error when instance is not found", async () => {
    instanceManager.getInstance.mockReturnValue(undefined);

    expect(() => {
      sendPushSubscription({
        instanceName: "myinstance",
      });
    }).toThrow(
      'Failed to send send push subscription for instance "myinstance". No instance was found with this name.',
    );
  });
});
