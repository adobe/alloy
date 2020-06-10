import createFixture from "../../helpers/createFixture";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";
import createNetworkLogger from "../../helpers/networkLogger";

import {
  compose,
  orgMainConfigMain,
  consentPending,
  debugEnabled
} from "../../helpers/constants/configParts";
import createConsoleLogger from "../../helpers/consoleLogger";

const { CONSENT_OUT, CONSENT_IN } = require("../../helpers/constants/consent");

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
  await configureAlloyInstance("alloy", config);
  await t.eval(() => window.alloy("setConsent", CONSENT_OUT), {
    dependencies: { CONSENT_OUT }
  });
  const setConsentErrorMessage = await t.eval(
    () =>
      window
        .alloy("setConsent", CONSENT_IN)
        .then(() => undefined, e => e.message),
    { dependencies: { CONSENT_IN } }
  );
  await t
    .expect(setConsentErrorMessage)
    .ok("Expected the setConsent command to be rejected");
  await t
    .expect(setConsentErrorMessage)
    .contains(
      "User has already opted out of all advertising solutions, update operation not supported."
    );

  // make sure the instance still has no consent
  const logger = await createConsoleLogger();
  await t.eval(() => window.alloy("sendEvent"));
  await logger.warn.expectMessageMatching(/user declined consent/);
  // make sure no event requests went out
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(0);
});
