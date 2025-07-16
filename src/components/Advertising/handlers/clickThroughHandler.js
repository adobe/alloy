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

import { normalizeAdvertiser } from "../utils/helpers.js";
import {
  LAST_CLICK_COOKIE_KEY,
  LAST_CONVERSION_TIME_KEY,
  XDM_AD_CONVERSION_DETAILS,
  XDM_AD_ASSET_REFERENCE,
  XDM_AD_STITCH_DATA,
  XDM_AD_ASSET_DATA,
  XDM_ADVERTISER,
  LOG_AD_CONVERSION_START,
  LOG_COOKIE_WRITTEN,
  LOG_CONVERSION_TIME_UPDATED,
  LOG_SENDING_CONVERSION,
  LOG_AD_CONVERSION_FAILED,
} from "../constants/index.js";

/**
 * Handles click-through ad conversions
 * @param {Object} params - All required parameters
 * @param {Object} params.eventManager - Event manager for creating events
 * @param {Object} params.cookieManager - Session manager for cookie operations
 * @param {Object} params.adConversionHandler - Handler for sending ad conversion events
 * @param {Object} params.logger - Logger instance
 * @param {Object} params.componentConfig - Component configuration object
 * @param {string} params.skwcid - Search keyword click ID
 * @param {string} params.efid - EF ID parameter
 * @param {boolean} params.viewThruEnabled - Whether this is a display campaign
 * @param {Object} params.optionsFromCommand - Additional options from command
 * @returns {Promise} Result of the ad conversion tracking
 */
export default async function handleClickThrough({
  eventManager,
  cookieManager,
  adConversionHandler,
  logger,
  componentConfig,
  skwcid,
  efid,
}) {
  logger.info(LOG_AD_CONVERSION_START, { skwcid, efid });

  const event = eventManager.createEvent();

  if (skwcid || efid) {
    const clickData = {
      click_time: Date.now(),
      ...(skwcid && { skwcid }),
      ...(efid && { efid }),
    };
    cookieManager.setValue(LAST_CLICK_COOKIE_KEY, clickData);
    logger.info(LOG_COOKIE_WRITTEN, clickData);
  }

  // Handle advertiser normalization for both string and array cases
  const normalizedAdvertiser = normalizeAdvertiser(
    componentConfig.AA_DSP_AdvIds,
  );

  const xdm = {
    _experience: {
      adCloud: {
        [XDM_AD_CONVERSION_DETAILS]: {
          ...(efid && { [XDM_AD_STITCH_DATA]: efid }),
          ...(skwcid && { [XDM_AD_ASSET_DATA]: skwcid }),
        },
        [XDM_AD_ASSET_REFERENCE]: {
          [XDM_ADVERTISER]: normalizedAdvertiser,
        },
      },
    },
  };

  event.setUserXdm(xdm);

  cookieManager.setValue(LAST_CONVERSION_TIME_KEY, Date.now());
  logger.info(LOG_CONVERSION_TIME_UPDATED);

  logger.info(LOG_SENDING_CONVERSION, xdm);
  try {
    return await adConversionHandler.trackAdConversion({ event });
  } catch (error) {
    logger.error(LOG_AD_CONVERSION_FAILED, error);
    throw error;
  }
}
