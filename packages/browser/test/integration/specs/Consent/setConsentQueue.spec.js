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

import { http, HttpResponse } from "msw";
import { vi } from "vitest";
import { test, expect, describe } from "../../helpers/testsSetup/extend.js";
import {
  sendEventHandler,
  setConsentHandler,
} from "../../helpers/mswjs/handlers.js";
import alloyConfig from "../../helpers/alloy/config.js";
import { CONSENT_IN, CONSENT_OUT } from "../../helpers/constants/consent.js";

const SET_CONSENT =
  /https:\/\/edge\.adobedc\.net\/ee\/(?:[^/]+\/)?v1\/privacy\/set-consent/;
const INTERACT = /https:\/\/edge\.adobedc\.net\/ee\/.*\/?v1\/interact/;

const config = { ...alloyConfig, defaultConsent: "pending" };

const settle = async (promise) => {
  try {
    return { value: await promise };
  } catch (error) {
    return { error };
  }
};

// Handles the first `failures` set-consent requests, then falls through to the
// next handler. `log` records when each request started and finished. The first
// request stays in flight until `releaseFirst` is called.
const scriptedSetConsent = ({ failures = 0 } = {}) => {
  const log = [];
  let count = 0;
  let releaseFirst;
  const firstGate = new Promise((resolve) => {
    releaseFirst = resolve;
  });
  const handler = http.post(SET_CONSENT, async () => {
    count += 1;
    const index = count;
    log.push(`start ${index}`);
    if (index === 1) {
      await firstGate;
    }
    log.push(`end ${index}`);
    if (index <= failures) {
      return HttpResponse.json(
        { errors: [{ code: "status-500" }] },
        { status: 500 },
      );
    }
    return undefined;
  });
  const releaseWhenStarted = async () => {
    await vi.waitFor(() => expect(log).toContain("start 1"));
    releaseFirst();
  };
  return { handler, log, releaseWhenStarted };
};

const interactRequests = (worker) => {
  const requests = [];
  worker.use(
    http.post(INTERACT, () => {
      requests.push(Date.now());
    }),
  );
  return requests;
};

describe("setConsent queueing", () => {
  test("sends the second set-consent request only after the first has responded", async ({
    alloy,
    worker,
  }) => {
    const { handler, log, releaseWhenStarted } = scriptedSetConsent();
    worker.use(handler, setConsentHandler);
    await alloy("configure", config);

    await Promise.all([
      alloy("setConsent", CONSENT_IN),
      alloy("setConsent", CONSENT_OUT),
      releaseWhenStarted(),
    ]);

    expect(log).toEqual(["start 1", "end 1", "start 2", "end 2"]);
  });

  test("sends only one set-consent request for identical concurrent setConsent calls", async ({
    alloy,
    worker,
  }) => {
    const { handler, log, releaseWhenStarted } = scriptedSetConsent();
    worker.use(handler, setConsentHandler);
    await alloy("configure", config);

    await Promise.all([
      alloy("setConsent", CONSENT_IN),
      alloy("setConsent", CONSENT_IN),
      releaseWhenStarted(),
    ]);

    expect(log).toEqual(["start 1", "end 1"]);
  });

  test("sends a later set-consent request after an earlier one failed", async ({
    alloy,
    worker,
  }) => {
    const { handler, log, releaseWhenStarted } = scriptedSetConsent({
      failures: 1,
    });
    worker.use(handler, setConsentHandler);
    await alloy("configure", config);

    const [first, second] = await Promise.all([
      settle(alloy("setConsent", CONSENT_IN)),
      settle(alloy("setConsent", CONSENT_OUT)),
      releaseWhenStarted(),
    ]);

    expect(first.error.message).toContain(
      "The server responded with a status code 500",
    );
    expect(second.error).toBeUndefined();
    expect(log).toEqual(["start 1", "end 1", "start 2", "end 2"]);
  });

  test("sends an event after a failed set-consent followed by a successful consent in", async ({
    alloy,
    worker,
  }) => {
    const { handler, releaseWhenStarted } = scriptedSetConsent({ failures: 1 });
    worker.use(handler, sendEventHandler, setConsentHandler);
    const requests = interactRequests(worker);
    await alloy("configure", config);

    await Promise.all([
      settle(alloy("setConsent", CONSENT_OUT)),
      settle(alloy("setConsent", CONSENT_IN)),
      releaseWhenStarted(),
    ]);
    await alloy("sendEvent");

    expect(requests).toHaveLength(1);
  });

  test("resolves an event with {} and sends nothing after a failed set-consent followed by a successful consent out", async ({
    alloy,
    worker,
  }) => {
    const { handler, releaseWhenStarted } = scriptedSetConsent({ failures: 1 });
    worker.use(handler, sendEventHandler, setConsentHandler);
    const requests = interactRequests(worker);
    await alloy("configure", config);

    await Promise.all([
      settle(alloy("setConsent", CONSENT_IN)),
      settle(alloy("setConsent", CONSENT_OUT)),
      releaseWhenStarted(),
    ]);
    const result = await alloy("sendEvent");

    expect(result).toEqual({});
    expect(requests).toHaveLength(0);
  });
});
