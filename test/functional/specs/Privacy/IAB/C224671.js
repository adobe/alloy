import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../../../helpers/networkLogger";
import { responseStatus } from "../../../helpers/assertions/index";
import createFixture from "../../../helpers/createFixture";
import configureAlloyInstance from "../../../helpers/configureAlloyInstance";
import createResponse from "../../../../../src/core/createResponse";
import getResponseBody from "../../../helpers/networkLogger/getResponseBody";
import cookies from "../../../helpers/cookies";
import {
  compose,
  orgMainConfigMain,
  consentPending,
  debugEnabled
} from "../../../helpers/constants/configParts";

const config = compose(
  orgMainConfigMain,
  consentPending,
  debugEnabled
);

const {
  IAB_NO_PURPOSE_ONE,
  IAB_NO_ADOBE_VENDOR
} = require("../../../helpers/constants/consent");

const networkLogger = createNetworkLogger();

createFixture({
  title: "C224671: Opt out of IAB using the setConsent command.",
  requestHooks: [
    networkLogger.setConsentEndpointLogs,
    networkLogger.edgeEndpointLogs
  ]
});

test.meta({
  ID: "C224671",
  SEVERITY: "P0",
  TEST_RUN: "REGRESSION"
});

const triggerSetConsent = ClientFunction(consent =>
  window.alloy("setConsent", consent)
);

const sendEvent = ClientFunction(() => window.alloy("sendEvent"));

[IAB_NO_PURPOSE_ONE, IAB_NO_ADOBE_VENDOR].forEach(consent => {
  test("Test C224671: Opt out of IAB - No Purpose 1 & No Vendor", async () => {
    await configureAlloyInstance("alloy", config);
    await triggerSetConsent(consent);

    await t.expect(networkLogger.setConsentEndpointLogs.requests.length).eql(1);
    await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

    const consentRawResponse = JSON.parse(
      getResponseBody(networkLogger.setConsentEndpointLogs.requests[0])
    );

    const consentResponse = createResponse(consentRawResponse);

    // 1. The set-consent response should contain the Consent cookie: { general: out }
    const consentCookieName =
      "kndctr_334F60F35E1597910A495EC2_AdobeOrg_consent";
    const consentCookieValue = await cookies.get(consentCookieName);

    await t.expect(consentCookieValue).eql("general=out");
    await t.expect(consentCookieValue).ok("No consent cookie found.");

    // 2. The set-consent response payload contains the consent handle in XDM format
    const consentHandle = consentResponse.getPayloadsByType("privacy:consent");

    await t.expect(consentHandle.length).gte(0);
    await t.expect(consentHandle[0]).eql({
      consentStandard: "IAB TCF",
      consentStandardVersion: "2.0",
      consentStringValue: consent.consent[0].value,
      containsPersonalData: false,
      gdprApplies: true
    });

    // 3. The ECID should exist in the response payload as well, if queried
    const identityHandle = consentResponse.getPayloadsByType("identity:result");
    await t.expect(identityHandle.length).eql(1);

    await sendEvent();
    await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(0);
  });
});
