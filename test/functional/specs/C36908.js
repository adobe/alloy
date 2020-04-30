import { ClientFunction, t } from "testcafe";
import fixtureFactory from "../helpers/fixtureFactory";
import createMockVisitor from "../helpers/visitorService/createMockVisitor";
import createMockOptIn from "../helpers/optIn/createMockOptIn";
import configureAlloyInstance from "../helpers/configureAlloyInstance";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  migrationEnabled,
  consentPending
} from "../helpers/constants/configParts";

fixtureFactory({
  title:
    "C36908 When ID migration is enabled and Visitor and Alloy are both awaiting consent, when Visitor is denied and Alloy is approved, an error occurs."
});

test.meta({
  ID: "C35448",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const config = compose(
  orgMainConfigMain,
  debugEnabled,
  migrationEnabled,
  consentPending
);

const setConsent = ClientFunction(consent => {
  return window.alloy("setConsent", consent);
});

test("C36908 When ID migration is enabled and Visitor and Alloy are both awaiting consent, when Visitor is denied and Alloy is approved, an error occurs.", async () => {
  const ecid = "12345678909876543211234567890987654321";
  await createMockVisitor(ecid);
  await createMockOptIn(false);
  await configureAlloyInstance("alloy", config);
  let errorMessage;
  await setConsent({ general: "in" }).catch(err => {
    errorMessage = err.errMsg;
  });
  await t.expect(errorMessage).match(/Legacy opt-in was declined./);
});
