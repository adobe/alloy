/*
Copyright 2023 Adobe. All rights reserved.
Licensed under the Apache License, Version 2.0.
http://www.apache.org/licenses/LICENSE-2.0
*/

import { getSurferId } from "../identities/collectSurferId.js";
import { getID5Id } from "../identities/collectID5Id.js";
import { getRampId } from "../identities/collectRampId.js";

/**
 * Appends advertising identity IDs to AEP event query if not already added.
 * @param {Object} params
 * @param {Object} params.cookieManager
 * @param {Object} params.logger
 * @param {Object} params.state
 * @param {Object} params.event
 * @param {Object} params.config
 */
export default async function handleOnBeforeSendEvent({
  cookieManager,
  logger,
  state,
  event,
  config = {},
}) {
  if (state.surferIdAppendedToAepEvent) return;

  // Create a processing flag to prevent concurrent calls
  if (state.processingAdvertisingIds) return;
  state.processingAdvertisingIds = true;

  try {
    const [surferId, id5Id, rampId] = await Promise.all([
      getSurferId(cookieManager, false),
      config.id5PartnerId ? getID5Id(logger, config.id5PartnerId, false) : null,
      config.liverampScriptPath
        ? getRampId(logger, config.liverampScriptPath, cookieManager, false)
        : null,
    ]);

    const advertisingQuery = {
      ...(surferId && { gSurferId: surferId }),
      ...(id5Id && { gID5Id: id5Id }),
      ...(rampId && { gRampId: rampId }),
    };

    if (Object.keys(advertisingQuery).length > 0) {
      Object.entries(advertisingQuery).forEach(([key, value]) =>
        logger.info(`Added ${key} to query:`, value),
      );

      logger.info("Adding advertising IDs to event query parameters");

      // Add to query for server-side processing
      event.mergeQuery({ advertising: advertisingQuery });

      state.surferIdAppendedToAepEvent = true;
      logger.info("Advertising IDs added to event query successfully");
    }
  } catch (error) {
    logger.error("Error in onBeforeSendEvent hook:", error);
  } finally {
    state.processingAdvertisingIds = false;
  }
}
