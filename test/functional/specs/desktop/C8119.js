import { t, Selector } from "testcafe";
import createNetworkLogger from "../../src/networkLogger";
import { responseStatus } from "../../src/assertions/index";
import testServerUrl from "../../src/constants/testServerUrl";

const linkPageWithoutClickHandler = `${testServerUrl}/test/functional/sandbox/html/linkPageWithoutClickHandler.html`;

const networkLogger = createNetworkLogger();

fixture`C8119: Does not send information about link clicks if disabled.`
  .page(linkPageWithoutClickHandler)
  .requestHooks(
    networkLogger.gatewayEndpointLogs,
    networkLogger.sandboxEndpointLogs
  );

test.meta({
  ID: "C8119",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Regression: Load page with link. Click link. Verify no request sent.", async () => {
  await t.click(Selector("#alloy-link-test"));
  await responseStatus(networkLogger.gatewayEndpointLogs.requests, 200);
  const gatewayRequest = networkLogger.gatewayEndpointLogs.requests[0];
  await t.expect(gatewayRequest).eql(undefined);
});
