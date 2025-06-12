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

/**
 * Handles click-through ad conversions
 * @param {Object} params - All required parameters
 * @param {Object} params.eventManager - Event manager for creating events
 * @param {Object} params.sessionManager - Session manager for cookie operations
 * @param {Object} params.adConversionHandler - Handler for sending ad conversion events
 * @param {Object} params.logger - Logger instance
 * @param {Object} params.componentConfig - Component configuration object
 * @param {string} params.skwcid - Search keyword click ID
 * @param {string} params.efid - EF ID parameter
 * @param {boolean} params.isDisplay - Whether this is a display campaign
 * @param {Object} params.optionsFromCommand - Additional options from command
 * @returns {Promise} Result of the ad conversion tracking
 */
export default async function handleClickThrough({
  eventManager,
  sessionManager,
  adConversionHandler,
  logger,
  componentConfig,
  skwcid,
  efid,
  isDisplay,
  optionsFromCommand = {},
}) {
  logger.info("Handling click-through ad conversion.", { skwcid, efid });

  const event = eventManager.createEvent();
  const xdm = { eventType: "advertising.conversion" };

  if (skwcid || efid) {
    const clickData = {
      click_time: Date.now(),
      ...(skwcid && { skwcid }),
      ...(efid && { efid }),
    };
    sessionManager.writeClickData(clickData);
    logger.debug("ev_cc cookie written for click-through.", clickData);
  }

  const adConversionDetails = {
    ...(efid && { adStitchData: efid }),
    ...(skwcid && { adConversionMetaData: skwcid }),
  };

  xdm.advertising = {
    adConversionDetails,
    ...(isDisplay && {
      adAssetReference: {
        advertiser:
          optionsFromCommand.advertiser ||
          componentConfig.defaultAdvertiser ||
          "UNKNOWN",
      },
    }),
  };

  event.setUserXdm(xdm);

  if (isDisplay) {
    sessionManager.setValue("lastConversionTime", Date.now());
    logger.debug("lastConversionTime updated for display click-through.");
  }

  logger.info("Sending click-through ad conversion event.", xdm);
  return adConversionHandler.trackAdConversion({ event });
}
