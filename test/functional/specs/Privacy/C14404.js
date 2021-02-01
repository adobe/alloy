import createFixture from "../../helpers/createFixture";
import createNetworkLogger from "../../helpers/networkLogger";

import {
  compose,
  orgMainConfigMain,
  consentPending,
  debugEnabled
} from "../../helpers/constants/configParts";
import createConsoleLogger from "../../helpers/consoleLogger";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import { CONSENT_OUT, CONSENT_IN } from "../../helpers/constants/consent";

const config = compose(
  orgMainConfigMain,
  consentPending,
  debugEnabled
);

const networkLogger = createNetworkLogger();

createFixture({
  title:
    "C14404: User cannot consent to all purposes after consenting to no purposes",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C14404",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C14404: User cannot consent to all purposes after consenting to no purposes", async t => {
  const alloy = createAlloyProxy("alloy");
  await alloy.configure(config);
  await alloy.setConsent(CONSENT_OUT);
  const setConsentErrorMessage = await alloy.setConsentErrorMessage(CONSENT_IN);

  await t
    .expect(setConsentErrorMessage)
    .ok("Expected the setConsent command to be rejected");
  await t.expect(setConsentErrorMessage).contains("EXEG-0302-409");

  // make sure the instance still has no consent
  const logger = await createConsoleLogger();
  await alloy.sendEvent();
  await logger.warn.expectMessageMatching(/user declined consent/);
  // make sure no event requests went out
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(0);
});
