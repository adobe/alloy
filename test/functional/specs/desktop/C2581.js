import { t, Selector } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import getBody from "../../helpers/networkLogger/getBody";
import { responseStatus } from "../../helpers/assertions/index";
import fixtureFactory from "../../helpers/fixtureFactory";

const urlCollector = `http://127.0.0.1:8080/test/functional/sandbox/html/alloySdk.html`;

const networkLogger = createNetworkLogger();

fixtureFactory({
  title:
    "C2581: When ECID not available on client, allow the first request to be sent while queuing subsequent requests",
  url: urlCollector,
  requestHooks: [networkLogger.adobedcEndpointLogs]
});

test.meta({
  ID: "C2581",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C2581: Queue requests until we receive an ECID.", async () => {
  await t.click(Selector("#debugEnabled-button"));
  await t.click(Selector("#event-button"));
  await t.click(Selector("#event-button"));
  await t.click(Selector("#event-button"));

  await responseStatus(networkLogger.adobedcEndpointLogs.requests, 200);

  await t.expect(networkLogger.adobedcEndpointLogs.requests.length).eql(1);

  const ecidResponse = getBody(networkLogger.adobedcEndpointLogs.requests[0]);

  const stringifyResponse = JSON.stringify(ecidResponse);
  await t.expect(stringifyResponse).contains("ECID");
});
