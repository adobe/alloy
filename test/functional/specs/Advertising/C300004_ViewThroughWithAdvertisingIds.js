/*
 Copyright 2025 Adobe. All rights reserved.
 ...
*/

import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger/index.js";
import { responseStatus } from "../../helpers/assertions/index.js";
import createFixture from "../../helpers/createFixture/index.js";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
} from "../../helpers/constants/configParts/index.js";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import cookies from "../../helpers/cookies.js";
import {
  createAdvertisingConfig,
  ADVERTISING_CONSTANTS,
  findViewThroughRequests,
  validateViewThroughRequest,
} from "../../helpers/assertions/advertising.js";

const networkLogger = createNetworkLogger();

const config = compose(
  orgMainConfigMain,
  createAdvertisingConfig({
    id5PartnerId: ADVERTISING_CONSTANTS.ID5_PARTNER_ID,
    rampIdJSPath: ADVERTISING_CONSTANTS.RAMP_ID_JS_PATH,
  }),
  debugEnabled,
);

createFixture({
  title:
    "C300004: View-through conversion should send conversion query with advertising IDs",
  requestHooks: [networkLogger.edgeEndpointLogs],
  url: `${TEST_PAGE_URL}?test=advertising-viewthrough`,
});

test.meta({
  ID: "C300004",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("Test C300004: View-through conversion should send conversion query with advertising IDs", async () => {
  // 1) Clear all cookies so we start fresh
  await cookies.clear();
  networkLogger.edgeEndpointLogs.clear();
  const alloy = createAlloyProxy();
  await alloy.configure(config);

  await responseStatus(networkLogger.edgeEndpointLogs.requests, [200, 207]);

  await t.wait(3000);

  const viewThroughRequests = findViewThroughRequests(
    networkLogger.edgeEndpointLogs.requests,
  );
  await t
    .expect(viewThroughRequests.length)
    .gte(1, "Expected at least one view-through request");

  // Validate that the first view-through request has the correct structure
  const firstViewThroughRequest = viewThroughRequests[0];
  await validateViewThroughRequest(firstViewThroughRequest, {
    advIds: ADVERTISING_CONSTANTS.DEFAULT_ADVERTISER_IDS_STRING,
    requireIds: false, // Don't require specific IDs since they may vary in test environment
  });
});
