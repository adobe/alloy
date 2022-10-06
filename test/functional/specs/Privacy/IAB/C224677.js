import { t } from "testcafe";
import createNetworkLogger from "../../../helpers/networkLogger";
import { responseStatus } from "../../../helpers/assertions/index";
import createFixture from "../../../helpers/createFixture";
import createResponse from "../../../helpers/createResponse";
import getResponseBody from "../../../helpers/networkLogger/getResponseBody";
import cookies from "../../../helpers/cookies";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../../helpers/constants/configParts";
import { MAIN_CONSENT_COOKIE_NAME } from "../../../helpers/constants/cookies";
import createAlloyProxy from "../../../helpers/createAlloyProxy";
import { IAB_NO_PURPOSE_TEN } from "../../../helpers/constants/consent";

const config = compose(orgMainConfigMain, debugEnabled);

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

test("C224677: Call setConsent when purpose 10 is FALSE", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.setConsent(IAB_NO_PURPOSE_TEN);

  await t.expect(networkLogger.setConsentEndpointLogs.requests.length).eql(1);

  const rawResponse = JSON.parse(
    getResponseBody(networkLogger.setConsentEndpointLogs.requests[0])
  );

  const response = createResponse({ content: rawResponse });

  // 1. The set-consent response should contain the Consent cookie: { general: in }
  const consentCookieValue = await cookies.get(MAIN_CONSENT_COOKIE_NAME);

  await t.expect(consentCookieValue).ok("No consent cookie found.");
  await t.expect(consentCookieValue).eql("general=in");

  // 2. The ECID should exist in the response payload as well, if queried
  const identityHandle = response.getPayloadsByType("identity:result");
  const returnedNamespaces = identityHandle.map(i => i.namespace.code);
  await t.expect(identityHandle.length).eql(1);
  await t.expect(returnedNamespaces).contains("ECID");

  // 3. Event calls going forward should remain opted in, even though AAM opts out consents with no purpose 10.
  await alloy.sendEvent();
  const rawEventResponse = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0])
  );
  const eventResponse = createResponse({ content: rawEventResponse });

  // 4. No warning message regarding opt-out should be returned anymore
  const warningTypes = eventResponse.getWarnings().map(w => w.type);
  await t
    .expect(warningTypes)
    .notContains("https://ns.adobe.com/aep/errors/EXEG-0301-200");

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
});
