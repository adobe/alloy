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

import {
  LAST_CLICK_COOKIE_KEY,
  LAST_CONVERSION_TIME_KEY,
  LOG_AD_CONVERSION_START,
  LOG_AD_CONVERSION_FAILED,
  AD_CONVERSION_CLICK_EVENT_TYPE,
  TRACKING_CODE,
  TRACKING_IDENTITIES,
  LAST_CONVERSION_TIME_KEY_EXPIRES,
} from "../constants/index.js";

/**
 * Handles click-through ad conversions
 * @param {Object} params - All required parameters
 * @param {Object} params.eventManager - Event manager for creating events
 * @param {Object} params.cookieManager - Session manager for cookie operations
 * @param {Object} params.adConversionHandler - Handler for sending ad conversion events
 * @param {Object} params.logger - Logger instance
 * @param {string} params.skwcid - Search keyword click ID
 * @param {string} params.efid - EF ID parameter
 * @param {Object} params.optionsFromCommand - Additional options from command
 * @returns {Promise} Result of the ad conversion tracking
 */
export default async function handleClickThrough({
  eventManager,
  cookieManager,
  adConversionHandler,
  logger,
  skwcid,
  efid,
}) {
  logger.info(LOG_AD_CONVERSION_START, { skwcid, efid });

  const event = eventManager.createEvent();
  if (
    typeof skwcid !== "undefined" &&
    typeof efid !== "undefined" &&
    skwcid.startsWith("AL!")
  ) {
    const clickData = {
      click_time: Date.now(),
      ...(typeof skwcid !== "undefined" && { skwcid }),
      ...(typeof efid !== "undefined" && { efid }),
    };
    cookieManager.setValue(LAST_CLICK_COOKIE_KEY, clickData);
  }

  const xdm = {
    _experience: {
      adcloud: {
        conversionDetails: {
          ...(typeof skwcid !== "undefined" && { [TRACKING_CODE]: skwcid }),
          ...(typeof efid !== "undefined" && {
            [TRACKING_IDENTITIES]: efid,
          }),
        },
      },
    },
    eventType: AD_CONVERSION_CLICK_EVENT_TYPE,
    timestamp: new Date().toISOString(),
  };

  event.setUserXdm(xdm);

  cookieManager.setValue(LAST_CONVERSION_TIME_KEY);
  cookieManager.setValue(
    LAST_CONVERSION_TIME_KEY_EXPIRES,
    Date.now() + 91 * 24 * 60 * 60 * 1000,
  ); //expires in 91 days

  try {
    return await adConversionHandler.trackAdConversion({ event });
  } catch (error) {
    logger.error(LOG_AD_CONVERSION_FAILED, error);
    throw error;
  }
}
