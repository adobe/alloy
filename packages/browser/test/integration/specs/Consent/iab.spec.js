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
import { test, expect, describe } from "../../helpers/testsSetup/extend.js";
import {
  sendEventHandler,
  setConsentErrorHandler,
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
import { MAIN_CONSENT_COOKIE_NAME } from "../../helpers/constants/cookies.js";

const pendingConfig = {
  ...alloyConfig,
  defaultConsent: "pending",
  debugEnabled: true,
};

const defaultInConfig = {
  ...alloyConfig,
  debugEnabled: true,
};

const OPT_IN_STRING = IAB_CONSENT_IN.consent[0].value;
const OPT_OUT_STRING = IAB_NO_PURPOSE_ONE.consent[0].value;
const OPT_OUT_WARNING = "https://ns.adobe.com/aep/errors/EXEG-0301-200";

const getPayloadsByType = (call, type) =>
  call.response.body.handle
    .filter((handle) => handle.type === type)
    .flatMap((handle) => handle.payload);

const expectConsentResponse = async (call, expectedConsent) => {
  expect((await cookieStore.get(MAIN_CONSENT_COOKIE_NAME))?.value).toBe(
    `general=${expectedConsent}`,
  );
  expect(
    getPayloadsByType(call, "identity:result").map(
      (identity) => identity.namespace.code,
    ),
  ).toContain("ECID");
};

const iabSendEventHandler = http.post(
  /https:\/\/edge\.adobedc\.net\/ee\/.*\/?v1\/interact/,
  async ({ request }) => {
    const body = await request.json();
    const consentString = body.events?.[0]?.xdm?.consentStrings?.[0];
    const consentStringValue = consentString?.consentStringValue;
    const isOptOut =
      consentStringValue === OPT_OUT_STRING && consentString.gdprApplies;

    if (
      consentStringValue &&
      consentStringValue !== OPT_IN_STRING &&
      consentStringValue !== OPT_OUT_STRING
    ) {
      throw new Error("Handler received an unexpected IAB consent string");
    }

    const handle = [
      {
        type: "identity:result",
        payload: [
          {
            id: "41861666193140161934276845651148876988",
            namespace: { code: "ECID" },
          },
        ],
      },
    ];

    if (consentStringValue) {
      handle.push({
        type: "state:store",
        payload: [
          {
            key: MAIN_CONSENT_COOKIE_NAME,
            value: `general=${isOptOut ? "out" : "in"}`,
            maxAge: 15552000,
          },
        ],
      });
    }

    return HttpResponse.json({
      requestId: "iab-send-event-request-id",
      handle,
      warnings: isOptOut ? [{ type: OPT_OUT_WARNING }] : [],
    });
  },
);

describe("IAB TCF consent", () => {
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
    expect([200, 207]).toContain(consentCalls[0].response.status);
    expect(consentCalls[0].request.body.consent).toEqual(
      IAB_CONSENT_IN.consent,
    );
    await expectConsentResponse(consentCalls[0], "in");

    await alloy("sendEvent");
    const interactCalls = await networkRecorder.findCalls(/v1\/interact/);
    expect(interactCalls.length).toBe(1);
  });

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
    expect([200, 207]).toContain(consentCalls[0].response.status);
    expect(consentCalls[0].request.body.consent).toEqual(
      IAB_NO_PURPOSE_ONE.consent,
    );
    await expectConsentResponse(consentCalls[0], "out");

    await alloy("sendEvent");
    expect(
      networkRecorder.calls.filter((c) =>
        /v1\/interact/.test(c.request?.url ?? ""),
      ).length,
    ).toBe(0);
  });

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
    expect([200, 207]).toContain(consentCalls[0].response.status);
    expect(consentCalls[0].request.body.consent).toEqual(
      IAB_NO_ADOBE_VENDOR.consent,
    );
    await expectConsentResponse(consentCalls[0], "out");

    await alloy("sendEvent");
    expect(
      networkRecorder.calls.filter((c) =>
        /v1\/interact/.test(c.request?.url ?? ""),
      ).length,
    ).toBe(0);
  });

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
    expect([200, 207]).toContain(consentCalls[0].response.status);
    expect(consentCalls[0].request.body.consent).toEqual(
      IAB_CONSENT_IN_PERSONAL_DATA.consent,
    );
    await expectConsentResponse(consentCalls[0], "in");

    await alloy("sendEvent");
    const interactCalls = await networkRecorder.findCalls(/v1\/interact/);
    expect(interactCalls.length).toBe(1);
  });

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
    expect([200, 207]).toContain(consentCalls[0].response.status);
    expect(consentCalls[0].request.body.consent).toEqual(
      IAB_CONSENT_IN_NO_GDPR.consent,
    );
    await expectConsentResponse(consentCalls[0], "in");

    await alloy("sendEvent");
    const interactCalls = await networkRecorder.findCalls(/v1\/interact/);
    expect(interactCalls.length).toBe(1);
  });

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
    expect([200, 207]).toContain(consentCalls[0].response.status);
    expect(consentCalls[0].request.body.consent).toEqual(
      IAB_NO_PURPOSE_ONE_NO_GDPR.consent,
    );
    await expectConsentResponse(consentCalls[0], "in");

    await alloy("sendEvent");
    const interactCalls = await networkRecorder.findCalls(/v1\/interact/);
    expect(interactCalls.length).toBe(1);
  });

  test("C224675: invalid IAB consent options return edge validation errors", async ({
    alloy,
    worker,
  }) => {
    worker.use(setConsentErrorHandler);

    await alloy("configure", pendingConfig);

    const cases = [
      {
        consent: {
          standard: "IAB",
          version: "2.0",
          value: OPT_IN_STRING,
        },
        status: 400,
        errorCode: "EXEG-0102-400",
      },
      {
        consent: {
          standard: "IAB TCF",
          version: "6.9",
          value: OPT_IN_STRING,
        },
        status: 400,
        errorCode: "EXEG-0102-400",
      },
      {
        consent: {
          standard: "IAB TCF",
          version: "2.0",
        },
        status: 400,
        errorCode: "EXEG-0103-400",
      },
      {
        consent: {
          standard: "IAB TCF",
          version: "2.0",
          value: "",
        },
        status: 422,
        errorCode: "EXEG-0104-422",
      },
    ];

    for (const { consent, status, errorCode } of cases) {
      let error;
      try {
        // eslint-disable-next-line no-await-in-loop
        await alloy("setConsent", { consent: [consent] });
      } catch (e) {
        error = e;
      }

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain(
        `The server responded with a status code ${status}`,
      );
      expect(error.message).toContain(errorCode);
    }
  });

  test("C224676: positive IAB consent strings in sendEvent XDM succeed", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(iabSendEventHandler);

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
    expect([200, 207]).toContain(interactCalls[0].response.status);

    expect(interactCalls[0].request.body.events[0].xdm.consentStrings).toEqual([
      {
        consentStandard: "IAB TCF",
        consentStandardVersion: "2.0",
        consentStringValue: "CO052l-O052l-DGAMBFRACBgAIBAAAAAAIYgEawAQEagAAAA",
        gdprApplies: true,
        containsPersonalData: false,
      },
    ]);
    await expectConsentResponse(interactCalls[0], "in");

    await alloy("sendEvent");
    const allInteractCalls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 10,
      minCalls: 2,
    });
    expect(allInteractCalls.length).toBe(2);
  });

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
    expect(consentCalls[0].request.body.consent).toEqual(
      IAB_NO_PURPOSE_TEN.consent,
    );
    await expectConsentResponse(consentCalls[0], "in");

    await alloy("sendEvent");
    const interactCalls = await networkRecorder.findCalls(/v1\/interact/);
    expect(interactCalls.length).toBe(1);
    expect([200, 207]).toContain(interactCalls[0].response.status);
    expect(interactCalls[0].response.body.warnings ?? []).not.toContainEqual(
      expect.objectContaining({ type: OPT_OUT_WARNING }),
    );
  });

  test("C224678: negative IAB consent in sendEvent opts out and blocks subsequent events", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(iabSendEventHandler);

    await alloy("configure", defaultInConfig);

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

    const interactCalls = await networkRecorder.findCalls(/v1\/interact/);
    expect(interactCalls.length).toBe(1);
    expect([200, 207]).toContain(interactCalls[0].response.status);

    expect(interactCalls[0].request.body.events[0].xdm.consentStrings).toEqual([
      {
        consentStandard: "IAB TCF",
        consentStandardVersion: "2.0",
        consentStringValue: "CO052oTO052oTDGAMBFRACBgAABAAAAAAIYgEawAQEagAAAA",
        gdprApplies: true,
        containsPersonalData: false,
      },
    ]);
    await expectConsentResponse(interactCalls[0], "out");
    expect(
      [
        "activation:push",
        "identity:exchange",
        "personalization:decisions",
      ].flatMap((type) => getPayloadsByType(interactCalls[0], type)),
    ).toHaveLength(0);
    expect(interactCalls[0].response.body.warnings).toContainEqual(
      expect.objectContaining({ type: OPT_OUT_WARNING }),
    );

    await expect(alloy("sendEvent")).resolves.toEqual({});
    expect(
      networkRecorder.calls.filter((call) =>
        /v1\/interact/.test(call.request?.url ?? ""),
      ),
    ).toHaveLength(1);
  });
});
