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
import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger/index.js";
import { responseStatus } from "../../helpers/assertions/index.js";
import createFixture from "../../helpers/createFixture/index.js";
import { orgMainConfigMain } from "../../helpers/constants/configParts/index.js";
import { TEST_PAGE_WITH_CSP as TEST_PAGE_WITH_CSP_URL } from "../../helpers/constants/url.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";

const networkLogger = createNetworkLogger();

const TEST_ID = "C753470";

createFixture({
  title: `${TEST_ID}: A nonce attribute should be added to injected style tags when CSP nonce is available`,
  url: `${TEST_PAGE_WITH_CSP_URL}?test=${TEST_ID}`,
  requestHooks: [networkLogger.edgeEndpointLogs],
});

test.meta({
  ID: `${TEST_ID}`,
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

const testStyleApplied = ClientFunction(() => {
  const headerOpacity = window
    .getComputedStyle(document.querySelector("h1"))
    .getPropertyValue("opacity");
  return headerOpacity === "0.5";
});

test(`Test ${TEST_ID}: A nonce attribute should be added to injected style tags when CSP nonce is available`, async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(orgMainConfigMain);
  // This event should result in Personalization component injecting a style tag
  await alloy.sendEvent({ renderDecisions: true });
  await responseStatus(networkLogger.edgeEndpointLogs.requests, [200, 207]);
  // Verify that the returned style tag with nonce attr was injected by Personalization
  await t
    .expect(testStyleApplied())
    .ok(`Header style (opacity=0.5) was not applied`);
});
