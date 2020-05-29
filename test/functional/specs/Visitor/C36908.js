import { ClientFunction, t } from "testcafe";
import createFixture from "../../helpers/createFixture";
import { alloyWithVisitorTestPageUrl } from "../../helpers/constants/testServerUrl";
import createMockOptIn from "../../helpers/optIn/createMockOptIn";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  migrationEnabled,
  consentPending
} from "../../helpers/constants/configParts";
import { CONSENT_IN } from "../../helpers/constants/consent";

createFixture({
  title:
    "C36908 When ID migration is enabled and Visitor and Alloy are both awaiting consent, when Visitor is denied and Alloy is approved, an error occurs.",
  url: alloyWithVisitorTestPageUrl
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
  await createMockOptIn(false);
  await configureAlloyInstance("alloy", config);
  let errorMessage;
  await setConsent(CONSENT_IN).catch(err => {
    errorMessage = err.errMsg;
  });
  await t.expect(errorMessage).match(/Legacy opt-in was declined./);
});
