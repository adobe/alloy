import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import { TEST_PAGE, TEST_PAGE_AT_JS_TWO } from "../../helpers/constants/url";
import cookies from "../../helpers/cookies";
import { MBOX } from "../../../../src/constants/cookieNameKey";
import { MBOX_EDGE_CLUSTER } from "../../../../src/constants/legacyCookies";
import {
  assertTargetMigrationEnabledIsSent,
  injectAlloyAndSendEvent,
  sleep
} from "./helper";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled, {
  targetMigrationEnabled: true
});

createFixture({
  title:
    "Mixed mode: AT.js is called first then we navigate to a page with Web SDK",
  requestHooks: [
    networkLogger.edgeEndpointLogs,
    networkLogger.targetDeliveryEndpointLogs
  ],
  url: `${TEST_PAGE_AT_JS_TWO}`,
  includeAlloyLibrary: false
});

test.meta({
  ID: "C28755",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const getLocationHint = pathname => {
  const values = pathname.split("/");
  const locationHint = values[2];

  return Number(locationHint.split("t")[1]);
};

test("Visit a page with at.js 2.x first then navigate to a page with Web SDK", async () => {
  await sleep(3000);
  // Get delivery API request
  const deliveryRequest = networkLogger.targetDeliveryEndpointLogs.requests[0];
  await t.expect(deliveryRequest.response.statusCode).eql(200);
  const { searchParams } = new URL(deliveryRequest.request.url);
  // Extract the session ID from the request query params
  const sessionIdFromDeliveryRequest = searchParams.get("sessionId");
  const mboxEdgeClusterCookieValue = await cookies.get(MBOX_EDGE_CLUSTER);
  await t.expect(mboxEdgeClusterCookieValue).ok();
  // Check that mbox  cookie is set
  const mboxCookieValue = await cookies.get(MBOX);
  await t.expect(mboxCookieValue).ok();

  // NAVIGATE to a web sdk page
  await t.navigateTo(TEST_PAGE);
  await injectAlloyAndSendEvent(config);
  const sendEventRequest = networkLogger.edgeEndpointLogs.requests[0];
  const requestBody = JSON.parse(sendEventRequest.request.body);

  // Check that targetMigrationEnabled is sent in meta
  await assertTargetMigrationEnabledIsSent(requestBody);
  // Extract location hint
  const { pathname } = new URL(sendEventRequest.request.url);
  const aepRequestLocationHint = getLocationHint(pathname);
  // Assert the location hint used for interact endpoint is the same as in mboxEdgeCluster Cookie value
  await t.expect(mboxEdgeClusterCookieValue).eql(aepRequestLocationHint);
  // Check that mbox cookie is present in the request state
  const { entries: stateStore } = requestBody.meta.state;

  const requestMboxCookie = stateStore.find(entry => {
    return entry.key.includes(MBOX);
  });
  // Assert the session IDs are the same
  await t
    .expect(requestMboxCookie.value)
    .contains(
      `#${sessionIdFromDeliveryRequest}#`,
      "Session ID from Delivery request should be eql to session ID from mbox cookie sent in meta.state"
    );
});
