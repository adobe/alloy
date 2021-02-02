import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import createFixture from "../../helpers/createFixture";

import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";

const debugEnabledConfig = compose(
  orgMainConfigMain,
  debugEnabled
);

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
  await alloy.configure(debugEnabledConfig);
  await alloy.sendEvent();

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const request = networkLogger.edgeEndpointLogs.requests[0].request.body;
  const stringifyRequest = JSON.parse(request);

  await t.expect(stringifyRequest.events[0].xdm.device).ok();
  await t.expect(stringifyRequest.events[0].xdm.placeContext).ok();
  await t.expect(stringifyRequest.events[0].xdm.environment.type).ok();
  await t.expect(stringifyRequest.events[0].xdm.web.webPageDetails).ok();
});
