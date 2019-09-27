import { t, Selector } from "testcafe";
import createNetworkLogger from "../../src/networkLogger";
import { responseStatus } from "../../src/assertions/index";
import testServerUrl from "../../src/constants/testServerUrl";

const linkPageWithClickHandler = `${testServerUrl}/test/functional/sandbox/html/linkPageWithClickHandler.html`;

const networkLogger = createNetworkLogger();

fixture`C8118`
  .page(linkPageWithClickHandler)
  .requestHooks(
    networkLogger.gatewayEndpointLogs,
    networkLogger.sandboxEndpointLogs
  );

test.meta({
  ID: "C8118",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Regression: Load page with link. Click link. Verify request.", async () => {
  await t.click(
    Selector("#body > section > div.left-nav > div > ul > li:nth-child(1) > a")
  );
  await responseStatus(networkLogger.gatewayEndpointLogs.requests, 200);
  const gatewayRequest = networkLogger.gatewayEndpointLogs.requests[0];
  const requestBody = JSON.parse(gatewayRequest.request.body);
  const destinationUrl = requestBody.events[0].xdm.web.webinteraction.URL;
  await t.expect(destinationUrl).contains("missing.html");
});
