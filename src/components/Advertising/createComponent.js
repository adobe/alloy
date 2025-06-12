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
import fetchAllIds from "./identities/fetchAllIds.js";
import createCookieSessionManager from "./utils/createAdvertisingSessionManager.js";
import createLoggingCookieJar from "../../utils/createLoggingCookieJar.js";
import handleOnBeforeSendEvent from "./utils/createOnBeforeSendEventHandler.js";
import handleClickThrough from "./utils/createClickThroughHandler.js";
import { cookieJar } from "../../utils/index.js";
import {
  getSurferId,
  hasSurferIdChanged,
} from "./utils/getAdvertisingIdentity.js";
import { getID5Id } from "./identities/fetchID5Id.js";
import { getRampId } from "./identities/fetchRampId.js";

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

  const getUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      skwcid: urlParams.get("skwcid"),
      efid: urlParams.get("ef_id"),
    };
  };

  const shouldThrottle = (lastTime) => {
    if (!lastTime) return false;
    const elapsedMinutes = (Date.now() - lastTime) / (60 * 1000);
    return elapsedMinutes < THROTTLE_MINUTES;
  };

  const sendAdConversion = async (optionsFromCommand = {}) => {
    const { skwcid, efid } = getUrlParams();
    const isClickThru = !!(skwcid || efid);
    const isDisplay = componentConfig.isDisplay;
    const idsData = sessionManager.readAdvertisingIds();
    const lastConversionTime = idsData.lastConversionTime;

    // Overall throttling for display campaigns
    if (isDisplay && shouldThrottle(lastConversionTime)) {
      const elapsed = (Date.now() - lastConversionTime) / (60 * 1000);
      logger.info("Ad conversion throttled (overall for display campaign)", {
        lastConversion: new Date(lastConversionTime).toISOString(),
        throttleMinutes: THROTTLE_MINUTES,
        elapsedMinutes: Math.round(elapsed),
      });
      return {
        status: "throttled",
        timestamp: lastConversionTime,
        message: `Ad conversion throttled (display campaign sent within the last ${THROTTLE_MINUTES} minutes)`,
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
      // View-through case
      logger.info(
        "Handling view-through ad conversion with ID resolution callbacks.",
        { optionsFromCommand },
      );

      const invocationConfig = {
        id5PartnerId: componentConfig.id5PartnerId,
        rampIdScriptPath: componentConfig.liverampScriptPath,
        logger,
      };

      // Helper function to send ad conversion event with available IDs
      const sendEventWithAvailableIds = async (triggerIdType) => {
        logger.info(
          `Sending ad conversion event triggered by ${triggerIdType} resolution`,
        );

        const evCcData = sessionManager.readClickData();
        const commonViewThroughDataForXdm = {
          conversionType: "vt",
          dspAdvertiserID: componentConfig.dspAdvertiserID || "1111111",
          amoAdvertiserID: componentConfig.amoAdvertiserID || "2222222",
          ...(evCcData?.click_time && { clickTime: evCcData.click_time }),
        };

        const xdm = {
          eventType: "advertising.conversion",
          data: { ...commonViewThroughDataForXdm },
        };
        // todo , not fire if surfer_id has not changed
        // Add all available resolved IDs
        const availableIds = {};
        const surferId = getSurferId(sessionManager, false);
        const id5Id = getID5Id(
          componentConfig.id5PartnerId,
          sessionManager,
          false,
        );
        const rampId = getRampId(sessionManager, false);
        if (surferId) {
          xdm.data.gSurferId = surferId;
          availableIds.surferId = surferId;
        }
        if (id5Id) {
          xdm.data.id5_id = id5Id;
          availableIds.id5Id = id5Id;
        }
        if (rampId) {
          xdm.data.rampIDEnv = rampId;
          availableIds.rampId = rampId;
        }

        const event = eventManager.createEvent();
        event.setUserXdm(xdm);
        if (isDisplay) {
          sessionManager.setValue("lastConversionTime", Date.now());
          logger.info(
            "lastConversionTime updated for display view-through operation.",
          );
        }
        logger.info(
          `Ad conversion event n/w call triggered  (${triggerIdType}). IDs included:`,
          Object.keys(availableIds),
        );
        return adConversionHandler.trackAdConversion({ event });
      };

      // Fetch all ID promises
      const idPromisesMap = fetchAllIds(sessionManager, invocationConfig);
      logger.info(
        "ID resolution promises initiated:",
        Object.keys(idPromisesMap),
      );

      const eventResults = [];

      // Process each ID type with callbacks
      if (idPromisesMap.surferId) {
        idPromisesMap.surferId
          .then(async (value) => {
            if (value && hasSurferIdChanged()) {
              logger.info("Surfer ID resolved:", value);
              eventResults.push(sendEventWithAvailableIds("surferId"));
            }
          })
          .catch((e) => {
            logger.warn("Surfer ID resolution failed:", e.message);
          });
      }

      if (idPromisesMap.id5Id) {
        idPromisesMap.id5Id
          .then(async (value) => {
            if (value && hasSurferIdChanged()) {
              logger.info("ID5 ID resolved:", value);
              eventResults.push(sendEventWithAvailableIds("id5Id"));
            }
          })
          .catch((e) => {
            logger.warn("ID5 ID resolution failed:", e.message);
          });
      }

      if (idPromisesMap.rampId) {
        idPromisesMap.rampId
          .then(async (value) => {
            if (value && hasSurferIdChanged()) {
              logger.info("Ramp ID resolved:", value);
              eventResults.push(sendEventWithAvailableIds("rampId"));
            }
          })
          .catch((e) => {
            logger.warn("Ramp ID resolution failed:", e.message);
          });
      }
      return eventResults;
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
