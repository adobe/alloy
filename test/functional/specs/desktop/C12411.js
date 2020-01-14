import { t, Selector } from "testcafe";
import createNetworkLogger from "../../src/networkLogger";
import { responseStatus } from "../../src/assertions/index";
import fixtureFactory from "../../src/fixtureFactory";
import testServerUrl from "../../src/constants/testServerUrl";

const urlCollector = `${testServerUrl}/test/functional/sandbox/html/alloySdk.html`;
const networkLogger = createNetworkLogger();

fixtureFactory({
  title: "C12411: Requests destinations if configured",
  url: urlCollector,
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C12411",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C12411: Requests destinations if configured.", async () => {
  await t.click(Selector("#destinationsEnabled-button"));
  await t.click(Selector("#event-button"));

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const request = networkLogger.edgeEndpointLogs.requests[0].request.body;

  await t
    .expect(request)
    .contains(
      '"activation":{"urlDestinationsEnabled":true,"storedDestinationsEnabled":true}'
    );
});
