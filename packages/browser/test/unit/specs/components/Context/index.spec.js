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

import { vi, beforeEach, afterEach, describe, it, expect } from "vitest";
import createContext from "../../../../../src/components/Context/index.js";
import createEvent from "@adobe/alloy-core/core/createEvent.js";

describe("Context::index", () => {
  const logger = {
    log() {},
    warn() {},
  };

  const sendThroughContext = async (context) => {
    const component = createContext({ config: { context }, logger });
    const event = createEvent();
    await component.lifecycle.onBeforeEvent({ event });
    event.finalize();
    return event.toJSON().xdm;
  };

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-03-04T05:06:07.890Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("leaves the timestamp out when serverSideTimestamp is configured", async () => {
    const xdm = await sendThroughContext(["web", "serverSideTimestamp"]);

    expect(xdm).not.toHaveProperty("timestamp");
  });

  it("sends the client time as the timestamp by default", async () => {
    const xdm = await sendThroughContext([
      "web",
      "device",
      "environment",
      "placeContext",
    ]);

    expect(xdm.timestamp).toBe("2026-03-04T05:06:07.890Z");
  });

  it("still sends implementation details when serverSideTimestamp is configured", async () => {
    const xdm = await sendThroughContext(["serverSideTimestamp"]);

    expect(xdm.implementationDetails.name).toBe(
      "https://ns.adobe.com/experience/alloy",
    );
  });
});
