import createNetworkLogger from "../../src/networkLogger";
import gatewayDomain from "../../src/constants/gatewayDomain";
import { responseStatus } from "../../src/assertions/index";
import fixtureFactory from "../../src/fixtureFactory";

const networkLogger = createNetworkLogger();

fixtureFactory({
  title: "C2560: Global function named alloy is accessible.",
  url: gatewayDomain,
  requestHooks: [
    networkLogger.gatewayEndpointLogs,
    networkLogger.sandboxEndpointLogs
  ]
});

test.meta({
  ID: "C2560",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Regression: Given user loads sandbox. The global function named alloy is accessible.", async () => {
  await responseStatus(networkLogger.gatewayEndpointLogs.requests, 200);
});
