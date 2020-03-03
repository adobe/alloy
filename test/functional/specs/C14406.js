import fixtureFactory from "../helpers/fixtureFactory";
import configureAlloyInstance from "../helpers/configureAlloyInstance";
import baseConfig from "../helpers/constants/baseConfig";
import createNetworkLogger from "../helpers/networkLogger";

const networkLogger = createNetworkLogger();

fixtureFactory({
  title: "C14406: Unidentified user can consent to no purposes",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C14406",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C14406: Unidentified user can consent to no purposes", async t => {
  await configureAlloyInstance("alloy", {
    defaultConsent: { general: "pending" },
    ...baseConfig
  });
  await t.eval(() => window.alloy("setConsent", { general: "out" }));
  const errorMessage = await t.eval(() =>
    window
      .alloy("event", { data: { a: 1 } })
      .then(() => undefined, e => e.message)
  );

  await t.expect(errorMessage).ok("Expected the event command to be rejected");
  await t.expect(errorMessage).contains("The user declined consent.");
  // make sure no event requests were sent out
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(0);
});
