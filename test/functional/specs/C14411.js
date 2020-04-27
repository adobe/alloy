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
  await configureAlloyInstance("alloy", config);
  await t.eval(() =>
    window.alloy("setConsent", {
      purposes: {
        general: "out"
      }
    })
  );
  const setConsentErrorMessage = await t.eval(() =>
    window
      .alloy("setConsent", {
        purposes: {
          general: "out"
        }
      })
      .then(() => undefined, e => e.message)
  );
  await t
    .expect(setConsentErrorMessage)
    .ok("Expected the setConsent command to be rejected");
  await t
    .expect(setConsentErrorMessage)
    .contains("The user previously declined consent, which cannot be changed.");
});
