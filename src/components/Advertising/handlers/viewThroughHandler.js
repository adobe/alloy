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

import collectAllIdentities from "../identities/collectAllIdentities.js";
import {
  LOG_ERROR_RESOLVING_ID,
  LOG_AD_CONVERSION_FAILED,
} from "../constants/index.js";
import {
  isAnyIdUnused,
  appendAdvertisingIdQueryToEvent,
  markIdsAsConverted,
} from "../utils/helpers.js";

export default async function handleViewThrough({
  eventManager,
  cookieManager,
  logger,
  componentConfig,
  adConversionHandler,
}) {
  // Shared state for resolved IDs and per-ID conversion tracking
  const availableIds = {};
  const conversionCalled = {}; // Track conversion status per ID type
  const conversionPromises = []; // Collect conversion promises to return

  // Conversion handler - called when any ID resolves
  const handleConversion = async () => {
    if (!isAnyIdUnused(availableIds, conversionCalled)) {
      return null;
    }

    const idTypes = Object.keys(availableIds);

    try {
      // Create conversion event with unused IDs only
      const event = appendAdvertisingIdQueryToEvent(
        availableIds,
        eventManager.createEvent(),
        cookieManager,
        componentConfig,
      );
      const result = await adConversionHandler.trackAdConversion({ event });

      // Mark these IDs as used in conversion and update throttle times
      markIdsAsConverted(idTypes, conversionCalled, cookieManager, logger);

      return result;
    } catch (error) {
      logger.error(LOG_AD_CONVERSION_FAILED, error);
      return null;
    }
  };

  // Get promises only for non-throttled IDs
  const identityPromises = collectAllIdentities(
    logger,
    componentConfig,
    cookieManager,
  );

  // If no IDs to collect, skip entirely
  if (Object.keys(identityPromises).length === 0) {
    return [];
  }

  // Register callbacks for each identity promise
  Object.entries(identityPromises).forEach(([idType, promise]) => {
    promise
      .then((idValue) => {
        if (idValue) {
          // Store resolved ID
          availableIds[idType] = idValue;

          // Trigger conversion handler and collect the promise
          const conversionPromise = handleConversion();
          if (conversionPromise) {
            conversionPromises.push(conversionPromise);
          }
        }
      })
      .catch((error) => {
        logger.error(LOG_ERROR_RESOLVING_ID.replace("{0}", idType), error);
        // Continue with other IDs even if one fails
        return null;
      });
  });

  // Return array of conversion promises
  return conversionPromises;
}
