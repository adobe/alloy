/*
Copyright 2023 Adobe. All rights reserved.
Licensed under the Apache License, Version 2.0.
http://www.apache.org/licenses/LICENSE-2.0
*/

import collectSurferId from "../identities/collectSurferId";
import { getID5Id } from "../identities/collectID5Id";
import { getRampId } from "../identities/collectRampId";
import {
  appendAdvertisingIdQueryToEvent,
  getUrlParams,
  isThrottled,
} from "../utils/helpers";
import { SURFER_ID, ID5_ID, RAMP_ID } from "../constants/index";
import { AUTO, WAIT } from "../../../constants/consentStatus";
import { CHROME } from "../../../constants/browser";

const isAdvertisingDisabled = (advertising) => {
  return ![AUTO, WAIT].includes(
    advertising?.handleAdvertisingData?.toLowerCase(),
  );
};

const waitForAdvertisingId = (advertising) => {
  return advertising?.handleAdvertisingData?.toLowerCase() === WAIT;
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
  event,
  componentConfig,
  advertising,
  getBrowser,
}) {
  const { skwcid, efid } = getUrlParams();
  const isClickThru = !!(skwcid && efid);
  if (
    isAdvertisingDisabled(advertising) ||
    isClickThru ||
    (isThrottled(SURFER_ID, cookieManager) &&
      isThrottled(ID5_ID, cookieManager) &&
      isThrottled(RAMP_ID, cookieManager))
  )
    return;

  try {
    const useShortTimeout = waitForAdvertisingId(advertising);

    let rampIdPromise = null;

    if (!getBrowser || getBrowser() !== CHROME) {
      rampIdPromise = getRampId(
        logger,
        componentConfig.rampIdJSPath,
        cookieManager,
        useShortTimeout,
        useShortTimeout,
      );
    }
    const [surferIdResult, id5IdResult, rampIdResult] =
      await Promise.allSettled([
        collectSurferId(cookieManager, getBrowser, useShortTimeout),
        getID5Id(
          logger,
          componentConfig.id5PartnerId,
          useShortTimeout,
          useShortTimeout,
        ),
        rampIdPromise,
      ]);

    const availableIds = {};
    if (
      surferIdResult.status === "fulfilled" &&
      surferIdResult.value &&
      !isThrottled(SURFER_ID, cookieManager)
    ) {
      availableIds.surferId = surferIdResult.value;
    }
    if (
      id5IdResult.status === "fulfilled" &&
      id5IdResult.value &&
      !isThrottled(ID5_ID, cookieManager)
    ) {
      availableIds.id5Id = id5IdResult.value;
    }
    if (
      rampIdResult.status === "fulfilled" &&
      rampIdResult.value &&
      !isThrottled(RAMP_ID, cookieManager)
    ) {
      availableIds.rampId = rampIdResult.value;
    }
    // If no IDs are available and any ID is throttled, return , because we dont have new info to send
    if (
      Object.keys(availableIds).length === 0 &&
      (isThrottled(SURFER_ID, cookieManager) ||
        isThrottled(ID5_ID, cookieManager) ||
        isThrottled(RAMP_ID, cookieManager))
    ) {
      return;
    }
    appendAdvertisingIdQueryToEvent(
      availableIds,
      event,
      cookieManager,
      componentConfig,
    );
  } catch (error) {
    logger.error("Error in onBeforeSendEvent hook:", error);
  }
}
