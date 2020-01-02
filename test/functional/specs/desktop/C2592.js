import { t, Selector } from "testcafe";
import createNetworkLogger from "../../src/networkLogger";
import { responseStatus } from "../../src/assertions/index";
import fixtureFactory from "../../src/fixtureFactory";

const urlCollector = `http://127.0.0.1:8080/test/functional/sandbox/html/alloySdk.html`;

const networkLogger = createNetworkLogger();

fixtureFactory({
  title: "C2592: Event command sends a request",
  url: urlCollector,
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C2592",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C2592: Event command sends a request.", async () => {
  await t.click(Selector("#debugEnabled-button"));
  await t.click(Selector("#C2592"));

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const request = networkLogger.edgeEndpointLogs.requests[0].request.body;

  await t.expect(request).contains('"key":"value"');
});
