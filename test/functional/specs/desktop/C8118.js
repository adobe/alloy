import { t, Selector } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import testServerUrl from "../../helpers/constants/testServerUrl";

const linkPageWithClickHandler = `${testServerUrl}/test/functional/sandbox/html/linkPageWithClickHandler.html`;

const networkLogger = createNetworkLogger();

fixture`C8118`
  .page(linkPageWithClickHandler)
  .requestHooks(
    networkLogger.edgeEndpointLogs,
    networkLogger.sandboxEndpointLogs
  );

test.meta({
  ID: "C8118",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C8118: Load page with link. Click link. Verify request.", async () => {
  await t.click(Selector("#alloy-link-test"));
  await responseStatus(networkLogger.edgeEndpointLogs.requests, 204);
  const gatewayRequest = networkLogger.edgeEndpointLogs.requests[0];
  const requestBody = JSON.parse(gatewayRequest.request.body);
  const destinationUrl = requestBody.events[0].xdm.web.webInteraction.URL;
  await t.expect(destinationUrl).contains("missing.html");
});
