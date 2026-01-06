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
import {
  sendEventHandler,
  setConsentHandler,
} from "../../helpers/mswjs/handlers.js";
import alloyConfig from "../../helpers/alloy/config.js";

describe("queueTimeMillis", () => {
  test("includes queueTimeMillis in request meta", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", alloyConfig);
    await alloy("sendEvent", {
      xdm: {
        eventType: "test.queueTime",
      },
    });

    const { request } = await networkRecorder.findCall(/edge\.adobedc\.net/);

    expect(request.body.meta.queueTimeMillis).toBeGreaterThanOrEqual(0);
  });

  test("allows user to set their own timestamp via onBeforeEventSend", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

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
    expect(request.body.meta.queueTimeMillis).toBeGreaterThanOrEqual(0);
  });

  test("queueTimeMillis reflects time waiting for consent", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler, setConsentHandler);

    const waitTimeMs = 200;

    await alloy("configure", {
      ...alloyConfig,
      defaultConsent: "pending",
    });

    const sendEventPromise = alloy("sendEvent", {
      xdm: {
        eventType: "test.consentDelay",
      },
    });

    await new Promise((resolve) => setTimeout(resolve, waitTimeMs));

    await alloy("setConsent", {
      consent: [
        {
          standard: "Adobe",
          version: "1.0",
          value: { general: "in" },
        },
      ],
    });

    await sendEventPromise;

    const { request } = await networkRecorder.findCall(/v1\/interact/);

    expect(request.body.meta.queueTimeMillis).toBeGreaterThanOrEqual(
      waitTimeMs,
    );
  });

  test("queueTimeMillis reflects time waiting for identity", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", alloyConfig);

    await Promise.all([
      alloy("sendEvent", { xdm: { eventType: "test.first" } }),
      alloy("sendEvent", { xdm: { eventType: "test.second" } }),
      alloy("sendEvent", { xdm: { eventType: "test.third" } }),
    ]);

    const calls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 10,
    });

    expect(calls.length).toBe(3);

    calls.forEach((call) => {
      expect(call.request.body.meta.queueTimeMillis).toBeGreaterThanOrEqual(0);
    });
  });
});
