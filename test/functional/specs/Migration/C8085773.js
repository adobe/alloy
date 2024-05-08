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
import { TEST_PAGE, TEST_PAGE_AT_JS_ONE } from "../../helpers/constants/url.js";
import {
  MBOX_EDGE_CLUSTER,
  MBOX,
} from "../../../../src/constants/legacyCookies.js";
import {
  assertKonductorReturnsCookieAndCookieIsSet,
  assertSameLocationHintIsUsed,
  assertTargetMigrationEnabledIsSent,
} from "./helper.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled, targetMigrationEnabled);

createFixture({
  title:
    "C8085773: Web SDK to At.js 1.x - Assert same session ID, edge cluster are used for both of the requests " +
    "interact and delivery API",
  requestHooks: [
    networkLogger.edgeEndpointLogs,
    networkLogger.targetMboxJsonEndpointLogs,
  ],
  url: TEST_PAGE,
  includeAlloyLibrary: true,
});

test.meta({
  ID: "C8085773",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test(
  "C8085773: Web SDK to At.js 1.x - Assert same session ID, edge cluster are used for both of the requests " +
    "interact and delivery API",
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
      sendEventRequest,
    );

    // Check that mboxEdgeCluster cookie is present in the response from Konductor
    const mboxEdgeClusterCookie =
      await assertKonductorReturnsCookieAndCookieIsSet(
        MBOX_EDGE_CLUSTER,
        sendEventRequest,
      );

    // NAVIGATE to clean page
    await t.navigateTo(TEST_PAGE_AT_JS_ONE);
    // get mbox json API request
    await t
      .expect(networkLogger.targetMboxJsonEndpointLogs.count(() => true))
      .eql(1);
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
        "Session ID returned from Target Upstream does not match the session ID sent in the request to Target",
      );

    // assert the same cluster is used
    await assertSameLocationHintIsUsed(hostname, mboxEdgeClusterCookie);
  },
);
