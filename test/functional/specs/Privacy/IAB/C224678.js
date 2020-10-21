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
  title: "C224678: Passing a negative Consent in the sendEvent command.",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C224678",
  SEVERITY: "P0",
  TEST_RUN: "REGRESSION"
});

// Consent with no Purpose 1, should result in Opt-Out.
const sendEventWithConsentError = ClientFunction(() =>
  window
    .alloy("sendEvent", {
      xdm: {
        consentStrings: [
          {
            consentStandard: "IAB TCF",
            consentStandardVersion: "2.0",
            consentStringValue:
              "CO052oTO052oTDGAMBFRACBgAABAAAAAAIYgEawAQEagAAAA",
            gdprApplies: true,
            containsPersonalData: false
          }
        ]
      }
    })
    .then(() => undefined, e => e.message)
);

const sendEvent = ClientFunction(() => window.alloy("sendEvent"));

test("Test C224678: Passing a negative Consent in the sendEvent command", async () => {
  await configureAlloyInstance("alloy", config);
  const errorMessage = await sendEventWithConsentError();

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
  await responseStatus(networkLogger.edgeEndpointLogs.requests, 403);

  const rawResponse = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0])
  );

  const response = createResponse(rawResponse);

  // 1. The set-consent response should contain the Consent cookie: { general: out }
  const consentCookieName = "kndctr_334F60F35E1597910A495EC2_AdobeOrg_consent";
  const consentCookieValue = await cookies.get(consentCookieName);

  await t.expect(consentCookieValue).ok("No consent cookie found.");
  await t.expect(consentCookieValue).eql("general=out");

  // 2. The ECID should not exist in the response payload as well, even if queried
  const identityHandle = response.getPayloadsByType("identity:result");
  await t.expect(identityHandle.length).eql(0);

  // 3. Should not have any activation, ID Syncs or decisions in the response.
  const handlesThatShouldBeMissing = [
    "activation:push",
    "identity:exchange",
    "personalization:decisions"
  ].reduce((handles, handleType) => {
    const handle = response.getPayloadsByType(handleType);
    if (handle.length) {
      handles.push(handle);
    }
    return handles;
  }, []);

  await t.expect(handlesThatShouldBeMissing.length).eql(0);

  // 4. The server doesn't throw error messages when there is no consent
  await t
    .expect(errorMessage)
    .notOk("Event returned an error when we expected it not to.");

  // 5. Events should be blocked going forward because we are opted out.
  await sendEvent();
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
});
