import fixtureFactory from "../helpers/fixtureFactory";
import configureAlloyInstance from "../helpers/configureAlloyInstance";
import baseConfig from "../helpers/constants/baseConfig";

fixtureFactory({
  title: "C14405: Unidentified user can consent to all purposes"
});

test.meta({
  ID: "C14405",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C14405: Unidentified user can consent to all purposes", async t => {
  await configureAlloyInstance("alloy", {
    defaultConsent: { general: "pending" },
    ...baseConfig
  });
  await t.eval(() => window.alloy("setConsent", { general: "in" }));
  await t.eval(() => window.alloy("event", { data: { a: 1 } }));
});
