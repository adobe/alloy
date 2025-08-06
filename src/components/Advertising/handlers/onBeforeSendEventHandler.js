/*
Copyright 2023 Adobe. All rights reserved.
Licensed under the Apache License, Version 2.0.
http://www.apache.org/licenses/LICENSE-2.0
*/

import collectSurferId from "../identities/collectSurferId.js";
import { getID5Id } from "../identities/collectID5Id.js";
import { getRampId } from "../identities/collectRampId.js";
import { appendAdvertisingIdQueryToEvent } from "../utils/helpers.js";

const isAdvertisingDisabled = (advertising) => {
  return !["auto", "wait"].includes(advertising?.handleAdvertisingData);
};

const waitForAdvertisingId = (advertising) => {
  return advertising?.handleAdvertisingData === "wait";
};

/**
 * Appends advertising identity IDs to AEP event query if not already added.
 * @param {Object} params
 * @param {Object} params.cookieManager
 * @param {Object} params.logger
 * @param {Object} params.state
 * @param {Object} params.event
 * @param {Object} params.componentConfig
 * @param {Object} params.advertising
 * @param {Function} params.getBrowser
 */
export default async function handleOnBeforeSendEvent({
  cookieManager,
  logger,
  state,
  event,
  componentConfig,
  advertising,
  getBrowser,
}) {
  if (state.surferIdAppendedToAepEvent || isAdvertisingDisabled(advertising))
    return;
  if (state.processingAdvertisingIds) return;
  state.processingAdvertisingIds = true;

  try {
    const useShortTimeout = waitForAdvertisingId(advertising);
    const surferId = await collectSurferId(
      cookieManager,
      getBrowser,
      useShortTimeout,
    );
    const id5Id = await getID5Id(
      logger,
      componentConfig.id5PartnerId,
      false,
      useShortTimeout,
    );
    const rampId = await getRampId(
      logger,
      componentConfig.rampIdJSPath,
      cookieManager,
      false,
      useShortTimeout,
    );
    const availableIds = {
      ...(surferId && { surferId }),
      ...(id5Id && { id5Id }),
      ...(rampId && { rampId }),
    };

    appendAdvertisingIdQueryToEvent(
      availableIds,
      event,
      cookieManager,
      componentConfig,
    );
    if (Object.keys(availableIds).length > 0) {
      state.surferIdAppendedToAepEvent = true;
    }
  } catch (error) {
    logger.error("Error in onBeforeSendEvent hook:", error);
  } finally {
    state.processingAdvertisingIds = false;
  }
}
