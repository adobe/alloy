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

import {
  test,
  expect,
  describe,
  vi,
  beforeEach,
  afterEach,
} from "../../helpers/testsSetup/extend.js";
import {
  sendEventHandler,
  setConsentHandler,
} from "../../helpers/mswjs/handlers.js";
import alloyConfig from "../../helpers/alloy/config.js";
import searchForLogMessage from "../../helpers/utils/searchForLogMessage.js";
import { CONSENT_IN, CONSENT_OUT } from "../../helpers/constants/consent.js";

const interactCalls = (networkRecorder) =>
  networkRecorder.calls.filter((c) =>
    /v1\/interact/.test(c.request?.url ?? ""),
  );

const flushMicrotasks = async () => {
  for (let i = 0; i < 20; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve();
  }
};

describe("Consent gating order", () => {
  let consoleSpy;

  beforeEach(() => {
    localStorage.clear();
    consoleSpy = vi.spyOn(console, "warn");
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test("events queued while consent is pending are sent in queue order after opting in", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler, setConsentHandler);
    await alloy("configure", { ...alloyConfig, defaultConsent: "pending" });

    const sends = ["first", "second", "third"].map((name) =>
      alloy("sendEvent", { xdm: { eventType: `order.${name}` } }),
    );
    await flushMicrotasks();
    expect(interactCalls(networkRecorder)).toHaveLength(0);

    await alloy("setConsent", CONSENT_IN);
    await Promise.all(sends);

    const calls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 10,
      minCalls: 3,
    });
    expect(calls.map((c) => c.request.body.events[0].xdm.eventType)).toEqual([
      "order.first",
      "order.second",
      "order.third",
    ]);
  });

  test("queued sendEvent and getIdentity both resolve with {} and warn when consent is declined", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(setConsentHandler);
    await alloy("configure", {
      ...alloyConfig,
      defaultConsent: "pending",
      debugEnabled: true,
    });

    const sendPromise = alloy("sendEvent");
    const identityPromise = alloy("getIdentity");
    await flushMicrotasks();
    await alloy("setConsent", CONSENT_OUT);

    await expect(sendPromise).resolves.toEqual({});
    await expect(identityPromise).resolves.toEqual({});
    expect(
      searchForLogMessage(
        consoleSpy,
        "The sendEvent command could not fully complete. [DataCollector] An error occurred while executing the sendEvent command.\nCaused by: The user declined consent.",
      ),
    ).toBe(true);
    expect(
      searchForLogMessage(
        consoleSpy,
        "The getIdentity command could not fully complete. [Identity] An error occurred while executing the getIdentity command.\nCaused by: The user declined consent.",
      ),
    ).toBe(true);
    expect(interactCalls(networkRecorder)).toHaveLength(0);
  });

  test("appendIdentityToUrl resolves with the url unchanged while consent is pending", async ({
    alloy,
  }) => {
    await alloy("configure", { ...alloyConfig, defaultConsent: "pending" });

    await expect(
      alloy("appendIdentityToUrl", { url: "https://example.com/" }),
    ).resolves.toEqual({ url: "https://example.com/" });
  });
});
