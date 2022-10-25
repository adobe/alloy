import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  targetMigrationEnabled
} from "../../helpers/constants/configParts";
import { TEST_PAGE, TEST_PAGE_AT_JS_TWO } from "../../helpers/constants/url";
import {
  MBOX_EDGE_CLUSTER,
  MBOX
} from "../../../../src/constants/legacyCookies";
import {
  assertKonductorReturnsCookieAndCookieIsSet,
  assertTargetMigrationEnabledIsSent,
  extractCluster
} from "./helper";
import createAlloyProxy from "../../helpers/createAlloyProxy";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled, targetMigrationEnabled);

createFixture({
  title:
    "C8085774: Web SDK to At.js 2.x - Assert same session ID, edge cluster are used for " +
    "both of the requests interact and delivery API",
  requestHooks: [
    networkLogger.edgeEndpointLogs,
    networkLogger.targetDeliveryEndpointLogs
  ],
  url: TEST_PAGE,
  includeAlloyLibrary: true
});

test.meta({
  ID: "C8085774",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test(
  "C8085774: Web SDK to At.js 2.x - Assert same session ID, edge cluster are used for both of the " +
    "requests interact and delivery API",
  async () => {
    // Loaded a page with Alloy
    const alloy = createAlloyProxy();
    await alloy.configure(config);
    await alloy.sendEvent();

    const sendEventRequest = networkLogger.edgeEndpointLogs.requests[0];

    // Check that targetMigrationEnabled flag is sent in meta
    await assertTargetMigrationEnabledIsSent(sendEventRequest);
    // Check that mbox cookie is present in the response from Konductor
    const mboxCookie = await assertKonductorReturnsCookieAndCookieIsSet(
      MBOX,
      sendEventRequest
    );

    // Check that mboxEdgeCluster cookie is present in the response from Konductor
    const mboxEdgeClusterCookie = await assertKonductorReturnsCookieAndCookieIsSet(
      MBOX_EDGE_CLUSTER,
      sendEventRequest
    );

    // NAVIGATE to clean page
    await t.navigateTo(TEST_PAGE_AT_JS_TWO);
    // get delivery API request adding sleep to make sure the request was triggered
    await t
      .expect(networkLogger.targetDeliveryEndpointLogs.count(() => true))
      .eql(1);
    const deliveryRequest =
      networkLogger.targetDeliveryEndpointLogs.requests[0];
    const requestUrl = deliveryRequest.request.url;
    const { searchParams, hostname } = new URL(requestUrl);

    // assert session IDs are the same for both requests
    const sessionIdFromDeliveryRequest = searchParams.get("sessionId");
    await t
      .expect(mboxCookie)
      .contains(
        `#${sessionIdFromDeliveryRequest}#`,
        "Session ID returned from Target Upstream does not match the session ID sent to delivery API"
      );

    // assert the same cluster is used
    const cluster = await extractCluster(hostname);
    await t
      .expect(`mboxedge${mboxEdgeClusterCookie}`)
      .eql(
        cluster,
        "Cluster ID returned from Target Upstream does not match the cluster ID  used in the path to delivery API"
      );
  }
);
