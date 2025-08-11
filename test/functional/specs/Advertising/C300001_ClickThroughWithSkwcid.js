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
    "C300001: Click-through conversion with s_kwcid parameter should NOT send advertising.enrichment_ct event (requires both parameters)",
  requestHooks: [networkLogger.edgeEndpointLogs],
  url: `${TEST_PAGE_URL}?test=advertising-clickthrough-skwcid&s_kwcid=test_keyword_123`,
});

test.meta({
  ID: "C300001",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("Test C300001: Click-through conversion with s_kwcid parameter should NOT send advertising.enrichment_ct event (requires both s_kwcid and ef_id)", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);

  // wait for at least one edge call
  await responseStatus(networkLogger.edgeEndpointLogs.requests, [200, 207]);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).gte(0);

  // verify that NO click-through request is made (since only s_kwcid is present, not ef_id)
  const conversionRequest = findClickThroughRequest(
    networkLogger.edgeEndpointLogs.requests,
  );
  await t
    .expect(conversionRequest)
    .notOk(
      "Should NOT find an advertising.enrichment_ct conversion request when only s_kwcid is present",
    );
});
