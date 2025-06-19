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
const getUrlParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    skwcid: urlParams.get("skwcid"),
    efid: urlParams.get("ef_id"),
  };
};

const shouldThrottle = (lastTime, throttleMinutes) => {
  if (!lastTime) return false;
  const elapsedMinutes = (Date.now() - lastTime) / (60 * 1000);
  return elapsedMinutes < throttleMinutes;
};

/**
 * Normalizes advertiser value - handles both string and array cases
 * @param {string|string[]} advertiser - Single advertiser string or array of advertisers
 * @returns {string} Comma-separated string of advertisers
 */
const normalizeAdvertiser = (advertiser) => {
  if (!advertiser) {
    return "UNKNOWN";
  }

  // If it's an array, join with commas
  if (Array.isArray(advertiser)) {
    return advertiser.filter(Boolean).join(", ");
  }

  // If it's a string, return as-is
  return advertiser;
};

export { getUrlParams, shouldThrottle, normalizeAdvertiser };
