import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../helpers/networkLogger";
import { responseStatus } from "../helpers/assertions/index";
import fixtureFactory from "../helpers/fixtureFactory";
import debugEnabledConfig from "../helpers/constants/debugEnabledConfig";
import configureAlloyInstance from "../helpers/configureAlloyInstance";

const networkLogger = createNetworkLogger();

fixtureFactory({
  title: "C2595: Event command passes the org ID on the request",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C2595",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const triggerAlloyEvent = ClientFunction(() => {
  return new Promise(resolve => {
    window.alloy("event", { xdm: { key: "value" } }).then(() => resolve());
  });
});

test("Test C2595: Event command passes the org ID on the request.", async () => {
  await configureAlloyInstance("alloy", debugEnabledConfig);
  await triggerAlloyEvent();

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const request = networkLogger.edgeEndpointLogs.requests[0].request.body;
  const stringifyRequest = JSON.parse(request);

  await t.expect(stringifyRequest.meta.configOverrides.orgId).ok();
});
