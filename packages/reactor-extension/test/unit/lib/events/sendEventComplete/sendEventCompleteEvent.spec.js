/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { describe, it, expect, vi } from "vitest";
import createSendEventComplete from "../../../../../src/lib/events/sendEventComplete/createSendEventComplete";

describe("SendEvent complete event", () => {
  it("should add a trigger in the callbackStorage", () => {
    const trigger = () => {};
    const sendEventCallbackStorage = {
      add: vi.fn(),
    };

    const sendEventComplete = createSendEventComplete({
      sendEventCallbackStorage,
    });

    sendEventComplete({}, trigger);

    expect(sendEventCallbackStorage.add).toHaveBeenCalledWith(trigger);
    expect(sendEventCallbackStorage.add).toHaveBeenCalledTimes(1);
  });
});
