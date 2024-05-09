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
import getResponseBody from "../../helpers/networkLogger/getResponseBody.js";
import {
  MBOX_EDGE_CLUSTER,
  MBOX,
} from "../../../../src/constants/legacyCookies.js";
import {
  assertKonductorReturnsCookieAndCookieIsSet,
  assertSameLocationHintIsUsed,
  assertTargetMigrationEnabledIsSent,
  fetchMboxOffer,
  MIGRATION_LOCATION,
} from "./helper.js";
import migrationEnabled from "../../helpers/constants/configParts/migrationEnabled.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";

const favoriteColor = "violet-1234";
const networkLogger = createNetworkLogger();
const config = compose(
  orgMainConfigMain,
  debugEnabled,
  migrationEnabled,
  targetMigrationEnabled,
);
createFixture({
  title:
    "C8085777: Use same visitor profile in mixed mode implementation: Update profile attribute using " +
    "web sdk and fetch offer based on profile attr using at.js 2.x",
  requestHooks: [
    networkLogger.edgeEndpointLogs,
    networkLogger.targetDeliveryEndpointLogs,
  ],
  url: TEST_PAGE,
  includeAlloyLibrary: true,
});

test.meta({
  ID: "C8085777",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test.skip(
  "C8085777: Use same visitor profile in mixed mode implementation: Update profile attribute using " +
    "web sdk and fetch offer based on profile attr using at.js 2.x",
  async () => {
    const options = {
      renderDecisions: true,
      data: {
        __adobe: {
          target: {
            "profile.favoriteColor": favoriteColor,
          },
        },
      },
    };
    // Loaded a page with Alloy
    const alloy = createAlloyProxy();
    await alloy.configure(config);
    await alloy.sendEvent(options);
    await t.expect(networkLogger.edgeEndpointLogs.count(() => true)).eql(1);
    const sendEventRequest = networkLogger.edgeEndpointLogs.requests[0];

    // Check that targetMigrationEnabled flag is sent in meta
    await assertTargetMigrationEnabledIsSent(sendEventRequest);

    // Check that mbox cookie is present in the response from Konductor
    const mboxCookie = await assertKonductorReturnsCookieAndCookieIsSet(
      MBOX,
      sendEventRequest,
    );

    // Check that mboxEdgeCluster cookie is present in the response from Konductor
    const mboxEdgeClusterCookie =
      await assertKonductorReturnsCookieAndCookieIsSet(
        MBOX_EDGE_CLUSTER,
        sendEventRequest,
      );

    // NAVIGATE to clean page
    await t.navigateTo(TEST_PAGE_AT_JS_TWO);
    // get delivery API request adding sleep to make sure the request was triggered
    await fetchMboxOffer({ mbox: MIGRATION_LOCATION });
    const deliveryRequest =
      networkLogger.targetDeliveryEndpointLogs.requests[1];
    await t
      .expect(networkLogger.targetDeliveryEndpointLogs.count(() => true))
      .eql(2);
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
        "Session ID returned from Target Upstream does not match the session ID sent to delivery API",
      );

    // assert the same cluster is used
    await assertSameLocationHintIsUsed(hostname, mboxEdgeClusterCookie);
  },
);
