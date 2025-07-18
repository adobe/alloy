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
  SURFER_ID,
  ID5_ID,
  RAMP_ID,
} from "../constants/index.js";

import { createNode, appendNode } from "../../../utils/dom/index.js";

let nonce;
const getUrlParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    skwcid: urlParams.get(SKWCID_PARAM),
    efid: urlParams.get(EFID_PARAM),
  };
};

/**
 * Returns the nonce if available.
 * @param {Node} [context=document] defaults to document
 * @returns {(String|undefined)} the nonce or undefined if not available
 */
const getNonce = (context = document) => {
  if (nonce === undefined) {
    const n = context.querySelector("[nonce]");
    // NOTE: We're keeping n.getAttribute("nonce") until it is safe to remove:
    //   ref: https://github.com/whatwg/html/issues/2369#issuecomment-280853946
    nonce = n && (n.nonce || n.getAttribute("nonce"));
  }
  return nonce;
};

/**
 * Loads an external JavaScript file using Alloy's DOM utilities.
 * Enhanced version that supports additional script attributes.
 * @param {string} url The URL of the script to load.
 * @param {Object} options Additional options for script loading
 * @param {Object} options.attributes Additional attributes to set on script element
 * @param {Function} options.onLoad Optional callback when script loads successfully
 * @param {Function} options.onError Optional callback when script fails to load
 * @returns {Promise<void>} A promise that resolves when the script is loaded or rejects on error.
 */
const loadScript = (url, options = {}) => {
  // Check if script already exists
  if (document.querySelector(`script[src="${url}"]`)) {
    if (options.onLoad) options.onLoad();
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const { attributes = {}, onLoad, onError } = options;

    const script = createNode(
      "script",
      {
        type: "text/javascript",
        src: url,
        async: true,
        ...(getNonce() && { nonce }),
        ...attributes, // Allow additional attributes like crossorigin
      },
      {
        onload: () => {
          if (onLoad) onLoad();
          resolve();
        },
        onerror: () => {
          const error = new Error(`Failed to load script: ${url}`);
          if (onError) onError(error);
          reject(error);
        },
      },
    );

    const appendToDOM = () => {
      const parent = document.head || document.body;
      if (parent) {
        appendNode(parent, script);
      } else {
        const error = new Error(
          "Neither <head> nor <body> available for script insertion.",
        );
        if (onError) onError(error);
        reject(error);
      }
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", appendToDOM);
    } else {
      appendToDOM();
    }
  });
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
      // Clear the promise once it's settled (resolved or rejected)
      // so that subsequent calls can trigger a new operation.
      inProgressPromise = null;
    });

    return inProgressPromise;
  };
};

/**
 * Normalizes advertiser value - handles both string and array cases
 * @param {string|string[]} advertiser - Single advertiser string or array of advertisers
 * @returns {string} Comma-separated string of advertisers
 */
const normalizeAdvertiser = (advertiser) => {
  if (!advertiser) {
    return UNKNOWN_ADVERTISER;
  }

  // If it's an array, join with commas
  if (Array.isArray(advertiser)) {
    return advertiser.filter(Boolean).join(", ");
  }

  // If it's a string, return as-is
  return advertiser;
};

const appendAdvertisingIdQueryToEvent = (
  idsToInclude,
  event,
  cookieManager,
  componentConfig,
) => {
  const searchClickData = cookieManager.getValue(LAST_CLICK_COOKIE_KEY);
  const displayClickCookie = cookieManager.getValue(DISPLAY_CLICK_COOKIE_KEY);
  const query = {
    advertising: {
      conversion: {
        ...(searchClickData &&
          searchClickData.click_time && {
            lastSearchClick: searchClickData.click_time,
          }),
        ...(displayClickCookie &&
          displayClickCookie.value && {
            lastDisplayClick: displayClickCookie.value,
          }),
        stitchIds: {
          ...(idsToInclude[SURFER_ID] && {
            surferId: idsToInclude[SURFER_ID],
          }),
          ...(idsToInclude[ID5_ID] && { id5: idsToInclude[ID5_ID] }),
          ...(idsToInclude[RAMP_ID] && { rampIDEnv: idsToInclude[RAMP_ID] }),
        },
        advIds: normalizeAdvertiser(componentConfig.advertiserIds),
      },
    },
  };

  event.mergeQuery(query);
  return event;
};

// Helper: Check if any ID is unused (not in conversionCalled or is false)
const isAnyIdUnused = (availableIds, conversionCalled) => {
  return Object.entries(availableIds).some(([idType]) => {
    return !conversionCalled[idType];
  });
};
// Helper: Mark IDs as converted and update throttle times
const markIdsAsConverted = (
  idTypes,
  conversionCalled,
  cookieManager,
  logger,
) => {
  const now = Date.now();

  idTypes.forEach((idType) => {
    // Mark as used in conversion (in memory only)
    conversionCalled[idType] = true;

    // Update throttle time in session
    cookieManager.setValue(`${idType}_last_conversion`, now);
    logger.info(LOG_ID_CONVERSION_SUCCESS.replace("{0}", idType));
  });

  // Backward compatibility
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
  loadScript,
  createManagedAsyncOperation,
  appendAdvertisingIdQueryToEvent,
  isAnyIdUnused,
  markIdsAsConverted,
  isThrottled,
  shouldThrottle,
};
