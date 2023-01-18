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

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled);

createFixture({
  title: "C2592: Event command sends a request",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C2592",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C2592: Event command sends a request.", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent({
    datasetId: "5eb9aaa6a3b16e18a818e06f"
  });

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body
  );

  await t
    .expect(request.events[0].xdm.implementationDetails.name)
    .eql("https://ns.adobe.com/experience/alloy");
  await t
    .expect(request.events[0].meta.collect.datasetId)
    .eql("5eb9aaa6a3b16e18a818e06f");
  await t.expect(request.meta.state.cookiesEnabled).eql(true);
  await t.expect(request.meta.state.domain).ok();
});
