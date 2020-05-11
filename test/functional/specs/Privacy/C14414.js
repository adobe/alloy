import fixtureFactory from "../../helpers/fixtureFactory";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";
import SequentialHook from "../../helpers/requestHooks/sequentialHook";
import {
  compose,
  orgMainConfigMain,
  consentPending,
  debugEnabled
} from "../../helpers/constants/configParts";
import createConsoleLogger from "../../helpers/consoleLogger";
import { CONSENT_IN, CONSENT_OUT } from "../../helpers/constants/consent";

const config = compose(
  orgMainConfigMain,
  consentPending,
  debugEnabled
);

const setConsentHook = new SequentialHook(/v1\/privacy\/set-consent\?/);

fixtureFactory({
  title: "C14414: Requests are queued while consent changes are pending",
  requestHooks: [setConsentHook]
});

test.meta({
  ID: "C14414",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C14414: Requests are queued while consent changes are pending", async t => {
  await configureAlloyInstance("alloy", config);
  await t.eval(() => {
    // Don't wait for setConsent to complete.
    window.alloy("setConsent", CONSENT_IN);
  });
  await t.eval(() => {
    // Don't wait for setConsent to complete.
    window.alloy("setConsent", CONSENT_OUT);
  });
  const logger = await createConsoleLogger();
  await t.eval(() => window.alloy("sendEvent"));
  await logger.warn.expectMessageMatching(/user declined consent/);
  await t
    .expect(setConsentHook.haveRequestsBeenSequential())
    .ok("Set-consent requests were not sequential");
});
