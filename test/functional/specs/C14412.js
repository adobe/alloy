import fixtureFactory from "../helpers/fixtureFactory";
import baseConfig from "../helpers/constants/baseConfig";
import configureAlloyInstance from "../helpers/configureAlloyInstance";

fixtureFactory({
  title:
    "C14412: While user is changing consent preferences, other requests should be queued"
});

test.meta({
  ID: "C14412",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C14412: While user is changing consent preferences, other requests should be queued", async t => {
  await configureAlloyInstance("alloy", {
    defaultConsent: { general: "pending" },
    debugEnabled: true,
    ...baseConfig
  });
  await t.eval(() => window.alloy("setConsent", { general: "in" }));
  await t.eval(() => {
    window.alloy("setConsent", { general: "out" });
    // don't wait for setConsent to be done, but wait for the command to be run.
    return undefined;
  });
  const errorMessage = await t.eval(() =>
    window
      .alloy("event", { data: { a: 1 } })
      .then(() => undefined, e => e.message)
  );

  await t.expect(errorMessage).ok("Expected the event command to be rejected");
  await t.expect(errorMessage).contains("user declined consent");
});
