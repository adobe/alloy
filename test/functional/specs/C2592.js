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

const networkLogger = createNetworkLogger();
const config = compose(
  orgMainConfigMain,
  debugEnabled
);

fixtureFactory({
  title: "C2592: Event command sends a request",
  requestHooks: [networkLogger.edgeEndpointLogs, networkLogger.demdexProxy]
});

test.meta({
  ID: "C2592",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const triggerAlloyEvent = ClientFunction(() => {
  return new Promise(resolve => {
    window.alloy("event", { xdm: { key: "value" } }).then(() => resolve());
  });
});

test("Test C2592: Event command sends a request.", async () => {
  await configureAlloyInstance("alloy", config);
  await triggerAlloyEvent();

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const request = networkLogger.edgeEndpointLogs.requests[0].request.body;

  await t.expect(request).contains('"key":"value"');
});
