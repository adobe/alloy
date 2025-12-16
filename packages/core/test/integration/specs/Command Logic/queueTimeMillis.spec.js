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
import { test, expect, describe } from "../../helpers/testsSetup/extend.js";
import { sendEventHandler } from "../../helpers/mswjs/handlers.js";
import alloyConfig from "../../helpers/alloy/config.js";

describe("queueTimeMillis", () => {
  test("includes queueTimeMillis in event meta and removes timestamp from xdm", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(...[sendEventHandler]);

    await alloy("configure", alloyConfig);
    await alloy("sendEvent", {
      xdm: {
        eventType: "test.queueTime",
      },
    });

    const { request } = await networkRecorder.findCall(/edge\.adobedc\.net/);
    const event = request.body.events[0];

    expect(event.xdm.timestamp).toBeUndefined();
    expect(event.meta.queueTimeMillis).toBeGreaterThanOrEqual(0);
  });

  test("allows user to set their own timestamp via onBeforeEventSend", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(...[sendEventHandler]);

    const customTimestamp = "2025-01-15T10:00:00.000Z";

    await alloy("configure", {
      ...alloyConfig,
      onBeforeEventSend: ({ xdm }) => {
        xdm.timestamp = customTimestamp;
      },
    });
    await alloy("sendEvent", {
      xdm: {
        eventType: "test.customTimestamp",
      },
    });

    const { request } = await networkRecorder.findCall(/edge\.adobedc\.net/);
    const event = request.body.events[0];

    expect(event.xdm.timestamp).toBe(customTimestamp);
    expect(event.meta.queueTimeMillis).toBeGreaterThanOrEqual(0);
  });

  test("queueTimeMillis is merged with other event meta", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(...[sendEventHandler]);

    await alloy("configure", alloyConfig);
    await alloy("sendEvent", {
      xdm: {
        eventType: "test.metaMerge",
      },
    });

    const { request } = await networkRecorder.findCall(/edge\.adobedc\.net/);
    const event = request.body.events[0];

    expect(event.meta.queueTimeMillis).toBeGreaterThanOrEqual(0);
  });
});
