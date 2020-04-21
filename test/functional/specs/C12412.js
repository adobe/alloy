import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../helpers/networkLogger";
import fixtureFactory from "../helpers/fixtureFactory";
import { orgMainConfigMain } from "../helpers/constants/configParts";
import configureAlloyInstance from "../helpers/configureAlloyInstance";
import createResponse from "../../../src/core/createResponse";
import getResponseBody from "../helpers/networkLogger/getResponseBody";

const networkLogger = createNetworkLogger();
fixtureFactory({
  title:
    "C12412 Response should return Cookie destinations if turned on in Blackbird",
  requestHooks: [networkLogger.edgeEndpointLogs]
});
test.meta({
  ID: "C12412",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const triggerAlloyEvent = ClientFunction(() => {
  return window.alloy("event", { xdm: { key: "value" } });
});

const getDocumentCookie = ClientFunction(() => document.cookie);

test("C12412 Response should return Cookie destinations if turned on in Blackbird", async () => {
  await configureAlloyInstance("alloy", orgMainConfigMain);
  await triggerAlloyEvent();
  const response = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0])
  );
  const alloyResponse = createResponse(response);
  const audiencesPayload = alloyResponse.getPayloadsByType("activation:push");
  // This is a destination set for all visitors.
  const destinationForAllVisitors = audiencesPayload.find(
    payload => payload.type === "cookie" && payload.spec.value === "test=C12412"
  );
  await t.expect(destinationForAllVisitors).ok();

  await t.expect(getDocumentCookie()).contains("C12412=test=C12412");
});
