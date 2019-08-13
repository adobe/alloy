/* eslint-disable no-console */
import createNetworkLogger from "../../src/networkLogger";
import gatewayDomain from "../../src/constants/gatewayDomain";
import { responseStatus } from "../../src/assertions/index";

const networkLogger = createNetworkLogger();

fixture`Sandbox Tests`
  .page(gatewayDomain)
  .requestHooks(
    networkLogger.gatewayEndpointLogs,
    networkLogger.sandboxEndpointLogs
  );

test.before(() => console.log("Test Started"));
test.after(() => console.log("Test Completed"));

const testDescription =
  "Regression: Given user loads sandbox. The global function named alloy is accessible.";

test.meta({
  ID: "2560",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
})(testDescription, async () => {
  await responseStatus(networkLogger.gatewayEndpointLogs.requests, 200);
});
