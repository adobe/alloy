import fixtureFactory from "../helpers/fixtureFactory";
import configureAlloyInstance from "../helpers/configureAlloyInstance";
import SequentialHook from "../helpers/requestHooks/sequentialHook";
import {
  compose,
  orgMainConfigMain,
  consentPending
} from "../helpers/constants/configParts";

const config = compose(
  orgMainConfigMain,
  consentPending
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
    window.alloy("setConsent", { general: "in" });
    return undefined;
  });
  await t.eval(() => {
    window.alloy("setConsent", { general: "out" });
    return undefined;
  });
  const errorMessage = await t.eval(() =>
    window
      .alloy("event", { data: { a: 1 } })
      .then(() => undefined, e => e.message)
  );

  await t.expect(errorMessage).ok("Expected the event command to be rejected");
  await t.expect(errorMessage).contains("user declined consent");
  await t
    .expect(setConsentHook.haveRequestsBeenSequential())
    .ok("Set-consent requests were not sequential");
});
