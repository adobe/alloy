import fixtureFactory from "../helpers/fixtureFactory";
import configureAlloyInstance from "../helpers/configureAlloyInstance";
import baseConfig from "../helpers/constants/baseConfig";
import createNetworkLogger from "../helpers/networkLogger";

const networkLogger = createNetworkLogger();

fixtureFactory({
  title: "C14405: Unidentified user can consent to all purposes",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C14405",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C14405: Unidentified user can consent to all purposes", async t => {
  await configureAlloyInstance("alloy", {
    defaultConsent: { general: "pending" },
    debugEnabled: true,
    ...baseConfig
  });
  await t.eval(() => window.alloy("setConsent", { general: "in" }));
  await t.eval(() => window.alloy("event", { data: { key: "value" } }));

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
  const request = networkLogger.edgeEndpointLogs.requests[0].request.body;
  await t.expect(request).contains('"key":"value"');
});
