import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import { TEST_PAGE, TEST_PAGE_AT_JS_ONE } from "../../helpers/constants/url";
import getResponseBody from "../../helpers/networkLogger/getResponseBody";
import createResponse from "../../helpers/createResponse";
import {
  MBOX_EDGE_CLUSTER,
  MBOX
} from "../../../../src/constants/legacyCookies";
import {
  assertKonductorReturnsCookieAndCookieIsSet,
  assertTargetMigrationEnabledIsSent,
  extractCluster,
  injectAlloyAndSendEvent,
  sleep
} from "./helper";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled, {
  targetMigrationEnabled: true
});

createFixture({
  title:
    "C8085773: Web SDK to At.js 1.x - Assert same session ID, edge cluster are used for both of the requests " +
    "interact and delivery API",
  requestHooks: [
    networkLogger.edgeEndpointLogs,
    networkLogger.targetMboxJsonEndpointLogs
  ],
  url: TEST_PAGE,
  includeAlloyLibrary: false
});

test.meta({
  ID: "C8085773",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test(
  "C8085773: Web SDK to At.js 1.x - Assert same session ID, edge cluster are used for both of the requests " +
    "interact and delivery API",
  async () => {
    // Loaded a page with Alloy
    await injectAlloyAndSendEvent(config);

    const sendEventRequest = networkLogger.edgeEndpointLogs.requests[0];
    const requestBody = JSON.parse(sendEventRequest.request.body);

    // Check that targetMigrationEnabled flag is sent in meta
    await assertTargetMigrationEnabledIsSent(requestBody);

    // Extract state:store payload
    const response = JSON.parse(
      getResponseBody(networkLogger.edgeEndpointLogs.requests[0])
    );
    const stateStorePayload = createResponse({
      content: response
    }).getPayloadsByType("state:store");
    await t.expect(stateStorePayload.length).gte(0);

    // Check that mbox cookie is present in the response from Konductor
    const mboxCookie = await assertKonductorReturnsCookieAndCookieIsSet(
      MBOX,
      stateStorePayload
    );

    // Check that mboxEdgeCluster cookie is present in the response from Konductor
    const mboxEdgeClusterCookie = await assertKonductorReturnsCookieAndCookieIsSet(
      MBOX_EDGE_CLUSTER,
      stateStorePayload
    );

    // NAVIGATE to clean page
    await t.navigateTo(TEST_PAGE_AT_JS_ONE);
    await sleep("3000");
    // get mbox json API request
    const mboxJsonRequest =
      networkLogger.targetMboxJsonEndpointLogs.requests[0];
    const requestUrl = mboxJsonRequest.request.url;
    const { searchParams, hostname } = new URL(requestUrl);

    // assert session IDs are the same for both requests
    const sessionIdFromMboxJsonRequest = searchParams.get("mboxSession");
    await t
      .expect(mboxCookie)
      .contains(
        `#${sessionIdFromMboxJsonRequest}#`,
        "Session ID returned from Target Upstream does not match the session ID sent in the request to Target"
      );

    // assert the same cluster is used
    const cluster = await extractCluster(hostname);
    await t
      .expect(`mboxedge${mboxEdgeClusterCookie}`)
      .eql(
        cluster,
        "Cluster ID returned from Target Upstream does not match the cluster ID  used in the path to request to Target"
      );
  }
);
