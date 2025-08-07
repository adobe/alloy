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

import handleClickThrough from "./clickThroughHandler.js";
import handleViewThrough from "./viewThroughHandler.js";
import { getUrlParams, normalizeAdvertiser } from "../utils/helpers.js";

/**
 * Creates a handler for sending ad conversions.
 * Handles both click-through and view-through conversions.
 * This is a workaround to avoid the full lifecycle of the eventManager.sendEvent
 */
export default ({
  eventManager,
  cookieManager,
  adConversionHandler,
  logger,
  componentConfig,
  getBrowser,
}) => {
  const activeAdvertiserIds = componentConfig?.advertiserSettings
    ? normalizeAdvertiser(componentConfig.advertiserSettings)
    : "";

  return async (sharedState) => {
    const { skwcid, efid } = getUrlParams();
    const isClickThru = !!(skwcid && efid);

    try {
      let result = null;
      if (isClickThru) {
        result = await handleClickThrough({
          eventManager,
          cookieManager,
          adConversionHandler,
          logger,
          skwcid,
          efid,
        });
        sharedState.processedAdvertisingIds = true;
        return result;
      } else if (activeAdvertiserIds) {
        result = await handleViewThrough({
          eventManager,
          cookieManager,
          logger,
          componentConfig,
          adConversionHandler,
          getBrowser,
        });
        sharedState.processedAdvertisingIds = true;
        return result;
      }
      return null;
    } catch (error) {
      logger.error("Error in sendAdConversion:", error);
    }
  };
};
