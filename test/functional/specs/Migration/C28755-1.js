import { ClientFunction, t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import { LEGACY, TEST_PAGE } from "../../helpers/constants/url";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import createConsoleLogger from "../../helpers/consoleLogger";
import { injectAlloyDuringTest } from "../../helpers/createFixture/clientScripts";
import cookies from "../../helpers/cookies";
import getResponseBody from "../../helpers/networkLogger/getResponseBody";
import createResponse from "../../helpers/createResponse";
import { MBOX } from "../../../../src/constants/cookieNameKey";
import { MBOX_EDGE_CLUSTER } from "../../../../src/constants/legacyCookies";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled, {
  targetMigrationEnabled: true
});

createFixture({
  title: "Mixed mode: Web SDK first then navigating to a page with at.js 2.x",
  requestHooks: [
    networkLogger.edgeEndpointLogs,
    networkLogger.targetDeliveryEndpointLogs
  ],
  url: `${TEST_PAGE}`,
  includeAlloyLibrary: false
});

test.meta({
  ID: "C28755",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const getAtjsVersion = ClientFunction(() => {
  const target = window.adobe.target;

  return target.VERSION;
});

const extractCluster = hostname => {
  const values = hostname.split(".");
  return values[0];
};

test("First loaded a page web sdk and navigate to a page with at.js", async () => {
  // Loaded a page with Alloy
  const alloy = createAlloyProxy();
  await alloy.configureAsync(config);
  await alloy.getLibraryInfoAsync();
  const logger = await createConsoleLogger();
  await injectAlloyDuringTest();
  await logger.info.expectMessageMatching(/Executing getLibraryInfo command/);
  await alloy.sendEvent();
  const sendEventRequest = networkLogger.edgeEndpointLogs.requests[0];
  const requestBody = JSON.parse(sendEventRequest.request.body);

  // Check that targetMigrationEnabled flag is sent in meta
  await t.expect(requestBody.meta.target).eql({ migration: true });

  // Check that mbox cookie is present in the response from Konductor
  const response = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0])
  );

  const stateStorePayload = createResponse({
    content: response
  }).getPayloadsByType("state:store");
  await t.expect(stateStorePayload.length).gte(0);

  const responseContainsMboxCookie = stateStorePayload.find(h => {
    return h.key.includes(MBOX);
  });
  await t.expect(responseContainsMboxCookie).ok();

  // Check that mboxEdgeCluster cookie is present in the response from Konductor
  const responseContainsMboxEdgeClusterCookie = stateStorePayload.find(
    entry => {
      return entry.key.includes(MBOX_EDGE_CLUSTER);
    }
  );
  await t.expect(responseContainsMboxEdgeClusterCookie).ok();

  // Check that mbox edge cluster cookie is set
  const mboxEdgeClusterCookieValue = await cookies.get(MBOX_EDGE_CLUSTER);
  await t.expect(mboxEdgeClusterCookieValue).ok();
  // Check that mbox  cookie is set
  const mboxCookieValue = await cookies.get(MBOX);
  await t.expect(mboxCookieValue).ok();

  // NAVIGATE to at.js page
  await t.navigateTo(LEGACY);

  const version = await getAtjsVersion();
  await t.expect(version).eql("2.0.0");

  // get delivery API request
  const deliveryRequest = networkLogger.targetDeliveryEndpointLogs.requests[0];
  const requestUrl = deliveryRequest.request.url;
  const { searchParams, hostname } = new URL(requestUrl);

  // assert session IDs are the same for both requests
  const sessionIdFromDeliveryRequest = searchParams.get("sessionId");
  await t
    .expect(mboxCookieValue)
    .contains(
      `#${sessionIdFromDeliveryRequest}#`,
      "Session ID returned from Target Upstream does not match the session ID sent to delivery API"
    );

  // assert the same cluster is used
  const cluster = extractCluster(hostname);
  await t
    .expect(`mboxedge${mboxEdgeClusterCookieValue}`)
    .eql(
      cluster,
      "Cluster ID returned from Target Upstream does not match the cluster ID  used in the path to delivery API"
    );
});
