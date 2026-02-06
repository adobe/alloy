/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import collectSurferId from "../identities/collectSurferId.js";
import { getID5Id } from "../identities/collectID5Id.js";
import { getRampId } from "../identities/collectRampId.js";
import {
  appendAdvertisingIdQueryToEvent,
  getUrlParams,
  isThrottled,
} from "../utils/helpers.js";
import { SURFER_ID, ID5_ID, RAMP_ID } from "../constants/index.js";
import { AUTO, WAIT } from "../../../constants/consentStatus.js";
import { CHROME } from "../../../constants/browser.js";

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
