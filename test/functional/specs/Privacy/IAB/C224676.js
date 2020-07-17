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

const sendEventWithConsent = ClientFunction(() =>
  window.alloy("sendEvent", {
    xdm: {
      consentStrings: [
        {
          consentStandard: "IAB TCF",
          consentStandardVersion: "2.0",
          consentStringValue:
            "CO052l-O052l-DGAMBFRACBgAIBAAAAAAIYgEawAQEagAAAA",
          gdprApplies: true,
          containsPersonalData: false
        }
      ]
    }
  })
);

const sendEvent = ClientFunction(() => window.alloy("sendEvent"));

test("Test C224676: Passing a positive Consent in the sendEvent command", async () => {
  await configureAlloyInstance("alloy", config);
  await sendEventWithConsent();

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  const rawResponse = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0])
  );

  const response = createResponse(rawResponse);

  // 1. The set-consent response should contain the Consent cookie: { general: in }
  const consentCookieName = "kndctr_334F60F35E1597910A495EC2_AdobeOrg_consent";
  const consentCookieValue = await cookies.get(consentCookieName);

  await t.expect(consentCookieValue).eql("general=in");
  await t.expect(consentCookieValue).ok("No consent cookie found.");

  // 2. The ECID should exist in the response payload as well, if queried
  // TODO: We are seeing 2 `identity:result` handles. Bug logged on Konductor side:
  // https://jira.corp.adobe.com/browse/EXEG-1960
  const identityHandle = response.getPayloadsByType("identity:result");
  await t.expect(identityHandle.length).eql(2); // TODO: CHANGE to 1.

  await sendEvent();
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(2);
});
