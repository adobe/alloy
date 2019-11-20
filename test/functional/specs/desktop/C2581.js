import { t, Selector } from "testcafe";
import createNetworkLogger from "../../src/networkLogger";
import { responseStatus } from "../../src/assertions/index";
import testServerUrl from "../../src/constants/testServerUrl";

const urlCollector = `${testServerUrl}/test/functional/sandbox/html/alloySdk.html`;

const networkLogger = createNetworkLogger();

fixture`C2581`
  .page(urlCollector)
  .requestHooks(
    networkLogger.adobedcEndpointLogs,
    networkLogger.dpmEndpointLogs
  );

test.meta({
  ID: "C2581",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Regression: Load page with link. Click link. Verify no request sent.", async () => {
  await t.click(Selector("#debugEnabled-button"));
  await t.click(Selector("#event-button"));
  await t.click(Selector("#event-button"));
  await t.click(Selector("#event-button"));

  await responseStatus(networkLogger.adobedcEndpointLogs.requests, 200);

  await t.expect(networkLogger.adobedcEndpointLogs.requests.length).eql(1);
  // await t.expect(gatewayRequest).eql(undefined);
});
