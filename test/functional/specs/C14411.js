import fixtureFactory from "../helpers/fixtureFactory";
import configureAlloyInstance from "../helpers/configureAlloyInstance";
import baseConfig from "../helpers/constants/baseConfig";

fixtureFactory({
  title:
    "C14411: User cannot consent to no purposes after consenting to no purposes"
});

test.meta({
  ID: "C14411",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C14411: User cannot consent to no purposes after consenting to no purposes", async t => {
  await configureAlloyInstance("alloy", {
    defaultConsent: { general: "pending" },
    ...baseConfig
  });
  await t.eval(() => window.alloy("setConsent", { general: "out" }));
  const setConsentErrorMessage = await t.eval(() =>
    window
      .alloy("setConsent", { general: "out" })
      .then(() => undefined, e => e.message)
  );
  await t
    .expect(setConsentErrorMessage)
    .ok("Expected the setConsent command to be rejected");
  await t.expect(setConsentErrorMessage).contains("User is opted out");
});
