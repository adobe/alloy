import {
  compose,
  debugEnabled,
  orgMainConfigMain
} from "../../helpers/constants/configParts";
import createFixture from "../../helpers/createFixture";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled, {
  edgeConfigId: orgMainConfigMain.datastreamId
});
delete config.datastreamId;

createFixture({
  title: "C11634155: Deprecates options like edgeConfigId and warns with use",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C11634155",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C11634155: Deprecates options like edgeConfigId and warns with use", async t => {
  const alloy = createAlloyProxy();
  await t.debug();
  const warning = await alloy.configureErrorMessage(config);

  await t.expect(warning).match(/The field 'edgeConfigId' is deprecated./);
});

test.skip("Test C11634155: When specifying a deprecated option like edgeConfigId, it uses the specified alternative, datastreamId", async t => {
  const alloy = createAlloyProxy();
  await alloy.configureAsync(config);

  await alloy.sendEvent({});

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
  const { url } = networkLogger.edgeEndpointLogs.requests[0].request;
  await t.expect(url).contains(config.edgeConfigId);
});
