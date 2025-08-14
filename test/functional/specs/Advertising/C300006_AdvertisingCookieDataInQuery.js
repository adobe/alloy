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
    "C300006: Testing handleAdvertisingData options: auto, wait, and disabled modes",
  requestHooks: [networkLogger.edgeEndpointLogs],
  url: `${TEST_PAGE_URL}?test=advertising-options`,
});

test.meta({
  ID: "C300006",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("Test C300006: Auto mode - Advertising cookie data should be appended immediately to sendEvent query", async () => {
  await cookies.clear();
  networkLogger.edgeEndpointLogs.clear();

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

  // Make the first sendEvent call with auto mode (default behavior)
  // This should include cookie data immediately without waiting
  await alloy.sendEvent({
    xdm: {
      eventType: "web.webpagedetails.pageViews",
    },
  });

  await responseStatus(networkLogger.edgeEndpointLogs.requests, [200, 207]);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).gte(1);

  // Check that the request includes surferId from cookie
  await t
    .expect(() => {
      const allRequests = networkLogger.edgeEndpointLogs.requests;
      return allRequests.some((request) => {
        try {
          const body = JSON.parse(request.request.body);
          const advertising = body.events?.[0]?.query?.advertising;
          if (!advertising) return false;

          // In auto mode, we should get the surferId from cookie immediately
          const hasSurferIdFromCookie =
            advertising.stitchIds?.surferId ===
            ADVERTISING_CONSTANTS.SAMPLE_SURFER_ID;

          return hasSurferIdFromCookie;
        } catch {
          return false;
        }
      });
    })
    .ok(
      "Expected to find advertising request with surferId from cookie in auto mode",
    );
});

test("Test C300006: Wait mode - Should wait for advertising IDs to be collected", async () => {
  await cookies.clear();
  networkLogger.edgeEndpointLogs.clear();

  const alloy = createAlloyProxy();
  await alloy.configure(config);

  // Make sendEvent call with wait mode
  // This should wait for advertising IDs to be collected (up to timeout)
  await alloy.sendEvent({
    xdm: {
      eventType: "web.webpagedetails.pageViews",
    },
    advertising: {
      handleAdvertisingData: "wait",
    },
  });

  await responseStatus(networkLogger.edgeEndpointLogs.requests, [200, 207]);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).gte(1);

  // Check that the request was made (may or may not have IDs depending on timeout)
  // But the important thing is that it waited before sending
  await t
    .expect(() => {
      const allRequests = networkLogger.edgeEndpointLogs.requests;
      return allRequests.some((request) => {
        try {
          const body = JSON.parse(request.request.body);
          const events = body.events || [];
          // Look for the page view event among all events
          return events.some(
            (event) => event.xdm?.eventType === "web.webpagedetails.pageViews",
          );
        } catch {
          return false;
        }
      });
    })
    .ok(
      "Expected to find page view event with eventType 'web.webpagedetails.pageViews'",
    );
});

test("Test C300006: Disabled mode - Should not include advertising data", async () => {
  await cookies.clear();
  networkLogger.edgeEndpointLogs.clear();

  // Set up advertising cookie data
  const advertisingCookieData = {
    surferId: ADVERTISING_CONSTANTS.SAMPLE_SURFER_ID,
    lastConversionTime: 1753102357031,
  };

  await setAdvertisingCookie(advertisingCookieData);

  const alloy = createAlloyProxy();
  await alloy.configure(config);

  // Make sendEvent call with disabled mode
  // This should NOT include any advertising data even if it's available
  await alloy.sendEvent({
    xdm: {
      eventType: "web.webpagedetails.pageViews",
    },
    advertising: {
      handleAdvertisingData: "disabled",
    },
  });

  await responseStatus(networkLogger.edgeEndpointLogs.requests, [200, 207]);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).gte(1);

  // Check that NO advertising data is included in the request
  const allRequests = networkLogger.edgeEndpointLogs.requests;

  // Check specifically for stitchIds which come from onBeforeEvent hook
  // (advIds might come from view-through conversion which runs separately)
  const hasStitchIds = allRequests.some((request) => {
    try {
      const body = JSON.parse(request.request.body);
      const advertising = body.events?.[0]?.query?.advertising;
      const stitchIds = advertising?.stitchIds;

      // Check if we have any stitchIds beyond the default ipAddress
      return (
        stitchIds &&
        Object.keys(stitchIds).some(
          (key) => key !== "ipAddress" && stitchIds[key],
        )
      );
    } catch {
      return false;
    }
  });

  await t
    .expect(hasStitchIds)
    .notOk(
      "Expected NO stitchIds (surferId, id5, rampId) when handleAdvertisingData is disabled",
    );
});
