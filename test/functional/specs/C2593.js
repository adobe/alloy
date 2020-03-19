import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../helpers/networkLogger";
import { responseStatus } from "../helpers/assertions/index";
import fixtureFactory from "../helpers/fixtureFactory";
import environmentContextConfig from "../helpers/constants/environmentContextConfig";
import configureAlloyInstance from "../helpers/configureAlloyInstance";

const networkLogger = createNetworkLogger();

fixtureFactory({
  title: "C2593: Event command sets consent to in.",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C2593",
  SEVERITY: "P0",
  TEST_RUN: "REGRESSION"
});
// execute an event command with no request sent
const triggerAlloyEvent = ClientFunction(() => {
  return { promise: window.alloy("event") };
});

test("Test C2593: Event command consents to all purposes", async () => {
  // SDK installed and configured with defaultConsent: { general: "pending" }
  await configureAlloyInstance("alloy", {
    defaultConsent: { general: "pending" },
    ...environmentContextConfig
  });
  // trigger alloy event
  const promise = (await triggerAlloyEvent()).promise;

  // set consent to in
  await t.eval(() => window.alloy("setConsent", { general: "in" }));

  await promise;
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
  await responseStatus(networkLogger.edgeEndpointLogs.requests, 204);
});
