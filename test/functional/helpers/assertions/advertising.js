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

/**
 * Finds the first advertising click-through conversion request in the network logs
 * @param {Array} requests - Array of network request logs
 * @returns {Object|null} - The first click-through request or null if not found
 */
export const findClickThroughRequest = (requests) => {
  return requests.find((request) => {
    try {
      const body = JSON.parse(request.request.body);
      return (
        body.events &&
        body.events.length > 0 &&
        body.events[0].xdm &&
        // eslint-disable-next-line no-underscore-dangle
        body.events[0].xdm._experience &&
        // eslint-disable-next-line no-underscore-dangle
        body.events[0].xdm._experience.adCloud &&
        // eslint-disable-next-line no-underscore-dangle
        body.events[0].xdm._experience.adCloud.eventType ===
          "advertising.clickThrough"
      );
    } catch {
      return false;
    }
  });
};

/**
 * Finds advertising view-through conversion requests in the network logs
 * @param {Array} requests - Array of network request logs
 * @returns {Array} - Array of view-through requests
 */
export const findViewThroughRequests = (requests) => {
  return requests.filter((request) => {
    try {
      const body = JSON.parse(request.request.body);
      return (
        body.events &&
        body.events.length > 0 &&
        body.events[0].query &&
        body.events[0].query.advertising &&
        body.events[0].query.advertising.conversion
      );
    } catch {
      return false;
    }
  });
};

/**
 * Validates click-through conversion request structure and content
 * @param {Object} request - Network request object
 * @param {Object} expectedData - Expected conversion data
 * @param {string} expectedData.accountId - Expected advertiser account ID
 * @param {string} [expectedData.sampleGroupId] - Expected s_kwcid value
 * @param {string} [expectedData.experimentid] - Expected ef_id value
 */
export const validateClickThroughRequest = async (request, expectedData) => {
  const requestBody = JSON.parse(request.request.body);
  const event = requestBody.events[0];
  // eslint-disable-next-line no-underscore-dangle
  const adCloud = event.xdm._experience.adCloud;

  // Validate click-through event structure
  await t.expect(adCloud.eventType).eql("advertising.clickThrough");
  await t.expect(adCloud.campaign).ok("Expected campaign data");
  await t
    .expect(adCloud.campaign.adConversionDetails)
    .ok("Expected adConversionDetails");

  const conversionDetails = adCloud.campaign.adConversionDetails;

  // Validate advertiser IDs
  await t.expect(conversionDetails.accountId).eql(expectedData.accountId);

  // Validate optional tracking parameters
  if (expectedData.sampleGroupId) {
    await t
      .expect(conversionDetails.sampleGroupId)
      .eql(expectedData.sampleGroupId);
  }

  if (expectedData.experimentid) {
    await t
      .expect(conversionDetails.experimentid)
      .eql(expectedData.experimentid);
  }
};

/**
 * Validates view-through conversion request structure and content
 * @param {Object} request - Network request object
 * @param {Object} expectedData - Expected conversion data
 * @param {string} expectedData.advIds - Expected advertiser IDs
 * @param {Array<string>} [expectedData.expectedIds] - Array of ID types that should be present
 * @param {boolean} [expectedData.requireIds=true] - Whether to require at least one advertising ID
 */
export const validateViewThroughRequest = async (request, expectedData) => {
  const requestBody = JSON.parse(request.request.body);
  const event = requestBody.events[0];
  const advertising = event.query.advertising;
  const conversion = advertising.conversion;

  // Validate required conversion data structure
  await t.expect(conversion).ok("Expected conversion data");
  await t.expect(conversion.stitchIds).ok("Expected stitchIds");
  await t.expect(conversion.advIds).eql(expectedData.advIds);

  // Validate that at least one advertising ID is present (if required)
  const stitchIds = conversion.stitchIds;
  const hasAnyId = stitchIds.surferId || stitchIds.id5 || stitchIds.rampIDEnv;

  if (expectedData.requireIds !== false) {
    await t
      .expect(hasAnyId)
      .ok("Expected at least one advertising ID in stitchIds");
  }

  // Validate specific IDs if expectedIds is provided
  if (expectedData.expectedIds) {
    const validationPromises = expectedData.expectedIds.map(async (idType) => {
      switch (idType) {
        case "surferId":
          await t
            .expect(stitchIds.surferId)
            .ok("Expected surferId to be present");
          break;
        case "id5":
          await t.expect(stitchIds.id5).ok("Expected ID5 to be present");
          break;
        case "rampIDEnv":
          await t
            .expect(stitchIds.rampIDEnv)
            .ok("Expected RampID to be present");
          break;
        default:
          // eslint-disable-next-line no-console
          console.warn(`Unknown ID type: ${idType}`);
      }
    });
    await Promise.all(validationPromises);
  }

  // Validate optional display click data
  if (conversion.lastDisplayClick) {
    await t
      .expect(typeof conversion.lastDisplayClick)
      .eql("string", "lastDisplayClick should be a string if present");
  }
};

/**
 * Waits for view-through conversion requests with advertising IDs resolved
 * @param {Array} requests - Network request logs to monitor
 * @param {Object} expectedData - Expected conversion data
 * @param {number} [timeout=30000] - Timeout in milliseconds
 * @returns {Promise<Object>} - Promise that resolves to the conversion request with IDs
 */
export const waitForViewThroughWithIds = async (
  requests,
  expectedData,
  timeout = 30000,
) => {
  const startTime = Date.now();

  const checkForConversionWithIds = () => {
    const conversionRequests = findViewThroughRequests(requests);

    const foundRequest = conversionRequests.find((request) => {
      try {
        const requestBody = JSON.parse(request.request.body);
        const event = requestBody.events[0];
        const conversion = event.query.advertising.conversion;
        const stitchIds = conversion.stitchIds;

        // Check if we have at least one advertising ID resolved
        const hasAnyId =
          stitchIds.surferId || stitchIds.id5 || stitchIds.rampIDEnv;

        return hasAnyId && conversion.advIds === expectedData.advIds;
      } catch {
        return false;
      }
    });

    return foundRequest || null;
  };

  // Poll for conversion request with IDs
  return new Promise((resolve, reject) => {
    const pollInterval = 500; // Check every 500ms

    const poll = () => {
      const conversionRequest = checkForConversionWithIds();

      if (conversionRequest) {
        resolve(conversionRequest);
        return;
      }

      if (Date.now() - startTime > timeout) {
        // Timeout reached, return any conversion request we found (even without IDs)
        const anyConversionRequests = findViewThroughRequests(requests);
        if (anyConversionRequests.length > 0) {
          // eslint-disable-next-line no-console
          console.warn(
            `Timeout waiting for advertising IDs, using request without IDs after ${timeout}ms`,
          );
          resolve(anyConversionRequests[0]);
        } else {
          reject(
            new Error(
              `Timeout waiting for view-through conversion requests after ${timeout}ms`,
            ),
          );
        }
        return;
      }

      setTimeout(poll, pollInterval);
    };

    poll();
  });
};

/**
 * Validates that no advertising conversion requests are present
 * @param {Array} requests - Array of network request logs
 */
export const validateNoAdvertisingRequests = async (requests) => {
  const clickThroughRequest = findClickThroughRequest(requests);
  const viewThroughRequests = findViewThroughRequests(requests);

  await t
    .expect(clickThroughRequest)
    .notOk("Expected no click-through conversion requests");
  await t
    .expect(viewThroughRequests.length)
    .eql(0, "Expected no view-through conversion requests");
};
