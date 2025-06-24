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

export default async function handleViewThrough({
  eventManager,
  cookieManager,
  logger,
  componentConfig,
  adConversionHandler,
}) {
  // Get promises only for non-throttled IDs
  const identityPromises = collectAllIdentities(componentConfig, cookieManager);

  // If no IDs to collect, skip entirely
  if (Object.keys(identityPromises).length === 0) {
    logger.info("All identity types throttled, skipping conversion");
    return [];
  }

  logger.info("ID resolution promises:", Object.keys(identityPromises));

  // Shared state for resolved IDs and per-ID conversion tracking
  const availableIds = {};
  const conversionCalled = {}; // Track conversion status per ID type
  const conversionPromises = []; // Collect conversion promises to return

  // Helper: Check if any ID is unused (not in conversionCalled or is false)
  const isAnyIdUnused = () => {
    return Object.entries(availableIds).some(([idType]) => {
      return !conversionCalled[idType];
    });
  };

  // Helper: Create XDM conversion event
  const createConversionEvent = (idsToInclude) => {
    const event = eventManager.createEvent();
    const clickData = cookieManager.readClickData();

    const xdmData = {
      eventType: "advertising.conversion",
      advertising: {
        conversion: {
          ...(clickData.clickTime && { clickTime: clickData.clickTime }),
          ...(idsToInclude.surferId && { gSurferId: idsToInclude.surferId }),
          ...(idsToInclude.id5Id && { id5_id: idsToInclude.id5Id }),
          ...(idsToInclude.rampId && { rampIDEnv: idsToInclude.rampId }),
        },
      },
    };

    event.setUserXdm(xdmData);
    return event;
  };

  // Helper: Mark IDs as converted and update throttle times
  const markIdsAsConverted = (idTypes) => {
    const now = Date.now();

    idTypes.forEach((idType) => {
      // Mark as used in conversion (in memory only)
      conversionCalled[idType] = true;

      // Update throttle time in session
      cookieManager.setValue(`${idType}_last_conversion`, now);
      logger.info(`${idType} conversion successful, throttle window started`);
    });

    // Backward compatibility
    cookieManager.setValue("lastConversionTime", now);
  };

  // Conversion handler - called when any ID resolves
  const handleConversion = async () => {
    if (!isAnyIdUnused()) {
      logger.info("All resolved IDs already used in conversion");
      return null;
    }

    const idTypes = Object.keys(availableIds);

    try {
      // Create conversion event with unused IDs only
      const event = createConversionEvent(availableIds);
      const result = await adConversionHandler.trackAdConversion({ event });

      // Mark these IDs as used in conversion and update throttle times
      markIdsAsConverted(idTypes);

      return result;
    } catch (error) {
      logger.error("Ad conversion tracking failed:", error);
      return null;
    }
  };

  // Register callbacks for each identity promise
  Object.entries(identityPromises).forEach(([idType, promise]) => {
    promise
      .then((idValue) => {
        if (idValue) {
          // Store resolved ID
          availableIds[idType] = idValue;
          logger.info(`${idType} resolved:`, idValue);

          // Trigger conversion handler and collect the promise
          const conversionPromise = handleConversion();
          if (conversionPromise) {
            conversionPromises.push(conversionPromise);
          }
        }
      })
      .catch((error) => {
        logger.error(`Error resolving ${idType}:`, error);
      });
  });

  // Return array of conversion promises
  return conversionPromises;
}
