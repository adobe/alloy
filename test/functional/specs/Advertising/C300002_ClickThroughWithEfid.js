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

// Use default array of advertiser IDs
const config = compose(
  orgMainConfigMain,
  createAdvertisingConfig(),
  debugEnabled,
);

createFixture({
  title:
    "C300002: Click-through conversion with ef_id parameter should send advertising.clickThrough event",
  requestHooks: [networkLogger.edgeEndpointLogs],
  url: `${TEST_PAGE_URL}?test=advertising-clickthrough-efid&ef_id=test_experiment_456`,
});

test.meta({
  ID: "C300002",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("Test C300002: Click-through conversion with ef_id parameter should send advertising.clickThrough event", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);

  // Wait for edge calls
  await responseStatus(networkLogger.edgeEndpointLogs.requests, [200, 207]);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).gte(1);

  const conversionRequest = findClickThroughRequest(
    networkLogger.edgeEndpointLogs.requests,
  );
  await t
    .expect(conversionRequest)
    .ok("Expected to find advertising.clickThrough conversion request");

  // Validate conversion payload
  await validateClickThroughRequest(conversionRequest, {
    accountId: ADVERTISING_CONSTANTS.DEFAULT_ADVERTISER_IDS_STRING,
    experimentid: "test_experiment_456",
  });
});
