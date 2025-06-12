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

import createAdConversionHandler from "./utils/createAdConversionHandler.js";
import createCookieSessionManager from "./utils/createAdvertisingSessionManager.js";
import createLoggingCookieJar from "../../utils/createLoggingCookieJar.js";
import handleOnBeforeSendEvent from "./utils/createOnBeforeSendEventHandler.js";
import handleClickThrough from "./utils/createClickThroughHandler.js";
import { cookieJar } from "../../utils/index.js";
import { getUrlParams, shouldThrottle } from "./utils/helpers.js";
import { resolvedIdsAndDispatchConversionEvent } from "./utils/resolvedIdsAndDispatchConversionEvent.js";

export default ({
  logger,
  config,
  eventManager,
  sendEdgeNetworkRequest,
  consent,
}) => {
  // Component configuration - ensure it works even without configuration
  const componentConfig = config?.advertising || {};
  logger.info("Advertising component initialized", componentConfig);

  // Create session manager
  const sessionManager = createCookieSessionManager({
    orgId: config.orgId || "temp_ims_org_id",
    cookieJar: createLoggingCookieJar({ logger, cookieJar }),
    logger,
    namespace: "advertising",
  });

  // Create the specialized ad conversion handler
  const adConversionHandler = createAdConversionHandler({
    eventManager,
    sendEdgeNetworkRequest,
    consent,
    logger,
  });

  const THROTTLE_MINUTES = componentConfig.throttleMinutes || 30;

  // Shared state for onBeforeSendEvent hook
  const sharedState = {
    surferIdAppendedToAepEvent: false,
  };

  const sendAdConversion = async (optionsFromCommand = {}) => {
    const { skwcid, efid } = getUrlParams();
    const isClickThru = !!(skwcid || efid);
    const isDisplay = componentConfig.isDisplay;
    const idsData = sessionManager.readAdvertisingIds();
    const lastConversionTime = idsData.lastConversionTime;
    // todo : evaluate if this will create problem in case of multiple alloy instances , one alloy instance fired adconversion then other alloy instance fires this and willl get throttled as lastconversiontime is not tracked at alloy instance level
    if (isDisplay && shouldThrottle(lastConversionTime, THROTTLE_MINUTES)) {
      const elapsed = (Date.now() - lastConversionTime) / (60 * 1000);
      logger.info("Ad conversion throttled", {
        lastConversion: new Date(lastConversionTime).toISOString(),
        throttleMinutes: THROTTLE_MINUTES,
        elapsedMinutes: Math.round(elapsed),
      });
      return {
        status: "throttled",
        timestamp: lastConversionTime,
        message: `Ad conversion throttled (sent within ${THROTTLE_MINUTES} mins)`,
      };
    }

    try {
      if (isClickThru) {
        return await handleClickThrough({
          eventManager,
          sessionManager,
          adConversionHandler,
          logger,
          componentConfig,
          skwcid,
          efid,
          isDisplay,
          optionsFromCommand,
        });
      }
      logger.info("Handling view-through ad conversion...");
      return await resolvedIdsAndDispatchConversionEvent({
        eventManager,
        sessionManager,
        logger,
        componentConfig,
        adConversionHandler,
        isDisplay,
      });
    } catch (error) {
      logger.error("Error in sendAdConversion:", error);
      throw error;
    }
  };

  return {
    lifecycle: {
      onComponentsRegistered() {
        logger.info(
          "Advertising component registered - auto-triggering sendAdConversion",
        );
        // Auto-trigger sendAdConversion for all scenarios
        sendAdConversion().catch((error) => {
          logger.error("Error in auto-triggered sendAdConversion:", error);
        });
      },
      onBeforeEvent: ({ event, onResponse, onRequestFailure }) => {
        handleOnBeforeSendEvent({
          sessionManager,
          logger,
          state: sharedState,
          event,
          onResponse,
          onRequestFailure,
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
