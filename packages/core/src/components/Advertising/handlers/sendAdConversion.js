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

import handleClickThrough from "./clickThroughHandler";
import handleViewThrough from "./viewThroughHandler";
import { getUrlParams, normalizeAdvertiser } from "../utils/helpers";

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

  return async () => {
    const { skwcid, efid } = getUrlParams();
    const isClickThru = !!(skwcid || efid);

    try {
      if (isClickThru) {
        // wait for click through to complete
        return handleClickThrough({
          eventManager,
          cookieManager,
          adConversionHandler,
          logger,
          skwcid,
          efid,
        });
      } else if (activeAdvertiserIds) {
        // fire and forget view through
        handleViewThrough({
          eventManager,
          cookieManager,
          logger,
          componentConfig,
          adConversionHandler,
          getBrowser,
        }).catch((error) => logger.error("Error in view through:", error));
      }
    } catch (error) {
      logger.error("Error in sendAdConversion:", error);
    }
  };
};
