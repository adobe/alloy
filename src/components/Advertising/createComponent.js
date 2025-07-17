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

import createAdConversionHandler from "./handlers/createAdConversionHandler.js";
import createCookieManager from "./utils/createAdvertisingSessionManager.js";
import handleClickThrough from "./handlers/clickThroughHandler.js";
import handleViewThrough from "./handlers/viewThroughHandler.js";
import handleOnBeforeSendEvent from "./handlers/onBeforeSendEventHandler.js";
import { getUrlParams } from "./utils/helpers.js";

export default ({
  logger,
  config,
  eventManager,
  sendEdgeNetworkRequest,
  consent,
}) => {
  const componentConfig = config.advertising;
  logger.info("Advertising component initialized", componentConfig);

  const cookieManager = createCookieManager({
    orgId: config.orgId || "temp_ims_org_id",
    logger,
  });

  const adConversionHandler = createAdConversionHandler({
    eventManager,
    sendEdgeNetworkRequest,
    consent,
    logger,
  });

  // Shared state for onBeforeSendEvent hook
  const sharedState = {
    surferIdAppendedToAepEvent: false,
  };

  const sendAdConversion = async (optionsFromCommand = {}) => {
    const { skwcid, efid } = getUrlParams();
    const isClickThru = !!(skwcid || efid);

    try {
      if (isClickThru) {
        return await handleClickThrough({
          eventManager,
          cookieManager,
          adConversionHandler,
          logger,
          componentConfig,
          skwcid,
          efid,
          optionsFromCommand,
        });
      }
      logger.info("Handling view-through ad conversion...");
      return await handleViewThrough({
        eventManager,
        cookieManager,
        logger,
        componentConfig,
        adConversionHandler,
      });
    } catch (error) {
      logger.error("Error in sendAdConversion:", error);
      throw error;
    }
  };

  return {
    lifecycle: {
      onComponentsRegistered() {
        sendAdConversion().catch((error) => {
          logger.info("Error in auto-triggered sendAdConversion:", error);
        });
      },
      onBeforeEvent: ({ event }) => {
        if (!componentConfig.isAdvertisingEnabled) {
          return;
        }
        handleOnBeforeSendEvent({
          cookieManager,
          logger,
          state: sharedState,
          event,
          config: componentConfig,
        }).catch((error) => {
          logger.info("Error in onBeforeSendEvent handler:", error);
        });
      },
    },
    commands: {
      sendAdConversion: {
        run: sendAdConversion,
      },
    },
  };
};
