import { t } from "testcafe";
import createFixture from "../../helpers/createFixture";
import createNetworkLogger from "../../helpers/networkLogger";

import {
  compose,
  orgMainConfigMain,
  consentPending,
  debugEnabled
} from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import { CONSENT_OUT, CONSENT_IN } from "../../helpers/constants/consent";
import cookies from "../../helpers/cookies";
import { MAIN_CONSENT_COOKIE_NAME } from "../../helpers/constants/cookies";

const config = compose(orgMainConfigMain, consentPending, debugEnabled);

const networkLogger = createNetworkLogger();

createFixture({
  title:
    "C14404: User cannot consent to all purposes after consenting to no purposes",
  requestHooks: [
    networkLogger.edgeEndpointLogs,
    networkLogger.setConsentEndpointLogs
  ]
});

test.meta({
  ID: "C14404",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("C14404: User can consent to all purposes after consenting to no purposes", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.setConsent(CONSENT_OUT);

  // set consent back to in for the same user
  await alloy.setConsent(CONSENT_IN);

  await t.expect(networkLogger.setConsentEndpointLogs.requests.length).eql(2);

  const consentCookieValue = await cookies.get(MAIN_CONSENT_COOKIE_NAME);

  await t.expect(consentCookieValue).ok("No consent cookie found.");
  await t.expect(consentCookieValue).eql("general=in");

  // make sure event goes out
  await alloy.sendEvent();
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
});
