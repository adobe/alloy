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
import { http, HttpResponse } from "msw";
import {
  sendEventHandler,
  setConsentHandler,
} from "../../helpers/mswjs/handlers.js";
import alloyConfig from "../../helpers/alloy/config.js";
import reloadAlloy from "../../helpers/alloy/reload.js";
import searchForLogMessage from "../../helpers/utils/searchForLogMessage.js";
import { withTemporaryUrl } from "../../helpers/utils/location.js";
import waitFor from "../../helpers/utils/waitFor.js";
import {
  CONSENT_IN,
  CONSENT_OUT,
  ADOBE2_IN,
  ADOBE2_OUT,
} from "../../helpers/constants/consent.js";
import {
  MAIN_IDENTITY_COOKIE_NAME,
  MAIN_CONSENT_COOKIE_NAME,
} from "../../helpers/constants/cookies.js";

// Writes the identity cookie so doesIdentityCookieExist() returns true after sendEvent
const sendEventWithIdentityHandler = http.post(
  /https:\/\/edge\.adobedc\.net\/ee\/.*\/?v1\/interact/,
  async ({ request }) => {
    const url = new URL(request.url);
    const configId = url.searchParams.get("configId");
    if (
      configId &&
      configId.startsWith("bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83")
    ) {
      return HttpResponse.json({
        requestId: "send-event-identity-response",
        handle: [
          {
            payload: [
              {
                id: "41861666193140161934276845651148876988",
                namespace: { code: "ECID" },
              },
            ],
            type: "identity:result",
          },
          {
            payload: [
              {
                key: MAIN_IDENTITY_COOKIE_NAME,
                value:
                  "CiY0MTg2MTY2NjE5MzE0MDE2MTkzNDI3Njg0NTY1MTE0ODg3Njk4OFIQCM68vcXoMhgBKgNPUjIwAaAB0ry9xegysAHCqAHwAc68vcXoMg==",
                maxAge: 34128000,
                attrs: { SameSite: "None" },
              },
              {
                key: "kndctr_5BFE274A5F6980A50A495C08_AdobeOrg_cluster",
                value: "or2",
                maxAge: 1800,
              },
            ],
            type: "state:store",
          },
        ],
      });
    }
    throw new Error("Handler not configured properly");
  },
);

describe("Consent", () => {
  // Consent hashes are stored in localStorage; cookies are already cleared by
  // the `alloy` fixture (extend.js) before each test.
  beforeEach(() => {
    localStorage.clear();
  });

  // C2593: Event command sets consent to in
  test("C2593: queued event is sent after user opts in", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler, setConsentHandler);

    await alloy("configure", {
      ...alloyConfig,
      defaultConsent: "pending",
    });

    // Fire and don't await — event should be queued while consent is pending
    const sendEventPromise = alloy("sendEvent");

    // Before consent, no interact calls should have been made
    expect(
      networkRecorder.calls.filter((c) =>
        /v1\/interact/.test(c.request?.url ?? ""),
      ).length,
    ).toBe(0);

    // Set consent to in — should unblock the queued event
    await alloy("setConsent", CONSENT_IN);

    // Now await the queued event
    await sendEventPromise;

    const calls = await networkRecorder.findCalls(/v1\/interact/);
    expect(calls.length).toBe(1);
    expect(calls[0].response.status).toBeGreaterThanOrEqual(200);
    expect(calls[0].response.status).toBeLessThanOrEqual(207);
  });

  // C2594: Event command resolves promise with empty object if user consents to no purposes
  describe("C2594: sendEvent resolves with empty object when user opts out", () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, "warn");
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    test("queued event resolves with {} and logs warning when consent is out", async ({
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

      // Fire event — it should queue
      const sendEventPromise = alloy("sendEvent");

      // Opt out — queued event should resolve with {}
      await alloy("setConsent", CONSENT_OUT);

      const result = await sendEventPromise;
      // alloy resolves with an object containing empty arrays when consent is out
      expect(result.propositions ?? []).toEqual([]);
      expect(result.decisions ?? []).toEqual([]);
      expect(result).toEqual({});

      expect(
        searchForLogMessage(consoleSpy, "The user declined consent."),
      ).toBe(true);

      // No interact calls should have been made
      expect(
        networkRecorder.calls.filter((c) =>
          /v1\/interact/.test(c.request?.url ?? ""),
        ).length,
      ).toBe(0);
    });
  });

  // C2660: Context data is captured before user consents
  test("C2660: context data is captured at queue time, not at consent time", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler, setConsentHandler);

    await withTemporaryUrl(async ({ currentHref, applyUrl }) => {
      await alloy("configure", {
        ...alloyConfig,
        defaultConsent: "pending",
      });

      const sendEventPromise = alloy("sendEvent");

      // flush promise chain so that the event is in the "awaiting consent" state.
      await waitFor(0);

      // Change something that will be collected by the Context component,
      // after the event was queued but before consent unblocks it.
      const hashUrl = new URL(currentHref);
      hashUrl.hash = "foo";
      applyUrl(hashUrl);

      // Set consent to in — should unblock the queued event
      await alloy("setConsent", CONSENT_IN);
      await sendEventPromise;

      // Send another event to make sure the hash is collected normally
      await alloy("sendEvent");

      const calls = await networkRecorder.findCalls(/v1\/interact/, {
        retries: 10,
        minCalls: 2,
      });
      expect(calls.length).toBe(2);

      const getUrl = (call) =>
        call.request.body.events[0].xdm.web.webPageDetails.URL;
      // The first event's context was captured before the hash change.
      expect(getUrl(calls[0])).toBe(currentHref);
      // The second event's context reflects the hash change.
      expect(getUrl(calls[1])).toBe(hashUrl.toString());
    });
  });

  // C14404: User can consent to all purposes after consenting to no purposes
  test("C14404: user can switch from out to in", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler, setConsentHandler);

    await alloy("configure", {
      ...alloyConfig,
      defaultConsent: "pending",
      debugEnabled: true,
    });

    await alloy("setConsent", CONSENT_OUT);
    await alloy("setConsent", CONSENT_IN);

    const consentCalls = await networkRecorder.findCalls(
      /v1\/privacy\/set-consent/,
      { retries: 10, minCalls: 2 },
    );
    expect(consentCalls.length).toBe(2);

    // After switching back to in, sendEvent should succeed
    await alloy("sendEvent");
    const interactCalls = await networkRecorder.findCalls(/v1\/interact/);
    expect(interactCalls.length).toBe(1);
  });

  // C14405: Unidentified user can consent to all purposes
  test("C14405: unidentified user can consent to all purposes and send events", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler, setConsentHandler);

    await alloy("configure", {
      ...alloyConfig,
      defaultConsent: "pending",
      debugEnabled: true,
    });

    await alloy("setConsent", CONSENT_IN);
    await alloy("sendEvent");

    const calls = await networkRecorder.findCalls(/v1\/interact/);
    expect(calls.length).toBe(1);

    const body = calls[0].request.body;
    const bodyStr = JSON.stringify(body);
    expect(bodyStr).toContain('"name":"https://ns.adobe.com/experience/alloy"');
  });

  // C14406: Unidentified user can consent to no purposes
  describe("C14406: sendEvent is blocked when user consents to no purposes", () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, "warn");
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    test("sendEvent logs warning and sends no request after opting out", async ({
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

      await alloy("setConsent", CONSENT_OUT);
      await alloy("sendEvent");

      expect(searchForLogMessage(consoleSpy, "declined consent")).toBe(true);

      expect(
        networkRecorder.calls.filter((c) =>
          /v1\/interact/.test(c.request?.url ?? ""),
        ).length,
      ).toBe(0);
    });
  });

  // C14407: Consenting to all purposes should be persisted across "reload"
  test("C14407: consenting to all purposes persists across simulated page reload", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventWithIdentityHandler, setConsentHandler);

    // Phase 1: configure and set consent to in
    await alloy("configure", {
      ...alloyConfig,
      defaultConsent: "pending",
    });
    await alloy("setConsent", CONSENT_IN);

    // Simulate page reload (cookies persist, alloy state cleared)
    const alloy2 = await reloadAlloy();

    // Phase 2: configure fresh alloy — consent cookie should restore "in" state
    networkRecorder.reset();
    await alloy2("configure", {
      ...alloyConfig,
      defaultConsent: "pending",
    });
    await alloy2("sendEvent");

    const interactCalls = await networkRecorder.findCalls(/v1\/interact/);
    expect(interactCalls.length).toBe(1);
    expect(interactCalls[0].response.status).toBeGreaterThanOrEqual(200);
    expect(interactCalls[0].response.status).toBeLessThanOrEqual(207);
  });

  // C14409: Consenting to no purposes should be persisted across "reload"
  describe("C14409: consenting to no purposes persists across simulated page reload", () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, "warn");
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    test("sendEvent after reload logs warning and fires no requests when consent was out", async ({
      alloy,
      worker,
      networkRecorder,
    }) => {
      worker.use(setConsentHandler);

      // Phase 1: configure and set consent to out
      await alloy("configure", {
        ...alloyConfig,
        defaultConsent: "pending",
        debugEnabled: true,
      });
      await alloy("setConsent", CONSENT_OUT);

      // Simulate page reload
      const alloy2 = await reloadAlloy();

      // Phase 2: configure fresh alloy — consent cookie should restore "out" state
      networkRecorder.reset();
      await alloy2("configure", {
        ...alloyConfig,
        defaultConsent: "pending",
        debugEnabled: true,
      });
      await alloy2("sendEvent");

      expect(searchForLogMessage(consoleSpy, "declined consent")).toBe(true);
      expect(
        networkRecorder.calls.filter((c) =>
          /v1\/interact/.test(c.request?.url ?? ""),
        ).length,
      ).toBe(0);
    });
  });

  // C14410: Setting consent for other purposes or invalid values should fail
  test("C14410: configuring defaultConsent to unknown fails", async ({
    alloy,
  }) => {
    let error;
    try {
      await alloy("configure", {
        ...alloyConfig,
        defaultConsent: "unknown",
      });
    } catch (e) {
      error = e;
    }

    expect(error).toBeTruthy();
    expect(error.message).toContain("'defaultConsent':");
    expect(error.message).toContain(
      `Expected one of these values: ["in","out","pending"], but got "unknown"`,
    );
  });

  test("C14410: setting consent for unknown purposes produces server 400 error", async ({
    alloy,
  }) => {
    // No setConsentHandler is registered - hits prod Edge
    await alloy("configure", {
      ...alloyConfig,
      defaultConsent: "pending",
    });

    let error;
    try {
      await alloy("setConsent", {
        consent: [
          { standard: "Adobe", version: "1.0", value: { analytics: "in" } },
        ],
      });
    } catch (e) {
      error = e;
    }

    expect(error).toBeTruthy();
    expect(error.message).toContain(
      "The server responded with a status code 400",
    );
    expect(error.message).toContain("EXEG-0102-400");
    await alloy("setConsent", CONSENT_IN);
  });

  // C14411: User consents to no purposes after consenting to no purposes
  test("C14411: calling setConsent(out) twice does not throw", async ({
    alloy,
    worker,
  }) => {
    worker.use(setConsentHandler);

    await alloy("configure", {
      ...alloyConfig,
      defaultConsent: "pending",
    });

    await alloy("setConsent", CONSENT_OUT);
    // Should not throw
    await alloy("setConsent", CONSENT_OUT);
  });

  test("C14411: setConsent(out) after reload without consent cookie does not throw", async ({
    alloy,
    worker,
  }) => {
    worker.use(setConsentHandler);

    await alloy("configure", {
      ...alloyConfig,
      defaultConsent: "pending",
    });
    await alloy("setConsent", CONSENT_OUT);

    // Simulate reload without consent cookie
    await cookieStore.delete(MAIN_CONSENT_COOKIE_NAME);
    const alloy2 = await reloadAlloy();

    await alloy2("configure", {
      ...alloyConfig,
      defaultConsent: "pending",
    });

    expect(() => alloy2("setConsent", CONSENT_OUT)).not.toThrow();
  });

  // C14414: Requests are queued while consent changes are pending
  test("C14414: set-consent requests are sequential and event is blocked by out consent", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler, setConsentHandler);

    await alloy("configure", {
      ...alloyConfig,
      defaultConsent: "pending",
      debugEnabled: true,
    });

    // Fire two setConsent calls and a sendEvent concurrently
    const setConsentPromise1 = alloy("setConsent", CONSENT_IN);
    const setConsentPromise2 = alloy("setConsent", CONSENT_OUT);
    const sendEventPromise = alloy("sendEvent");

    await setConsentPromise1;
    await setConsentPromise2;
    await sendEventPromise;

    // Two set-consent calls should have been made
    const consentCalls = await networkRecorder.findCalls(
      /v1\/privacy\/set-consent/,
      { retries: 10, minCalls: 2 },
    );
    expect(consentCalls.length).toBe(2);

    // check that the second set-consent request starts after the first one's response
    const [firstConsent, secondConsent] = consentCalls;
    expect(secondConsent.request.sequence).toBeGreaterThan(
      firstConsent.response.sequence,
    );

    // Event should be blocked because final consent is out
    expect(
      networkRecorder.calls.filter((c) =>
        /v1\/interact/.test(c.request?.url ?? ""),
      ).length,
    ).toBe(0);
  });

  // C1472433: Set-consent is not called when consent is the same after reload
  test("C1472433: set-consent not called again when consent hash matches after simulated reload", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventWithIdentityHandler, setConsentHandler);

    // Phase 1: configure and set consent
    await alloy("configure", {
      ...alloyConfig,
      defaultConsent: "pending",
    });
    await alloy("setConsent", ADOBE2_IN);

    const consentCallsPhase1 = await networkRecorder.findCalls(
      /v1\/privacy\/set-consent/,
    );
    expect(consentCallsPhase1.length).toBe(1);

    // Simulate page reload
    const alloy2 = await reloadAlloy();

    // Phase 2: configure + sendEvent (consent was persisted, should fire immediately)
    networkRecorder.reset();
    await alloy2("configure", {
      ...alloyConfig,
      defaultConsent: "pending",
    });
    await alloy2("sendEvent");

    const interactCalls = await networkRecorder.findCalls(/v1\/interact/);
    expect(interactCalls.length).toBe(1);

    // Set the same consent again — should NOT trigger another set-consent call
    await alloy2("setConsent", ADOBE2_IN);

    const consentCallsPhase2 = networkRecorder.calls.filter((c) =>
      /v1\/privacy\/set-consent/.test(c.request?.url ?? ""),
    );
    expect(consentCallsPhase2.length).toBe(0);
  });

  // C1472434: Set-consent is called when consent is different after reload
  test("C1472434: set-consent called when consent changes after simulated reload", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventWithIdentityHandler, setConsentHandler);

    // Phase 1: configure and set consent to in
    await alloy("configure", {
      ...alloyConfig,
      defaultConsent: "pending",
    });
    await alloy("setConsent", ADOBE2_IN);

    const consentCallsPhase1 = await networkRecorder.findCalls(
      /v1\/privacy\/set-consent/,
    );
    expect(consentCallsPhase1.length).toBe(1);

    // Simulate page reload
    const alloy2 = await reloadAlloy();

    // Phase 2: configure + sendEvent (consent was persisted, should fire immediately)
    networkRecorder.reset();
    await alloy2("configure", {
      ...alloyConfig,
      defaultConsent: "pending",
    });
    await alloy2("sendEvent");

    const interactCalls = await networkRecorder.findCalls(/v1\/interact/);
    expect(interactCalls.length).toBe(1);

    // Set different consent (out) — should trigger a new set-consent call
    await alloy2("setConsent", ADOBE2_OUT);

    const consentCallsPhase2 = await networkRecorder.findCalls(
      /v1\/privacy\/set-consent/,
    );
    expect(consentCallsPhase2.length).toBe(1);
  });

  // C1472435: Set-consent is called when identity cookie is missing after reload
  test("C1472435: set-consent re-sent when identity cookie is missing after simulated reload", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventWithIdentityHandler, setConsentHandler);

    // Phase 1
    await alloy("configure", {
      ...alloyConfig,
      defaultConsent: "pending",
    });
    await alloy("setConsent", ADOBE2_IN);

    const consentCallsPhase1 = await networkRecorder.findCalls(
      /v1\/privacy\/set-consent/,
    );
    expect(consentCallsPhase1.length).toBe(1);

    // Simulate reload: delete identity cookie, keep consent cookie
    await cookieStore.delete(MAIN_IDENTITY_COOKIE_NAME);
    const alloy2 = await reloadAlloy();

    // Phase 2: configure fresh alloy
    networkRecorder.reset();
    await alloy2("configure", {
      ...alloyConfig,
      defaultConsent: "pending",
    });

    // sendEvent should be queued — consent present but identity missing requires re-verification
    const sendEventPromise = alloy2("sendEvent");

    // Immediately: no interact calls yet
    expect(
      networkRecorder.calls.filter((c) =>
        /v1\/interact/.test(c.request?.url ?? ""),
      ).length,
    ).toBe(0);

    // Calling setConsent(ADOBE2_IN) triggers a new set-consent call (identity missing)
    await alloy2("setConsent", ADOBE2_IN);

    const consentCallsPhase2 = await networkRecorder.findCalls(
      /v1\/privacy\/set-consent/,
    );
    expect(consentCallsPhase2.length).toBe(1);

    // The queued sendEvent should now go out
    await sendEventPromise;

    const interactCalls = await networkRecorder.findCalls(/v1\/interact/);
    expect(interactCalls.length).toBe(1);
  });

  // C1472436: Set-consent is called when consent cookie is missing after reload
  test("C1472436: set-consent re-sent when consent cookie is missing after simulated reload", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventWithIdentityHandler, setConsentHandler);

    // Phase 1
    await alloy("configure", {
      ...alloyConfig,
      defaultConsent: "pending",
    });
    await alloy("setConsent", ADOBE2_IN);

    const consentCallsPhase1 = await networkRecorder.findCalls(
      /v1\/privacy\/set-consent/,
    );
    expect(consentCallsPhase1.length).toBe(1);

    // Simulate reload: delete consent cookie, keep identity cookie
    await cookieStore.delete(MAIN_CONSENT_COOKIE_NAME);
    const alloy2 = await reloadAlloy();

    // Phase 2: configure fresh alloy
    networkRecorder.reset();
    await alloy2("configure", {
      ...alloyConfig,
      defaultConsent: "pending",
    });

    // sendEvent should be queued — consent cookie is gone, consent is "pending" again
    const sendEventPromise = alloy2("sendEvent");

    // Immediately: no interact calls yet
    expect(
      networkRecorder.calls.filter((c) =>
        /v1\/interact/.test(c.request?.url ?? ""),
      ).length,
    ).toBe(0);

    // Calling setConsent(ADOBE2_IN) sends a new set-consent call (no consent cookie)
    await alloy2("setConsent", ADOBE2_IN);

    const consentCallsPhase2 = await networkRecorder.findCalls(
      /v1\/privacy\/set-consent/,
    );
    expect(consentCallsPhase2.length).toBe(1);

    // The queued sendEvent should now go out
    await sendEventPromise;

    const interactCalls = await networkRecorder.findCalls(/v1\/interact/);
    expect(interactCalls.length).toBe(1);
  });

  // C1472437: Adobe consent version 2.0 is translated to general=in
  test("C1472437: Adobe consent v2.0 collect:y unblocks queued event", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler, setConsentHandler);

    await alloy("configure", {
      ...alloyConfig,
      defaultConsent: "pending",
    });

    // Queue an event
    const sendEventPromise = alloy("sendEvent");

    // No interact calls yet
    expect(
      networkRecorder.calls.filter((c) =>
        /v1\/interact/.test(c.request?.url ?? ""),
      ).length,
    ).toBe(0);

    // Set Adobe 2.0 consent to in (collect: y)
    await alloy("setConsent", ADOBE2_IN);

    const consentCalls = await networkRecorder.findCalls(
      /v1\/privacy\/set-consent/,
    );
    expect(consentCalls.length).toBe(1);

    // Event should now go out
    await sendEventPromise;
    const interactCalls = await networkRecorder.findCalls(/v1\/interact/);
    expect(interactCalls.length).toBe(1);
  });

  // C1472438: Adobe consent version 2.0 is translated to general=out
  describe("C1472438: Adobe consent v2.0 collect:n drops queued event", () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, "warn");
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    test("queued event is dropped when Adobe 2.0 consent is out", async ({
      alloy,
      worker,
      networkRecorder,
    }) => {
      worker.use(setConsentHandler);

      await alloy("configure", {
        ...alloyConfig,
        defaultConsent: "pending",
      });

      // Queue an event
      const sendEventPromise = alloy("sendEvent");

      // No interact calls yet
      expect(
        networkRecorder.calls.filter((c) =>
          /v1\/interact/.test(c.request?.url ?? ""),
        ).length,
      ).toBe(0);

      // Set Adobe 2.0 consent to out (collect: n)
      await alloy("setConsent", ADOBE2_OUT);

      const consentCalls = await networkRecorder.findCalls(
        /v1\/privacy\/set-consent/,
      );
      expect(consentCalls.length).toBe(1);

      // Event resolves (with {}) but should NOT go out
      await sendEventPromise;
      expect(
        networkRecorder.calls.filter((c) =>
          /v1\/interact/.test(c.request?.url ?? ""),
        ).length,
      ).toBe(0);
    });
  });

  // C1576777: When identity cookie is missing, stored consent is cleared
  test("C1576777: stored consent is cleared after reload when the identity cookie is missing", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler, setConsentHandler);

    await alloy("configure", alloyConfig);
    await alloy("setConsent", CONSENT_OUT);
    expect(await cookieStore.get(MAIN_CONSENT_COOKIE_NAME)).not.toBeNull();

    await cookieStore.delete(MAIN_IDENTITY_COOKIE_NAME);
    const alloy2 = await reloadAlloy();
    await alloy2("configure", alloyConfig);

    expect(await cookieStore.get(MAIN_CONSENT_COOKIE_NAME)).toBeNull();

    await alloy2("sendEvent");
    const interactCalls = await networkRecorder.findCalls(/v1\/interact/);
    expect(interactCalls.length).toBe(1);
  });

  // C1631712: Requests are dropped when default consent is out
  describe("C1631712: requests are dropped when defaultConsent is out", () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, "warn");
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    test("sendEvent returns {} and logs warning when defaultConsent is out, then works after opting in", async ({
      alloy,
      worker,
      networkRecorder,
    }) => {
      worker.use(sendEventHandler, setConsentHandler);

      await alloy("configure", {
        ...alloyConfig,
        defaultConsent: "out",
        debugEnabled: true,
      });

      // First sendEvent — should be dropped immediately (defaultConsent: out)
      const result = await alloy("sendEvent");
      // alloy resolves with an object containing empty arrays when consent is out
      expect(result.propositions ?? []).toEqual([]);
      expect(result.decisions ?? []).toEqual([]);

      expect(
        searchForLogMessage(
          consoleSpy,
          "No consent preferences have been set.",
        ),
      ).toBe(true);

      // No interact calls yet
      expect(
        networkRecorder.calls.filter((c) =>
          /v1\/interact/.test(c.request?.url ?? ""),
        ).length,
      ).toBe(0);

      // Opt in
      await alloy("setConsent", CONSENT_IN);

      // Second sendEvent — should succeed
      await alloy("sendEvent");
      const interactCalls = await networkRecorder.findCalls(/v1\/interact/);
      expect(interactCalls.length).toBe(1);
    });
  });

  // C225953: Identity map can be sent on a setConsent command
  test("C225953: identityMap can be sent on a setConsent command", async ({
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

    await alloy("setConsent", {
      identityMap: {
        HYP: [
          {
            id: "id123",
          },
        ],
      },
      consent: CONSENT_IN.consent,
    });

    const consentCalls = await networkRecorder.findCalls(
      /v1\/privacy\/set-consent/,
    );
    expect(consentCalls.length).toBe(1);
    expect(consentCalls[0].response.status).toBeGreaterThanOrEqual(200);
    expect(consentCalls[0].response.status).toBeLessThanOrEqual(207);

    // Verify the identityMap was included in the request body
    const body = consentCalls[0].request.body;
    const bodyStr = JSON.stringify(body);
    expect(bodyStr).toContain("id123");
  });

  // C25148: When default consent is in, consent can be revoked
  describe("C25148: when defaultConsent is in, consent can be revoked", () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, "warn");
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    test("first event is sent, second event is blocked after revoking consent", async ({
      alloy,
      worker,
      networkRecorder,
    }) => {
      worker.use(sendEventHandler, setConsentHandler);

      await alloy("configure", {
        ...alloyConfig,
        debugEnabled: true,
      });

      // First event — should go out (defaultConsent is "in" by default)
      await alloy("sendEvent");

      // Revoke consent
      await alloy("setConsent", CONSENT_OUT);

      // Second event — should be blocked
      await alloy("sendEvent");
      expect(searchForLogMessage(consoleSpy, "declined consent")).toBe(true);

      // Only the first event should have fired
      const interactCalls = await networkRecorder.findCalls(/v1\/interact/);
      expect(interactCalls.length).toBe(1);
      expect(interactCalls[0].request.body.events.length).toBe(1);
    });
  });

  // C28754: Consenting to no purposes should result in no data handles in the response
  test("C28754: setConsent(out) completes with a 200/207 response", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    // Note: The MSW mock returns a minimal JSON without data handles.
    // We verify the call succeeds; inspecting real response payloads
    // (idSyncs, personalization, audiences) requires a live edge endpoint.
    worker.use(setConsentHandler);

    await alloy("configure", {
      ...alloyConfig,
      defaultConsent: "pending",
    });

    await alloy("setConsent", CONSENT_OUT);

    const consentCalls = await networkRecorder.findCalls(
      /v1\/privacy\/set-consent/,
    );
    expect(consentCalls.length).toBe(1);
    expect(consentCalls[0].response.status).toBeGreaterThanOrEqual(200);
    expect(consentCalls[0].response.status).toBeLessThanOrEqual(207);
  });

  // C5594870: Identity can be set via the adobe_mc query string parameter when calling set-consent
  test("C5594870: adobe_mc ECID is included in the set-consent request", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(setConsentHandler);

    const ecid = "77094828402023918047117570965393734545";
    await withTemporaryUrl(async ({ currentHref, applyUrl }) => {
      const url = new URL(currentHref);
      url.searchParams.set(
        "adobe_mc",
        `TS=${Date.now() / 1000}|MCMID=${ecid}|MCORGID=${alloyConfig.orgId}`,
      );
      applyUrl(url);

      await alloy("configure", {
        ...alloyConfig,
        defaultConsent: "pending",
      });
      await alloy("setConsent", CONSENT_IN);

      const [consentCall] = await networkRecorder.findCalls(
        /v1\/privacy\/set-consent/,
      );
      expect(consentCall.request.body.identityMap.ECID[0].id).toBe(ecid);
    });
  });
});
