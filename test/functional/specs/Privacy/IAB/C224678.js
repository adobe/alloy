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

const config = compose(orgMainConfigMain, debugEnabled);

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
const sendEventOptions = {
  xdm: {
    consentStrings: [
      {
        consentStandard: "IAB TCF",
        consentStandardVersion: "2.0",
        consentStringValue: "CO052oTO052oTDGAMBFRACBgAABAAAAAAIYgEawAQEagAAAA",
        gdprApplies: true,
        containsPersonalData: false
      }
    ]
  }
};

test("Test C224678: Passing a negative Consent in the sendEvent command", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const errorMessage = await alloy.sendEventErrorMessage(sendEventOptions);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  const rawResponse = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0])
  );

  const response = createResponse({ content: rawResponse });

  // 1. The set-consent response should contain the Consent cookie: { general: out }
  const consentCookieValue = await cookies.get(MAIN_CONSENT_COOKIE_NAME);

  await t.expect(consentCookieValue).ok("No consent cookie found.");
  await t.expect(consentCookieValue).eql("general=out");

  // 2. The ECID should not exist in the response payload as well, even if queried
  const identityHandle = response.getPayloadsByType("identity:result");
  await t.expect(identityHandle.length).eql(1);

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

  // 5. But returns a warning message confirming the opt-out
  const warningTypes = response.getWarnings().map(w => w.type);
  await t
    .expect(warningTypes)
    .contains("https://ns.adobe.com/aep/errors/EXEG-0301-200");

  // 6. Events should be blocked going forward because we are opted out.
  await alloy.sendEvent();
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
});
