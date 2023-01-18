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
import { TEST_PAGE } from "../../helpers/constants/url";
import createCollectEndpointAsserter from "../../helpers/createCollectEndpointAsserter";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled);

createFixture({
  title: "C9369211: sendEvent includes a header for the referer",
  requestHooks: [
    networkLogger.edgeEndpointLogs,
    networkLogger.edgeCollectEndpointLogs
  ]
});

test.meta({
  ID: "C9369211",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C9369211: sendEvent includes a header for the referer when calling interact.", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent({});

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  await t
    .expect(networkLogger.edgeEndpointLogs.requests[0].request.headers.referer)
    .eql(TEST_PAGE);
});

test("Test C9369211: sendEvent includes a header for the referer when calling collect.", async () => {
  const collectEndpointAsserter = await createCollectEndpointAsserter();

  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent({}); // establish an identity
  await collectEndpointAsserter.reset();
  await alloy.sendEvent({ documentUnloading: true });
  await collectEndpointAsserter.assertCollectCalledAndNotInteract();
  await t
    .expect(collectEndpointAsserter.getCollectRequest().request.headers.referer)
    .eql(TEST_PAGE);
});
