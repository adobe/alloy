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
  LAST_CONVERSION_TIME_KEY,
  LOG_AD_CONVERSION_START,
  LOG_CONVERSION_TIME_UPDATED,
  LOG_SENDING_CONVERSION,
  LOG_AD_CONVERSION_FAILED,
  AD_CONVERSION_CLICK_EVENT_TYPE,
  TRACKING_CODE,
  TRACKING_IDENTITIES,
} from "../constants/index.js";

/**
 * Handles click-through ad conversions.
 * Note: The LAST_CLICK_COOKIE_KEY cookie (containing skwcid/efid) is written
 * inside createAdConversionHandler.trackAdConversion() AFTER consent is granted,
 * to ensure no ad-tracking cookies are set without user consent.
 *
 * @param {Object} params - All required parameters
 * @param {Object} params.eventManager - Event manager for creating events
 * @param {Object} params.cookieManager - Session manager for cookie operations
 * @param {Object} params.adConversionHandler - Handler for sending ad conversion events
 * @param {Object} params.logger - Logger instance
 * @param {string} params.skwcid - Search keyword click ID
 * @param {string} params.efid - EF ID parameter
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

  cookieManager.setValue(LAST_CONVERSION_TIME_KEY, Date.now());
  logger.info(LOG_CONVERSION_TIME_UPDATED);

  logger.info(LOG_SENDING_CONVERSION, xdm);
  try {
    return await adConversionHandler.trackAdConversion({
      event,
      skwcid,
      efid,
    });
  } catch (error) {
    logger.error(LOG_AD_CONVERSION_FAILED, error);
    throw error;
  }
}
