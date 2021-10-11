import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import createFixture from "../../helpers/createFixture";

import { orgMainConfigMain } from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import getResponseBody from "../../helpers/networkLogger/getResponseBody";

const networkLogger = createNetworkLogger();

createFixture({
  title: "C2597 - Adds all context data to requests by default.",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C2597",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C2597 - Adds all context data to requests by default.", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(orgMainConfigMain);
  await alloy.sendEvent();

  console.log("requests status", networkLogger.edgeEndpointLogs.requests);

  console.log(
    "response body",
    JSON.parse(getResponseBody(networkLogger.edgeEndpointLogs.requests[0]))
  );
  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const parsedBody = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body
  );

  await t.expect(parsedBody.events[0].xdm.device).ok();
  await t.expect(parsedBody.events[0].xdm.placeContext).ok();
  await t.expect(parsedBody.events[0].xdm.environment.type).ok();
  await t.expect(parsedBody.events[0].xdm.web.webPageDetails).ok();
});
