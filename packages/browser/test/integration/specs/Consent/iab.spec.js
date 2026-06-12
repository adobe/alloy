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
import { test, expect, describe } from "../../helpers/testsSetup/extend.js";
import {
  sendEventHandler,
  setConsentHandler,
} from "../../helpers/mswjs/handlers.js";
import alloyConfig from "../../helpers/alloy/config.js";
import {
  IAB_CONSENT_IN,
  IAB_CONSENT_IN_PERSONAL_DATA,
  IAB_CONSENT_IN_NO_GDPR,
  IAB_NO_PURPOSE_ONE,
  IAB_NO_PURPOSE_ONE_NO_GDPR,
  IAB_NO_PURPOSE_TEN,
  IAB_NO_ADOBE_VENDOR,
} from "../../helpers/constants/consent.js";

// Base config used for most IAB tests — defaultConsent: pending
const pendingConfig = {
  ...alloyConfig,
  defaultConsent: "pending",
  debugEnabled: true,
};

// Base config with defaultConsent: in (already opted in by default)
const defaultInConfig = {
  ...alloyConfig,
  debugEnabled: true,
};

describe("IAB TCF consent", () => {
  // C224670: Opt in to IAB using the setConsent command
  test("C224670: opt in to IAB using setConsent; subsequent sendEvent succeeds", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler, setConsentHandler);

    await alloy("configure", pendingConfig);
    await alloy("setConsent", IAB_CONSENT_IN);

    const consentCalls = await networkRecorder.findCalls(
      /v1\/privacy\/set-consent/,
    );
    expect(consentCalls.length).toBe(1);
    expect(consentCalls[0].response.status).toBeGreaterThanOrEqual(200);
    expect(consentCalls[0].response.status).toBeLessThanOrEqual(207);

    // After opting in, sendEvent should succeed
    await alloy("sendEvent");
    const interactCalls = await networkRecorder.findCalls(/v1\/interact/);
    expect(interactCalls.length).toBe(1);
  });

  // C224671: Opt out of IAB using the setConsent command
  // IAB_NO_PURPOSE_ONE — no Purpose 1, results in general=out
  test("C224671: opt out of IAB with no Purpose 1; subsequent sendEvent is blocked", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(setConsentHandler);

    await alloy("configure", pendingConfig);
    await alloy("setConsent", IAB_NO_PURPOSE_ONE);

    const consentCalls = await networkRecorder.findCalls(
      /v1\/privacy\/set-consent/,
    );
    expect(consentCalls.length).toBe(1);
    expect(consentCalls[0].response.status).toBeGreaterThanOrEqual(200);
    expect(consentCalls[0].response.status).toBeLessThanOrEqual(207);

    // After opting out, sendEvent should not fire
    await alloy("sendEvent");
    expect(
      networkRecorder.calls.filter((c) =>
        /v1\/interact/.test(c.request?.url ?? ""),
      ).length,
    ).toBe(0);
  });

  // C224671: Opt out of IAB — no Adobe vendor
  test("C224671: opt out of IAB with no Adobe vendor; subsequent sendEvent is blocked", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(setConsentHandler);

    await alloy("configure", pendingConfig);
    await alloy("setConsent", IAB_NO_ADOBE_VENDOR);

    const consentCalls = await networkRecorder.findCalls(
      /v1\/privacy\/set-consent/,
    );
    expect(consentCalls.length).toBe(1);
    expect(consentCalls[0].response.status).toBeGreaterThanOrEqual(200);
    expect(consentCalls[0].response.status).toBeLessThanOrEqual(207);

    // After opting out, sendEvent should not fire
    await alloy("sendEvent");
    expect(
      networkRecorder.calls.filter((c) =>
        /v1\/interact/.test(c.request?.url ?? ""),
      ).length,
    ).toBe(0);
  });

  // C224672: Passing the gdprContainsPersonalData flag
  test("C224672: gdprContainsPersonalData flag is accepted; subsequent sendEvent succeeds", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler, setConsentHandler);

    await alloy("configure", pendingConfig);
    await alloy("setConsent", IAB_CONSENT_IN_PERSONAL_DATA);

    const consentCalls = await networkRecorder.findCalls(
      /v1\/privacy\/set-consent/,
    );
    expect(consentCalls.length).toBe(1);
    expect(consentCalls[0].response.status).toBeGreaterThanOrEqual(200);
    expect(consentCalls[0].response.status).toBeLessThanOrEqual(207);

    // Verify gdprContainsPersonalData was in the request
    const bodyStr = JSON.stringify(consentCalls[0].request.body);
    expect(bodyStr).toContain("gdprContainsPersonalData");

    // After opting in, sendEvent should succeed
    await alloy("sendEvent");
    const interactCalls = await networkRecorder.findCalls(/v1\/interact/);
    expect(interactCalls.length).toBe(1);
  });

  // C224673: Opt in to IAB while gdprApplies is FALSE
  test("C224673: opt in to IAB while gdprApplies is false; subsequent sendEvent succeeds", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler, setConsentHandler);

    await alloy("configure", pendingConfig);
    await alloy("setConsent", IAB_CONSENT_IN_NO_GDPR);

    const consentCalls = await networkRecorder.findCalls(
      /v1\/privacy\/set-consent/,
    );
    expect(consentCalls.length).toBe(1);
    expect(consentCalls[0].response.status).toBeGreaterThanOrEqual(200);
    expect(consentCalls[0].response.status).toBeLessThanOrEqual(207);

    // After opting in, sendEvent should succeed
    await alloy("sendEvent");
    const interactCalls = await networkRecorder.findCalls(/v1\/interact/);
    expect(interactCalls.length).toBe(1);
  });

  // C224674: Opt out to IAB while gdprApplies is FALSE
  // When gdprApplies is false with no Purpose 1, consent should be treated as in
  test("C224674: opt out with no Purpose 1 while gdprApplies is false; subsequent sendEvent succeeds", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler, setConsentHandler);

    await alloy("configure", pendingConfig);
    await alloy("setConsent", IAB_NO_PURPOSE_ONE_NO_GDPR);

    const consentCalls = await networkRecorder.findCalls(
      /v1\/privacy\/set-consent/,
    );
    expect(consentCalls.length).toBe(1);
    expect(consentCalls[0].response.status).toBeGreaterThanOrEqual(200);
    expect(consentCalls[0].response.status).toBeLessThanOrEqual(207);

    // When gdprApplies is false, the user is treated as opted in
    await alloy("sendEvent");
    const interactCalls = await networkRecorder.findCalls(/v1\/interact/);
    expect(interactCalls.length).toBe(1);
  });

  // C224675: Passing invalid consent options should throw a validation error
  // These tests rely on server-side 400/422 responses (EXEG-0102-400, EXEG-0103-400, EXEG-0104-422).
  // The MSW setConsentHandler mock does not replicate per-request server-side validation errors,
  // so the server-side rejection assertions are skipped.
  test.skip("C224675: invalid IAB consent standard/version/value produces server 400/422 (requires live edge endpoint)", () => {});

  // C224676: Passing a positive Consent in the sendEvent command (consentStrings in xdm)
  test("C224676: positive IAB consent strings in sendEvent XDM succeed", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", defaultInConfig);

    await alloy("sendEvent", {
      xdm: {
        consentStrings: [
          {
            consentStandard: "IAB TCF",
            consentStandardVersion: "2.0",
            consentStringValue:
              "CO052l-O052l-DGAMBFRACBgAIBAAAAAAIYgEawAQEagAAAA",
            gdprApplies: true,
            containsPersonalData: false,
          },
        ],
      },
    });

    const interactCalls = await networkRecorder.findCalls(/v1\/interact/);
    expect(interactCalls.length).toBe(1);
    expect(interactCalls[0].response.status).toBeGreaterThanOrEqual(200);
    expect(interactCalls[0].response.status).toBeLessThanOrEqual(207);

    // Verify the consentStrings were included in the XDM payload
    const bodyStr = JSON.stringify(interactCalls[0].request.body);
    expect(bodyStr).toContain("IAB TCF");
    expect(bodyStr).toContain(
      "CO052l-O052l-DGAMBFRACBgAIBAAAAAAIYgEawAQEagAAAA",
    );

    // A subsequent sendEvent (without consent strings) should also succeed
    await alloy("sendEvent");
    const allInteractCalls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 10,
      minCalls: 2,
    });
    expect(allInteractCalls.length).toBe(2);
  });

  // C224677: Call setConsent when purpose 10 is FALSE
  test("C224677: IAB consent with no purpose 10 still opts in; subsequent sendEvent succeeds", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler, setConsentHandler);

    await alloy("configure", defaultInConfig);
    await alloy("setConsent", IAB_NO_PURPOSE_TEN);

    const consentCalls = await networkRecorder.findCalls(
      /v1\/privacy\/set-consent/,
    );
    expect(consentCalls.length).toBe(1);

    // Event calls going forward should remain opted in
    // (purpose 10 = "Develop and improve products" is not required for general consent)
    await alloy("sendEvent");
    const interactCalls = await networkRecorder.findCalls(/v1\/interact/);
    expect(interactCalls.length).toBe(1);
    expect(interactCalls[0].response.status).toBeGreaterThanOrEqual(200);
    expect(interactCalls[0].response.status).toBeLessThanOrEqual(207);
  });

  // C224678: Passing a negative Consent in the sendEvent command
  // The MSW sendEventHandler returns a 200 with a mock response body that does
  // not include a real opt-out warning (EXEG-0301-200) or set the general=out
  // cookie as the real edge does. The portions that check cookie state and
  // response warning payloads cannot be replicated without a live endpoint.
  test("C224678: negative IAB consent strings (no Purpose 1) in sendEvent XDM are sent to edge", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", defaultInConfig);

    // This sendEvent includes a consent string that has no Purpose 1 (opt-out)
    await alloy("sendEvent", {
      xdm: {
        consentStrings: [
          {
            consentStandard: "IAB TCF",
            consentStandardVersion: "2.0",
            consentStringValue:
              "CO052oTO052oTDGAMBFRACBgAABAAAAAAIYgEawAQEagAAAA",
            gdprApplies: true,
            containsPersonalData: false,
          },
        ],
      },
    });

    // The request should have been sent (network call was made)
    const interactCalls = await networkRecorder.findCalls(/v1\/interact/);
    expect(interactCalls.length).toBe(1);
    expect(interactCalls[0].response.status).toBeGreaterThanOrEqual(200);
    expect(interactCalls[0].response.status).toBeLessThanOrEqual(207);

    // Verify the opt-out consent string was included in the request
    const bodyStr = JSON.stringify(interactCalls[0].request.body);
    expect(bodyStr).toContain(
      "CO052oTO052oTDGAMBFRACBgAABAAAAAAIYgEawAQEagAAAA",
    );
  });
});
