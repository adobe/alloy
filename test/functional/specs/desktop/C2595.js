import { t, Selector } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import fixtureFactory from "../../helpers/fixtureFactory";
import testServerUrl from "../../helpers/constants/testServerUrl";

const urlCollector = `${testServerUrl}/test/functional/sandbox/html/alloySdk.html`;
const networkLogger = createNetworkLogger();

fixtureFactory({
  title: "C2595: Event command passes the org ID on the request",
  url: urlCollector,
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C2595",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C2595: Event command passes the org ID on the request.", async () => {
  await t.click(Selector("#debugEnabled-button"));
  await t.click(Selector("#event-button"));

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const request = networkLogger.edgeEndpointLogs.requests[0].request.body;
  await t.expect(request).contains("orgId");
});
