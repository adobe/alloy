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
  DEFAULT_THROTTLE_MINUTES,
} from "../constants/index.js";

const getUrlParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    skwcid: urlParams.get(SKWCID_PARAM),
    efid: urlParams.get(EFID_PARAM),
  };
};

const shouldThrottle = (
  lastTime,
  throttleMinutes = DEFAULT_THROTTLE_MINUTES,
) => {
  if (!lastTime) return false;
  const elapsedMinutes = (Date.now() - lastTime) / (60 * 1000);
  return elapsedMinutes < throttleMinutes;
};

/**
 * Loads an external JavaScript file into the document.
 * @param {string} url The URL of the script to load.
 * @returns {Promise<void>} A promise that resolves when the script is loaded or rejects on error.
 */
const loadScript = (url) => {
  if (document.querySelector(`script[src="${url}"]`)) {
    console.log(`[ScriptLoader] Script already exists in DOM: ${url}`);
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const scriptTag = document.createElement("script");
    scriptTag.type = "text/javascript";
    scriptTag.src = url;
    scriptTag.async = true;

    const appendToDOM = () => {
      // Always try head first, then body
      const parent = document.head || document.body;
      if (parent) {
        parent.appendChild(scriptTag);
      } else {
        reject(
          new Error(
            "[ScriptLoader] Neither <head> nor <body> available for script insertion.",
          ),
        );
      }
    };

    scriptTag.addEventListener("load", () => {
      console.log(`[ScriptLoader] Script loaded successfully: ${url}`);
      resolve();
    });

    scriptTag.addEventListener("error", () => {
      console.error(`[ScriptLoader] Failed to load script: ${url}`);
      reject(new Error(`Failed to load script: ${url}`));
    });

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

const populateAdvertisingComponentConfig = (config) => {
  const componentConfig = config?.advertising || {};
  const overrides =
    componentConfig?.advertisingEdgeConfigOverrides?.production
      ?.com_adobe_advertising;

  if (!overrides) {
    console.warn("com_adobe_advertising config missing");
    return componentConfig;
  }

  componentConfig.rampIdScriptPath = overrides.rampIdJSPath || null;
  componentConfig.id5PartnerId = overrides.id5PartnerId || null;
  componentConfig.AA_DSP_AdvIds = Array.isArray(overrides.AA_DSP_AdvIds)
    ? overrides.AA_DSP_AdvIds
    : [];

  return componentConfig;
};

export {
  getUrlParams,
  shouldThrottle,
  normalizeAdvertiser,
  loadScript,
  createManagedAsyncOperation,
  populateAdvertisingComponentConfig,
};
