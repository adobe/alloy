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
  createAdvertisingConfig,
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
    "C300002: Click-through conversion with ef_id parameter should NOT send advertising.enrichment_ct event (requires both parameters)",
  requestHooks: [networkLogger.edgeEndpointLogs],
  url: `${TEST_PAGE_URL}?test=advertising-clickthrough-efid&ef_id=test_experiment_456`,
});

test.meta({
  ID: "C300002",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("Test C300002: Click-through conversion with ef_id parameter should NOT send advertising.enrichment_ct event (requires both s_kwcid and ef_id)", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);

  // Wait for edge calls
  await responseStatus(networkLogger.edgeEndpointLogs.requests, [200, 207]);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).gte(0);

  const conversionRequest = findClickThroughRequest(
    networkLogger.edgeEndpointLogs.requests,
  );
  await t
    .expect(conversionRequest)
    .notOk(
      "Should NOT find an advertising.enrichment_ct conversion request when only ef_id is present",
    );
});
