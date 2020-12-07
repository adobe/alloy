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
  debugEnabled
} from "../../../helpers/constants/configParts";

const { IAB_NO_PURPOSE_TEN } = require("../../../helpers/constants/consent");

const config = compose(
  orgMainConfigMain,
  debugEnabled
);

const networkLogger = createNetworkLogger();

createFixture({
  title: "C224677: Call setConsent when purpose 10 is FALSE.",
  requestHooks: [
    networkLogger.setConsentEndpointLogs,
    networkLogger.edgeEndpointLogs
  ]
});

test.meta({
  ID: "C224677",
  SEVERITY: "P0",
  TEST_RUN: "REGRESSION"
});

const triggerSetConsent = ClientFunction(
  () => window.alloy("setConsent", IAB_NO_PURPOSE_TEN),
  { dependencies: { IAB_NO_PURPOSE_TEN } }
);

const triggerEvent = ClientFunction(() => window.alloy("sendEvent"));

test("Test C224677: Call setConsent when purpose 10 is FALSE", async () => {
  await configureAlloyInstance("alloy", config);
  await triggerSetConsent();

  await t.expect(networkLogger.setConsentEndpointLogs.requests.length).eql(1);

  const rawResponse = JSON.parse(
    getResponseBody(networkLogger.setConsentEndpointLogs.requests[0])
  );

  const response = createResponse(rawResponse);

  // 1. The set-consent response should contain the Consent cookie: { general: in }
  const consentCookieName = "kndctr_334F60F35E1597910A495EC2_AdobeOrg_consent";
  const consentCookieValue = await cookies.get(consentCookieName);

  await t.expect(consentCookieValue).ok("No consent cookie found.");
  await t.expect(consentCookieValue).eql("general=in");

  // 2. The ECID should exist in the response payload as well, if queried
  const identityHandle = response.getPayloadsByType("identity:result");
  await t.expect(identityHandle.length).eql(2);

  // 3. Event calls going forward should be opted out because AAM opts out consents with no purpose 10.
  await triggerEvent();
  const rawEventResponse = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0])
  );
  const eventResponse = createResponse(rawEventResponse);

  // 4. And a warning message should be returned, confirming the opt-out
  const warnings = eventResponse.getWarnings().map(w => w.code);
  await t.expect(warnings).contains("EXEG-0301-200");

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
});
