import { RequestHook } from "testcafe";
import fixtureFactory from "../helpers/fixtureFactory";
import configureAlloyInstance from "../helpers/configureAlloyInstance";
import {
  compose,
  orgMainConfigMain,
  consentPending
} from "../helpers/constants/configParts";

const config = compose(
  orgMainConfigMain,
  consentPending
);

class SequentialHook extends RequestHook {
  constructor(...args) {
    super(...args);
    this.outstandingRequest = false;
    this.allRequestsSequential = true;
  }

  async onRequest() {
    if (this.outstandingRequest) {
      this.allRequestsSequential = false;
    }
    this.outstandingRequest = true;
  }

  async onResponse() {
    this.outstandingRequest = false;
  }

  haveRequestsBeenSequential() {
    return this.allRequestsSequential;
  }
}

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
