import { t, Selector } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import testServerUrl from "../../helpers/constants/testServerUrl";
import fixtureFactory from "../../helpers/fixtureFactory";

const linkPageWithoutClickHandler = `${testServerUrl}/test/functional/sandbox/html/linkPageWithoutClickHandler.html`;

const networkLogger = createNetworkLogger();

fixtureFactory({
  title: "C8119: Does not send information about link clicks if disabled.",
  url: linkPageWithoutClickHandler,
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C8119",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C8119: Load page with link. Click link. Verify no request sent.", async () => {
  await t.click(Selector("#alloy-link-test"));
  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  const gatewayRequest = networkLogger.edgeEndpointLogs.requests[0];
  await t.expect(gatewayRequest).eql(undefined);
});
