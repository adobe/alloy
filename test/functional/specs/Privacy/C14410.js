import { ClientFunction } from "testcafe";
import fixtureFactory from "../../helpers/fixtureFactory";
import orgMainConfigMain from "../../helpers/constants/configParts/orgMainConfigMain";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";

fixtureFactory({
  title:
    'C14410: Setting consent for other purposes, or to other values than "in" or "out" should fail'
});

test.meta({
  ID: "C14410",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const getErrorMessageFromConfigure = ClientFunction(config =>
  window.alloy("configure", config).then(() => undefined, e => e.message)
);

const getErrorMessageFromSetConsent = ClientFunction(consent =>
  window.alloy("setConsent", consent).then(() => undefined, e => e.message)
);

// This test was originally designed to be done using one test case. When the configure command fails
// from the validation to make sure that only once instance has a particular orgId, the validation
// state isn't reset, so when I had this all in one test, the third part here was failing because
// an instance was already configured with that orgId.
test("Test C14410: Configuring default consent for unknown purposes fails", async t => {
  const errorMessage = getErrorMessageFromConfigure({
    defaultConsent: { analytics: "pending" },
    ...orgMainConfigMain
  });
  await t
    .expect(errorMessage)
    .ok("Expected the configure command to be rejected");
  await t
    .expect(errorMessage)
    .contains("'defaultConsent.analytics': Unknown field.");
});

test("Test C14410: Configuring default consent to 'out' fails", async t => {
  const errorMessage = getErrorMessageFromConfigure({
    defaultConsent: { general: "out" },
    ...orgMainConfigMain
  });
  await t
    .expect(errorMessage)
    .ok("Expected the configure command to be rejected");
  await t.expect(errorMessage).contains("'defaultConsent.general':");
  await t.expect(errorMessage).contains("'out'");
});

test("Test C14410: Setting consent for unknown purposes fails", async t => {
  await configureAlloyInstance("alloy", {
    defaultConsent: { general: "pending" },
    ...orgMainConfigMain
  });
  const errorMessage = getErrorMessageFromSetConsent({ analytics: "in" });
  await t
    .expect(errorMessage)
    .ok("Expected the setConsent command to be rejected");
  await t.expect(errorMessage).contains("'general' is a required option");
});

test("Test C14410: Setting consent to 'pending' fails", async t => {
  await configureAlloyInstance("alloy", {
    defaultConsent: { general: "pending" },
    ...orgMainConfigMain
  });
  const errorMessage = getErrorMessageFromSetConsent({ general: "pending" });
  await t
    .expect(errorMessage)
    .ok("Expected the setConsent command to be rejected");
  await t.expect(errorMessage).contains("'pending'");
});
