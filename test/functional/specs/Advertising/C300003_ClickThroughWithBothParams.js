/*
 Copyright 2025 Adobe. All rights reserved.
 This file is licensed to you under the Apache License, Version 2.0 (the "License");
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
import {
  findClickThroughRequest,
  validateClickThroughRequest,
  createAdvertisingConfig,
  ADVERTISING_CONSTANTS,
} from "../../helpers/assertions/advertising.js";

const networkLogger = createNetworkLogger();

// Build config with default advertiserSettings array
const config = compose(
  orgMainConfigMain,
  createAdvertisingConfig(),
  debugEnabled,
);

createFixture({
  title:
    "C300003: Click-through conversion with both s_kwcid and ef_id parameters should send advertising.clickThrough event",
  requestHooks: [networkLogger.edgeEndpointLogs],
  url: `${TEST_PAGE_URL}?test=advertising-clickthrough-both&s_kwcid=test_keyword_123&ef_id=test_experiment_456`,
});

test.meta({
  ID: "C300003",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("Test C300003: Click-through conversion with both s_kwcid and ef_id parameters should send advertising.clickThrough event", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);

  // Wait for edge endpoint responses
  await responseStatus(networkLogger.edgeEndpointLogs.requests, [200, 207]);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).gte(1);

  // Locate the click-through conversion request
  const conversionRequest = findClickThroughRequest(
    networkLogger.edgeEndpointLogs.requests,
  );
  await t
    .expect(conversionRequest)
    .ok("Expected to find advertising.clickThrough conversion request");

  // Validate conversion payload with advertiserSettings
  await validateClickThroughRequest(conversionRequest, {
    accountId: ADVERTISING_CONSTANTS.DEFAULT_ADVERTISER_IDS_STRING,
    sampleGroupId: "test_keyword_123",
    experimentid: "test_experiment_456",
  });
});
