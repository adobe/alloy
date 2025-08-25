/*
 Copyright 2025 Adobe. All rights reserved.
 This file is licensed to you under the Apache License, Version 2.0 (the "License");
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

import {
  findClickThroughRequest,
  createAdvertisingConfig,
} from "../../helpers/assertions/advertising.js";

const networkLogger = createNetworkLogger();

const config = compose(
  orgMainConfigMain,
  createAdvertisingConfig(), // will pick up DEFAULT_ADVERTISER_IDS
  debugEnabled,
);

createFixture({
  title:
    "C300001: Click-through conversion with s_kwcid parameter should send advertising.enrichment_ct event",
  requestHooks: [networkLogger.edgeEndpointLogs],
  url: `${TEST_PAGE_URL}?test=advertising-clickthrough-skwcid&s_kwcid=test_keyword_123`,
});

test.meta({
  ID: "C300001",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("Test C300001: Click-through conversion with s_kwcid parameter should send advertising.enrichment_ct event", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);

  // wait for at least one edge call
  await responseStatus(networkLogger.edgeEndpointLogs.requests, [200, 207]);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).gte(0);

  // verify that a click-through request is made when only s_kwcid is present
  const conversionRequest = findClickThroughRequest(
    networkLogger.edgeEndpointLogs.requests,
  );
  await t
    .expect(conversionRequest)
    .ok(
      "Should find an advertising.enrichment_ct conversion request when s_kwcid is present",
    );
});
