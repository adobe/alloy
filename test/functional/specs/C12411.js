import { RequestLogger, t, ClientFunction } from "testcafe";
import createNetworkLogger from "../helpers/networkLogger";
import fixtureFactory from "../helpers/fixtureFactory";
import { orgMainConfigMain } from "../helpers/constants/configParts";
import configureAlloyInstance from "../helpers/configureAlloyInstance";
import createResponse from "../../../src/core/createResponse";
import getResponseBody from "../helpers/networkLogger/getResponseBody";

const networkLogger = createNetworkLogger();

const networkLoggerConfig = {
  logRequestBody: true,
  stringifyRequestBody: true
};

const destinationLogger = RequestLogger(
  "https://cataas.com/cat",
  networkLoggerConfig
);

fixtureFactory({
  title:
    "C12411 Response should return URL destinations if turned on in Blackbird",
  requestHooks: [networkLogger.edgeEndpointLogs, destinationLogger]
});

test.meta({
  ID: "C12411",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const triggerAlloyEvent = ClientFunction(() => {
  return window.alloy("event", { xdm: { key: "value" } });
});

test("C12411 Response should return URL destinations if turned on in Blackbird", async () => {
  await configureAlloyInstance("alloy", orgMainConfigMain);
  await triggerAlloyEvent();
  const response = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0])
  );
  const alloyResponse = createResponse(response);
  const audiencesPayload = alloyResponse.getPayloadsByType("activation:push");
  // This is a destination set for all visitors.
  const destinationForAllVisitors = audiencesPayload.find(
    payload =>
      payload.type === "url" && payload.spec.url === "https://cataas.com/cat"
  );
  await t.expect(destinationForAllVisitors).ok();

  await t.expect(destinationLogger.requests.length > 0).eql(true);
});
