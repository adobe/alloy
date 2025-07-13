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

import { getSurferId } from "./collectSurferId.js";
import { getRampId } from "./collectRampId.js";
import { getID5Id } from "./collectID5Id.js";

// Made synchronous to return map of id promises directly
const collectAllIdentities = (logger, componentConfig, cookieManager) => {
  const promises = {};
  const now = Date.now();
  const THROTTLE_WINDOW = 30 * 60 * 1000; // 30 minutes

  // Helper to check if ID conversion is throttled
  const isThrottled = (idType) => {
    const lastSuccessfulConversion = cookieManager.getValue(
      `${idType}_last_conversion`,
    );
    return (
      lastSuccessfulConversion &&
      now - lastSuccessfulConversion < THROTTLE_WINDOW
    );
  };

  // Only create promises for non-throttled IDs
  if (!isThrottled("surferId")) {
    promises.surferId = getSurferId(cookieManager, true).catch(() => null);
  }
  // componentConfig.id5PartnerId &&
  if (!isThrottled("id5Id")) {
    promises.id5Id = getID5Id(logger, "1650").catch(() => null);
  }
  // componentConfig.liverampScriptPath &&
  if (!isThrottled("rampId")) {
    promises.rampId = getRampId(
      logger,
      "https://ats-wrapper.privacymanager.io/ats-modules/db58949f-d696-469b-a8ac-a04382bc5183/ats.js",
      cookieManager,
      true,
    ).catch(() => null);
  }

  return promises;
};

export default collectAllIdentities;
