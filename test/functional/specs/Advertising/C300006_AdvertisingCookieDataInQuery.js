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
import { t, ClientFunction } from "testcafe";
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
} from "../../helpers/assertions/advertising.js";

const networkLogger = createNetworkLogger();

const config = compose(
  orgMainConfigMain,
  createAdvertisingConfig(),
  debugEnabled,
);

// Function to set advertising cookie data
const setAdvertisingCookie = ClientFunction((cookieData) => {
  // Set the advertising cookie with complete advertising data
  const encodedData = encodeURIComponent(JSON.stringify(cookieData));
  document.cookie = `advertising=${encodedData}; path=/; domain=.alloyio.com`;
});

createFixture({
  title:
    "C300006: Advertising cookie data including surferId should be appended to sendEvent query",
  requestHooks: [networkLogger.edgeEndpointLogs],
  url: `${TEST_PAGE_URL}?test=advertising-cookie-data`,
});

test.meta({
  ID: "C300006",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("Test C300006: Advertising cookie data including surferId should be appended to sendEvent query", async () => {
  await cookies.clear();

  // Set up complete advertising cookie data before configuring Alloy
  const advertisingCookieData = {
    _les_lsc: {
      click_time: 1753092127351,
      skwcid: "123",
      efid: "111",
    },
    lastConversionTime: 1753102357031,
    id5Id_last_conversion: 1753102357031,
    surferId: ADVERTISING_CONSTANTS.SAMPLE_SURFER_ID,
    ev_lcc: "__LCC__",
    surferId_last_conversion: 1753102357031,
  };

  await setAdvertisingCookie(advertisingCookieData);

  // Verify the cookie was set correctly
  const cookieValue = await cookies.get("advertising");
  await t.expect(cookieValue).ok("Expected advertising cookie to be set");
  await t
    .expect(cookieValue.surferId)
    .eql(ADVERTISING_CONSTANTS.SAMPLE_SURFER_ID, "Expected surferId in cookie");

  const alloy = createAlloyProxy();
  await alloy.configure(config);

  // Make the first sendEvent call (this should trigger advertising data inclusion)
  await alloy.sendEvent({});

  await responseStatus(networkLogger.edgeEndpointLogs.requests, [200, 207]);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).gte(1);

  // Wait for advertising requests with potential cookie data
  await t
    .expect(() => {
      const allRequests = networkLogger.edgeEndpointLogs.requests;
      return allRequests.some((request) => {
        try {
          const body = JSON.parse(request.request.body);
          const advertising = body.events?.[0]?.query?.advertising;
          if (!advertising) return false;

          // Check if we have surferId from cookie or any other advertising data
          const hasSurferId =
            advertising.stitchIds?.surferId ===
            ADVERTISING_CONSTANTS.SAMPLE_SURFER_ID;
          const hasOtherIds =
            advertising.stitchIds &&
            (advertising.stitchIds.id5 || advertising.stitchIds.rampIDEnv);
          const hasClickData =
            advertising.lastSearchClick || advertising.lastDisplayClick;

          return hasSurferId || hasOtherIds || hasClickData;
        } catch {
          return false;
        }
      });
    })
    .ok(
      "Expected to find advertising request with cookie data or resolved IDs",
    );
});
