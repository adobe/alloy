import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../helpers/networkLogger";
import { responseStatus } from "../helpers/assertions/index";
import fixtureFactory from "../helpers/fixtureFactory";
import configureAlloyInstance from "../helpers/configureAlloyInstance";

import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../helpers/constants/configParts";

const debugEnabledConfig = compose(
  orgMainConfigMain,
  debugEnabled
);

const networkLogger = createNetworkLogger();

fixtureFactory({
  title: "C2597 - Adds all context data to requests by default.",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C2597",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const triggerAlloyEvent = ClientFunction(() => {
  return window.alloy("sendEvent", { xdm: { key: "value" } });
});

test("Test C2597 - Adds all context data to requests by default.", async () => {
  await configureAlloyInstance("alloy", debugEnabledConfig);
  await triggerAlloyEvent();

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const request = networkLogger.edgeEndpointLogs.requests[0].request.body;
  const stringifyRequest = JSON.parse(request);

  await t.expect(stringifyRequest.events[0].xdm.device).ok();
  await t.expect(stringifyRequest.events[0].xdm.placeContext).ok();
  await t.expect(stringifyRequest.events[0].xdm.environment.type).ok();
  await t.expect(stringifyRequest.events[0].xdm.web.webPageDetails).ok();
});
