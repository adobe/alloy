import createFixture from "../../helpers/createFixture";
import orgMainConfigMain from "../../helpers/constants/configParts/orgMainConfigMain";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import { CONSENT_IN } from "../../helpers/constants/consent";

createFixture({
  title:
    'C14410: Setting consent for other purposes, or to other values than "in" or "out" should fail'
});

test.meta({
  ID: "C14410",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

// This test was originally designed to be done using one test case. When the configure command fails
// from the validation to make sure that only once instance has a particular orgId, the validation
// state isn't reset, so when I had this all in one test, the third part here was failing because
// an instance was already configured with that orgId.

test("Test C14410: Configuring default consent to 'out' fails", async t => {
  const alloy = createAlloyProxy();
  const errorMessage = await alloy.configureErrorMessage({
    defaultConsent: "out",
    ...orgMainConfigMain
  });
  await t
    .expect(errorMessage)
    .ok("Expected the configure command to be rejected");
  await t.expect(errorMessage).contains("'defaultConsent':");
  await t
    .expect(errorMessage)
    .contains(
      `Expected one of these values: [["in","pending"]], but got "out"`
    );
});

test("Test C14410: Setting consent for unknown purposes fails", async t => {
  const alloy = createAlloyProxy();
  await alloy.configure({
    defaultConsent: "pending",
    ...orgMainConfigMain
  });
  const errorMessage = alloy.setConsentErrorMessage({
    consent: [{ standard: "Adobe", version: "1.0", value: { analytics: "in" } }]
  });
  await t
    .expect(errorMessage)
    .ok("Expected the setConsent command to be rejected");
  await t
    .expect(errorMessage)
    .contains("The server responded with a status code 400")
    .expect(errorMessage)
    .contains(
      "Invalid request. The value supplied for field 'consent.[0].value' does not match your input schema"
    );

  // make sure we can call it again with the correct values
  await alloy.setConsent(CONSENT_IN);
});
