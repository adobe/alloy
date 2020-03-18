import { t } from "testcafe";
import createNetworkLogger from "../helpers/networkLogger";
import { responseStatus } from "../helpers/assertions";
import fixtureFactory from "../helpers/fixtureFactory";
import baseConfig from "../helpers/constants/baseConfig";
import configureAlloyInstance from "../helpers/configureAlloyInstance";

const networkLogger = createNetworkLogger();

fixtureFactory({
  title:
    "C28754 - Consenting to no purposes should result in no data handles in the response.",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C28754",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("C28754 - Consenting to no purposes should result in no data handles in the response.", async () => {
  await configureAlloyInstance("alloy", {
    defaultConsent: { general: "pending" },
    ...baseConfig
  });

  await t.eval(() => window.alloy("setConsent", { general: "out" }));

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  const errorMessage = await t.eval(() =>
    window
      .alloy("event", { data: { a: 1 } })
      .then(() => undefined, e => e.message)
  );

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(0);

  await t.expect(errorMessage).ok("Expected the event command to be rejected");
  await t.expect(errorMessage).contains("user declined consent");
});
