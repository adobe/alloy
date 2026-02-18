/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import UserReportableError from "../errors/userReportableError";
import * as HTTP_STATUS from "../constants/httpStatus";
import * as NETWORK_ERROR_MESSAGE from "../constants/networkErrorMessage";
import getHost from "./getHost";

// API Configuration
const TUBEMOGUL_HOST_PROD = "https://api.tubemogul.com";
const TUBEMOGUL_HOST_STAGING = "https://api-uat.tubemogul.com";
const ADVERTISERS_ENDPOINT = "/v1/provisioning/advertisers/";
const DEFAULT_LIMIT = 1000;

// Request Configuration
const REQUEST_HEADERS = {
  "Content-Type": "application/json",
};

/**
 * Fetches advertisers from the TubeMogul API
 * @param {Object} params - The parameters for fetching advertisers
 * @param {string} params.orgId - The organization ID (IMS org ID)
 * @param {string} params.imsAccess - The IMS access token for authentication
 * @param {AbortSignal} [params.signal] - Optional abort signal for request cancellation
 * @returns {Promise<Object>} Promise that resolves to the advertisers data
 * @throws {UserReportableError} When the request fails or returns an error
 */
const fetchAdvertisers = async ({ orgId, imsAccess, signal }) => {
  // Determine the appropriate host based on environment
  const host = getHost({
    imsAccess,
    productionHost: TUBEMOGUL_HOST_PROD,
    stagingHost: TUBEMOGUL_HOST_STAGING,
  });

  // Build the API URL with encoded parameters
  const encodedOrgId = encodeURIComponent(orgId);
  const url = `${host}${ADVERTISERS_ENDPOINT}?ims_org_id=${encodedOrgId}&limit=${DEFAULT_LIMIT}`;

  // Prepare request options
  const requestOptions = {
    headers: {
      ...REQUEST_HEADERS,
      Authorization: `Bearer ${imsAccess}`,
    },
    signal,
  };

  let response;

  // Make the API request
  try {
    response = await fetch(url, requestOptions);
  } catch (error) {
    // Handle network-level errors (connection issues, aborts, etc.)
    if (error.name === "AbortError") {
      throw error; // Re-throw abort errors as-is
    }
    throw new UserReportableError(
      NETWORK_ERROR_MESSAGE.UNABLE_TO_CONNECT_TO_SERVER,
    );
  }

  // Handle specific HTTP status codes before parsing response
  if (response.status === HTTP_STATUS.NOT_FOUND) {
    throw new UserReportableError(NETWORK_ERROR_MESSAGE.RESOURCE_NOT_FOUND);
  }

  if (response.status === HTTP_STATUS.UNAUTHORIZED) {
    throw new UserReportableError(NETWORK_ERROR_MESSAGE.INVALID_ACCESS_TOKEN);
  }

  // Parse the response body
  let parsedBody;
  try {
    parsedBody = await response.json();
  } catch (error) {
    // Handle JSON parsing errors
    if (error.name === "AbortError") {
      throw error; // Re-throw abort errors as-is
    }
    throw new UserReportableError(
      NETWORK_ERROR_MESSAGE.UNEXPECTED_SERVER_RESPONSE,
    );
  }

  // Handle other non-OK responses
  if (!response.ok) {
    throw new UserReportableError(
      NETWORK_ERROR_MESSAGE.UNEXPECTED_SERVER_RESPONSE,
    );
  }

  return parsedBody;
};

export default fetchAdvertisers;
