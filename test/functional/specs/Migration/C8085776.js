/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger/index.js";
import createFixture from "../../helpers/createFixture/index.js";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  targetMigrationEnabled,
} from "../../helpers/constants/configParts/index.js";
import { TEST_PAGE, TEST_PAGE_AT_JS_TWO } from "../../helpers/constants/url.js";
import cookies from "../../helpers/cookies.js";
import {
  MBOX_EDGE_CLUSTER,
  MBOX,
} from "../../../../src/constants/legacyCookies.js";
import {
  assertTargetMigrationEnabledIsSent,
  getLocationHint,
  injectAlloyAndSendEvent,
} from "./helper.js";
import { responseStatus } from "../../helpers/assertions/index.js";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled, targetMigrationEnabled);

createFixture({
  title:
    "C8085776: At.js 2.x to Web SDK - Assert same session ID, edge cluster are used " +
    "for both of the requests interact and delivery API",
  requestHooks: [
    networkLogger.edgeEndpointLogs,
    networkLogger.targetDeliveryEndpointLogs,
  ],
  url: TEST_PAGE_AT_JS_TWO,
  includeAlloyLibrary: false,
});

test.meta({
  ID: "C8085776",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test(
  "C8085776: At.js 2.x to Web SDK - Assert same session ID, edge cluster are used " +
    "for both of the requests interact and delivery API",
  async () => {
    // Increase wait time
    await t.wait(5000);

    const requestCount = await networkLogger.targetDeliveryEndpointLogs.count(
      () => true,
    );
    console.log(`Number of Target delivery requests: ${requestCount}`);

    // Log the contents of the requests for debugging
    const requests = networkLogger.targetDeliveryEndpointLogs.requests;
    console.log("Target delivery requests:", JSON.stringify(requests, null, 2));

    await t
      .expect(requestCount)
      .gte(1, "Expected at least one Target delivery request");

    // Get delivery API request
    const deliveryRequest =
      networkLogger.targetDeliveryEndpointLogs.requests[0];

    if (!deliveryRequest) {
      console.log("No Target delivery request found");
      await t.expect(false).ok("No Target delivery request was logged");
    }

    await responseStatus(networkLogger.targetDeliveryEndpointLogs, [200, 207]);
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
    await assertTargetMigrationEnabledIsSent(sendEventRequest);
    // Extract location hint
    const { pathname } = new URL(sendEventRequest.request.url);
    const aepRequestLocationHint = getLocationHint(pathname);
    // Assert the location hint used for interact endpoint is the same as in mboxEdgeCluster Cookie value
    await t.expect(mboxEdgeClusterCookieValue).eql(aepRequestLocationHint);
    // Check that mbox cookie is present in the request state
    const { entries: stateStore } = requestBody.meta.state;

    const requestMboxCookie = stateStore.find((entry) => {
      return entry.key.includes(MBOX);
    });
    // Assert the session IDs are the same
    await t
      .expect(requestMboxCookie.value)
      .contains(
        `#${sessionIdFromDeliveryRequest}#`,
        "Session ID from Delivery request should be eql to session ID from mbox cookie sent in meta.state",
      );
  },
);
