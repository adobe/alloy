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
  "https://cataas.com/cat/cute",
  networkLoggerConfig
);

fixtureFactory({
  title: "C31436 Qualify for URL destinations via XDM Data.",
  requestHooks: [networkLogger.edgeEndpointLogs, destinationLogger]
});

test.meta({
  ID: "C31436",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const triggerAlloyEvent = ClientFunction(() => {
  return window.alloy("event", {
    xdm: { web: { webPageDetails: { name: "C31436" } } }
  });
});

test("C31436 Qualify for URL destinations via XDM Data.", async () => {
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
      payload.type === "url" &&
      payload.spec.url === "https://cataas.com/cat/cute"
  );
  await t.expect(destinationForAllVisitors).ok();

  await t.expect(destinationLogger.requests.length > 0).eql(true);
});
