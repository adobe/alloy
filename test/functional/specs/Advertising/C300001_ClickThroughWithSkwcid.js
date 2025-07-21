/*
Copyright 2025 Adobe. All rights reserved.
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
} from "../../helpers/assertions/advertising.js";

const networkLogger = createNetworkLogger();

const advertisingConfig = {
  advertising: {
    advertiserIds: ["83565", "83567", "83569"],
  },
};

const config = compose(orgMainConfigMain, advertisingConfig, debugEnabled);

createFixture({
  title:
    "C300001: Click-through conversion with s_kwcid parameter should send advertising.clickThrough event",
  requestHooks: [networkLogger.edgeEndpointLogs],
  url: `${TEST_PAGE_URL}?test=advertising-clickthrough-skwcid&s_kwcid=test_keyword_123`,
});

test.meta({
  ID: "C300001",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("Test C300001: Click-through conversion with s_kwcid parameter should send advertising.clickThrough event", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);

  // The advertising component should automatically detect s_kwcid parameter and send conversion
  await responseStatus(networkLogger.edgeEndpointLogs.requests, [200, 207]);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).gte(1);

  // Find the advertising conversion request using helper
  const conversionRequest = findClickThroughRequest(
    networkLogger.edgeEndpointLogs.requests,
  );
  await t
    .expect(conversionRequest)
    .ok("Expected to find advertising conversion request");

  // Validate request using helper
  await validateClickThroughRequest(conversionRequest, {
    accountId: "83565, 83567, 83569",
    sampleGroupId: "test_keyword_123",
    // experimentid not expected for s_kwcid only test
  });
});
