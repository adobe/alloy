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

import {
  SKWCID_PARAM,
  EFID_PARAM,
  UNKNOWN_ADVERTISER,
  LAST_CLICK_COOKIE_KEY,
  LOG_ID_CONVERSION_SUCCESS,
  LAST_CONVERSION_TIME_KEY,
  DISPLAY_CLICK_COOKIE_KEY,
  AD_CONVERSION_VIEW_EVENT_TYPE,
  SURFER_ID,
  ID5_ID,
  RAMP_ID,
  DISPLAY_CLICK_COOKIE_KEY_EXPIRES,
  LAST_CONVERSION_TIME_KEY_EXPIRES,
} from "../constants/index.js";

import { queryString } from "../../../utils/index.js";

const getUrlParams = () => {
  const parsedParams = queryString.parse(window.location.search);
  return {
    skwcid: parsedParams[SKWCID_PARAM], // "s_kwcid"
    efid: parsedParams[EFID_PARAM], // "ef_id"
  };
};

/**
 * Manages a single, ongoing asynchronous operation to prevent redundant calls.
 * @param {string} operationName - A name for the operation for logging purposes.
 * @param {Function} workerFn - A function that returns a Promise to be executed.
 * @returns {Function} A function that, when called, will either start the worker or return the in-progress promise.
 */
const createManagedAsyncOperation = (operationName, workerFn) => {
  let inProgressPromise = null;

  return (...args) => {
    if (inProgressPromise) {
      return inProgressPromise;
    }
    inProgressPromise = workerFn(...args).finally(() => {
      inProgressPromise = null;
    });

    return inProgressPromise;
  };
};

/**
 * Normalizes advertiser settings - extracts enabled advertiser IDs
 * @param {Object[]} advertiserSettings - Array of advertiserSettings objects with advertiserId and enabled properties
 * @returns {string} Comma-separated string of enabled advertiser IDs
 */
const normalizeAdvertiser = (advertiserSettings) => {
  if (!advertiserSettings || !Array.isArray(advertiserSettings)) {
    return UNKNOWN_ADVERTISER;
  }

  return advertiserSettings
    .filter((item) => item && item.enabled === true && item.advertiserId)
    .map((item) => item.advertiserId)
    .join(", ");
};

const appendAdvertisingIdQueryToEvent = (
  idsToInclude,
  event,
  cookieManager,
  componentConfig,
  addEventType = false,
) => {
  let searchClickData = null;
  const searchClickDataExpires = cookieManager.getValue(
    LAST_CONVERSION_TIME_KEY_EXPIRES,
  );
  if (searchClickDataExpires && searchClickDataExpires > Date.now()) {
    searchClickData = cookieManager.getValue(LAST_CLICK_COOKIE_KEY);
  }

  let displayClickCookie = null;
  const displayClickCookieExpires = cookieManager.getValue(
    DISPLAY_CLICK_COOKIE_KEY_EXPIRES,
  );
  if (displayClickCookieExpires && displayClickCookieExpires > Date.now()) {
    displayClickCookie = cookieManager.getValue(DISPLAY_CLICK_COOKIE_KEY);
  }
  const query = {
    advertising: {
      ...(searchClickData?.click_time && {
        lastSearchClick: searchClickData.click_time,
      }),
      ...(displayClickCookie && {
        lastDisplayClick: displayClickCookie,
      }),
      stitchIds: {
        ...(idsToInclude[SURFER_ID] && {
          surferId: idsToInclude[SURFER_ID],
        }),
        ...(idsToInclude[ID5_ID] && { id5: idsToInclude[ID5_ID] }),
        ...(idsToInclude[RAMP_ID] && { rampIdEnv: idsToInclude[RAMP_ID] }),
        ipAddress: "DUMMY_IP_ADDRESS",
      },
      advIds: normalizeAdvertiser(componentConfig.advertiserSettings),
      ...(addEventType && { eventType: AD_CONVERSION_VIEW_EVENT_TYPE }),
    },
  };

  event.mergeQuery(query);
  return event;
};

const isAnyIdUnused = (availableIds, conversionCalled) => {
  return Object.entries(availableIds).some(([idType]) => {
    return !conversionCalled[idType];
  });
};

const markIdsAsConverted = (
  idTypes,
  conversionCalled,
  cookieManager,
  logger,
) => {
  const now = Date.now();

  idTypes.forEach((idType) => {
    conversionCalled[idType] = true;
    cookieManager.setValue(`${idType}_last_conversion`, now);
    logger.info(LOG_ID_CONVERSION_SUCCESS.replace("{0}", idType));
  });

  cookieManager.setValue(LAST_CONVERSION_TIME_KEY, now);
};

const isThrottled = (idType, cookieManager) => {
  const now = Date.now();
  const THROTTLE_WINDOW = 30 * 60 * 1000; // 30 minutes
  const lastSuccessfulConversion = cookieManager.getValue(
    `${idType}_last_conversion`,
  );
  return Boolean(
    lastSuccessfulConversion &&
      now - lastSuccessfulConversion < THROTTLE_WINDOW,
  );
};

const shouldThrottle = (idType, cookieManager) => {
  return isThrottled(idType, cookieManager);
};

export {
  getUrlParams,
  normalizeAdvertiser,
  createManagedAsyncOperation,
  appendAdvertisingIdQueryToEvent,
  isAnyIdUnused,
  markIdsAsConverted,
  isThrottled,
  shouldThrottle,
};
