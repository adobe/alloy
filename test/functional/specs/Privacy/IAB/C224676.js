import { t } from "testcafe";
import createNetworkLogger from "../../../helpers/networkLogger";
import { responseStatus } from "../../../helpers/assertions/index";
import createFixture from "../../../helpers/createFixture";
import createResponse from "../../../../../src/core/createResponse";
import getResponseBody from "../../../helpers/networkLogger/getResponseBody";
import cookies from "../../../helpers/cookies";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../../helpers/constants/configParts";
import { MAIN_CONSENT_COOKIE_NAME } from "../../../helpers/constants/cookies";
import createAlloyProxy from "../../../helpers/createAlloyProxy";

const config = compose(
  orgMainConfigMain,
  debugEnabled
);

const networkLogger = createNetworkLogger();

createFixture({
  title: "C224676: Passing a positive Consent in the sendEvent command.",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C224676",
  SEVERITY: "P0",
  TEST_RUN: "REGRESSION"
});

const eventOptionsWithConsent = {
  xdm: {
    consentStrings: [
      {
        consentStandard: "IAB TCF",
        consentStandardVersion: "2.0",
        consentStringValue: "CO052l-O052l-DGAMBFRACBgAIBAAAAAAIYgEawAQEagAAAA",
        gdprApplies: true,
        containsPersonalData: false
      }
    ]
  }
};

test("Test C224676: Passing a positive Consent in the sendEvent command", async () => {
  const alloy = createAlloyProxy("alloy");
  await alloy.configure(config);
  await alloy.sendEvent(eventOptionsWithConsent);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  const rawResponse = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0])
  );

  const response = createResponse(rawResponse);

  // 1. The set-consent response should contain the Consent cookie: { general: in }
  const consentCookieValue = await cookies.get(MAIN_CONSENT_COOKIE_NAME);

  await t.expect(consentCookieValue).ok("No consent cookie found.");
  await t.expect(consentCookieValue).eql("general=in");

  // 2. The ECID should exist in the response payload as well, if queried
  // TODO: We are seeing 2 `identity:result` handles. Bug logged on Konductor side:
  // https://jira.corp.adobe.com/browse/EXEG-1960
  const identityHandle = response.getPayloadsByType("identity:result");
  await t.expect(identityHandle.length).eql(1);

  await alloy.sendEvent();
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(2);
});
