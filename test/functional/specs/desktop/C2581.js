import { t, Selector } from "testcafe";
import createNetworkLogger from "../../src/networkLogger";
import getBody from "../../src/networkLogger/getBody";
import { responseStatus } from "../../src/assertions/index";

const urlCollector = `http://127.0.0.1:8080/test/functional/sandbox/html/alloySdk.html`;

const networkLogger = createNetworkLogger();

fixture`C2581: When ECID not available on client, allow the first request to be sent while queuing subsequent requests`
  .page(urlCollector)
  .requestHooks(networkLogger.adobedcEndpointLogs);

test.meta({
  ID: "C2581",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Regression: Queue requests until we receive an ECID.", async () => {
  await t.click(Selector("#debugEnabled-button"));
  await t.click(Selector("#event-button"));
  await t.click(Selector("#event-button"));
  await t.click(Selector("#event-button"));

  await responseStatus(networkLogger.adobedcEndpointLogs.requests, 200);
  console.log(getBody(networkLogger.adobedcEndpointLogs.requests[0]));
  await t.expect(networkLogger.adobedcEndpointLogs.requests.length).eql(1);
  // Unable to inflate the response buffer. Second part of the test is currently on hold.
});
