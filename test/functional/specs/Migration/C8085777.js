import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import { TEST_PAGE, TEST_PAGE_AT_JS_TWO } from "../../helpers/constants/url";
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
  fetchMboxOffer,
  MIGRATION_LOCATION,
  sleep
} from "./helper";
import migrationEnabled from "../../helpers/constants/configParts/migrationEnabled";
import createAlloyProxy from "../../helpers/createAlloyProxy";

const favoriteColor = "violet-1234";
const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled, migrationEnabled, {
  targetMigrationEnabled: true
});
createFixture({
  title:
    "C8085777: Use same visitor profile in mixed mode implementation: Update profile attribute using " +
    "web sdk and fetch offer based on profile attr using at.js 2.x",
  requestHooks: [
    networkLogger.edgeEndpointLogs,
    networkLogger.targetDeliveryEndpointLogs
  ],
  url: TEST_PAGE,
  includeAlloyLibrary: true
});

test.meta({
  ID: "C8085777",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test(
  "C8085777: Use same visitor profile in mixed mode implementation: Update profile attribute using " +
    "web sdk and fetch offer based on profile attr using at.js 2.x",
  async () => {
    const options = {
      renderDecisions: true,
      data: {
        __adobe: {
          target: {
            "profile.favoriteColor": favoriteColor
          }
        }
      }
    };
    // Loaded a page with Alloy
    const alloy = createAlloyProxy();
    await alloy.configure(config);
    await alloy.sendEvent(options);
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
    await t.navigateTo(TEST_PAGE_AT_JS_TWO);
    // get delivery API request adding sleep to make sure the request was triggered
    await sleep(3000);
    await fetchMboxOffer({ mbox: MIGRATION_LOCATION });
    const deliveryRequest =
      networkLogger.targetDeliveryEndpointLogs.requests[1];
    await sleep(3000);
    // Extract state:store payload
    const deliveryResponse = JSON.parse(getResponseBody(deliveryRequest));

    const mbox = deliveryResponse.execute.mboxes[0];

    const content = mbox.options[0].content;
    await t
      .expect(content)
      .eql(`The favorite Color for this visitor is ${favoriteColor}.`);
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
