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
import validateAdConversionOptions from "./utils/validateAdConversionOptions.js";
import fetchAllIds from "./identities/fetchAllIds.js";
import createCookieSessionManager from "./utils/createAdvertisingSessionManager.js";
import createLoggingCookieJar from "../../utils/createLoggingCookieJar.js";
import { cookieJar } from "../../utils/index.js";

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

  // Create cookie jar with logging
  const loggingCookieJar = createLoggingCookieJar({ logger, cookieJar });

  // Create session manager
  const sessionManager = createCookieSessionManager({
    orgId: "temp_ims_org_id",
    cookieJar: loggingCookieJar,
    logger,
    namespace: "advertising",
  });

  // Store for advertising IDs
  let advertisingIds = {};

  const handleFetch = function () {
    return fetchAllIds()
      .then((ids) => {
        advertisingIds = ids;

        // Store IDs in the session for persistence
        sessionManager.setValue("advertisingIds", ids);

        logger.info("Advertising IDs stored:", advertisingIds);
        return ids;
      })
      .catch((error) => {
        logger.error("Error fetching advertising IDs:", error);
        return {};
      });
  };

  // Create the specialized ad conversion handler
  const adConversionHandler = createAdConversionHandler({
    eventManager,
    sendEdgeNetworkRequest,
    consent,
    logger,
  });

  const THROTTLE_MINUTES = 30;

  const getUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      skwcid: urlParams.get("skwcid"),
      efid: urlParams.get("ef_id"),
    };
  };

  const shouldThrottle = (lastTime) => {
    const elapsedMinutes = (Date.now() - lastTime) / (60 * 1000);
    return elapsedMinutes < THROTTLE_MINUTES;
  };

  const sendAdConversion = async (options = {}) => {
    const isDisplay = Object.keys(options).length > 0;
    const { skwcid, efid } = getUrlParams();
    const sessionData = sessionManager.readSession();
    const lastConversionTime = sessionData.lastConversionTime;

    try {
      // Throttle for Display only (both click thru and view thru)
      if (
        isDisplay &&
        lastConversionTime &&
        shouldThrottle(lastConversionTime)
      ) {
        const elapsed = (Date.now() - lastConversionTime) / (60 * 1000);
        logger.info("Ad conversion throttled", {
          lastConversion: new Date(lastConversionTime).toISOString(),
          throttleMinutes: THROTTLE_MINUTES,
          elapsedMinutes: Math.round(elapsed),
        });

        return {
          status: "throttled",
          timestamp: lastConversionTime,
          message: "Ad conversion throttled (sent within the last 30 minutes)",
        };
      }

      logger.info("Sending ad conversion", options);
      await handleFetch();

      const event = eventManager.createEvent();
      const xdm = { eventType: "advertising.conversion" };

      // Set cookie for click data if skwcid/efid present
      if (skwcid || efid) {
        const clickData = {
          click_time: Date.now(),
          ...(skwcid && { skwcid }),
          ...(efid && { efid }),
        };
        sessionManager.writeCookie("ev_cc", clickData, {}, false);
      }

      // click thru case
      if (skwcid || efid) {
        if (!isDisplay) {
          xdm.advertising = {
            adConversionDetails: {
              ...(efid && { adStitchData: efid }),
              ...(skwcid && { adConversionMetaData: skwcid }),
            },
          };
        } else {
          xdm.advertising = {
            adConversionDetails: {
              ...(efid && { adStitchData: efid }),
              ...(skwcid && { adConversionMetaData: skwcid }),
            },
            adAssetReference: {
              advertiser: options.advertiser || "UNKNOWN",
            },
          };
        }
      } else {
        // view thru case
        const evCcData = sessionManager.readCookie("ev_cc");
        xdm.data = {
          conversionType: "vt",
          dspAdvertiserID: "1111111",
          amoAdvertiserID: "2222222",
          gSurferId: advertisingIds?.surfer_id || "xxxxxx",
          rampIDEnv: "aaaa",
          ...(evCcData?.click_time && { clickTime: evCcData.click_time }),
        };
      }

      event.setUserXdm(xdm);

      // Update conversion time only for Display
      if (isDisplay) {
        sessionManager.setValue("lastConversionTime", Date.now(), "ev_cc");
      }

      return await adConversionHandler.trackAdConversion({ event });
    } catch (error) {
      logger.error("Error in sendAdConversion", error);
      throw error;
    }
  };

  return {
    lifecycle: {
      onComponentsRegistered() {
        logger.info("Advertising component registered");
        // Start fetching IDs when component is registered
        if (typeof document !== "undefined") {
          if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", handleFetch);
          } else {
            handleFetch();
          }
        }
      },
    },
    commands: {
      sendAdConversion: {
        optionsValidator: (options) => validateAdConversionOptions({ options }),
        run: sendAdConversion,
      },
      getAdvertisingIdentity: {
        run: async () => {
          // Check if we already have IDs stored in the session
          const sessionData = sessionManager.readSession();

          // If we have cached advertising IDs that aren't expired, use them
          if (
            sessionData.advertisingIds &&
            !sessionManager.isSessionExpired()
          ) {
            logger.debug("Using cached advertising IDs from session");
            return { ...sessionData.advertisingIds };
          }

          // Otherwise fetch new IDs
          const ids = await handleFetch();

          // Store the IDs in the session for future use
          sessionManager.setValue("advertisingIds", ids);

          return { ...ids };
        },
      },
    },
  };
};
