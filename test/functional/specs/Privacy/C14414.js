import createFixture from "../../helpers/createFixture";
import SequentialHook from "../../helpers/requestHooks/sequentialHook";
import {
  compose,
  orgMainConfigMain,
  consentPending,
  debugEnabled
} from "../../helpers/constants/configParts";
import createConsoleLogger from "../../helpers/consoleLogger";
import { CONSENT_IN, CONSENT_OUT } from "../../helpers/constants/consent";
import createAlloyProxy from "../../helpers/createAlloyProxy";

const config = compose(
  orgMainConfigMain,
  consentPending,
  debugEnabled
);

const setConsentHook = new SequentialHook(/v1\/privacy\/set-consent\?/);

createFixture({
  title: "C14414: Requests are queued while consent changes are pending",
  requestHooks: [setConsentHook]
});

test.meta({
  ID: "C14414",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C14414: Requests are queued while consent changes are pending", async t => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const setConsentResponse1 = await alloy.setConsentAsync(CONSENT_IN);
  const setConsentResponse2 = await alloy.setConsentAsync(CONSENT_OUT);
  const logger = await createConsoleLogger();
  await alloy.sendEvent();
  await logger.warn.expectMessageMatching(/user declined consent/);
  await t
    .expect(setConsentHook.haveRequestsBeenSequential())
    .ok("Set-consent requests were not sequential");

  // make sure there are no errors returned from the setConsent requests
  await setConsentResponse1.result;
  await setConsentResponse2.result;
});
