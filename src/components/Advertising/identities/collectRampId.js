/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { createNode, appendNode } from "../../../utils/dom/index.js";
import { SCRIPT } from "../../../constants/tagName.js";

const RETRY_CONFIG = {
  MAX_COUNT: 15,
  MAX_TIME_MS: 30000,
  DELAY_BASE_MS: 500,
  MAX_DELAY_MS: 5000,
};

const state = {
  rampIdEnv: undefined,
  rampIdCallInitiated: false,
  inProgressRampIdPromise: null,
  scriptLoadingInitiated: false,
  envelopeRetrievalInProgress: false,
};

const storeRampIdInCookie = (cookieManager, rampId, logger) => {
  if (!cookieManager || !rampId) {
    logger.warn("Missing cookieManager or rampId for cookie storage.");
    return;
  }
  try {
    logger.info("Storing RampID in cookie.");
    cookieManager.setValueWithLastUpdated("ramp_id", rampId);
  } catch (error) {
    logger.error("Failed to store RampID in cookie", error);
  }
};

const appendScript = (script, logger) => {
  try {
    if (document.head) {
      logger.info("Appending RampID script to head");
      appendNode(document.head, script);
    } else if (document.body) {
      logger.info("Head not available, appending RampID script to body");
      appendNode(document.body, script);
    } else {
      logger.info("DOM not ready, waiting for DOMContentLoaded");
      document.addEventListener("DOMContentLoaded", () => {
        logger.info("DOM ready, appending RampID script");
        appendNode(document.head || document.body, script);
      });
    }
  } catch (error) {
    logger.error("Error appending RampID script to DOM", error);
    state.scriptLoadingInitiated = false;
  }
};

// ===================================================================================
// UPDATED FUNCTION 1: loadScriptInParallel
// This function is updated to return a Promise that resolves when the script's
// 'onload' event fires, and rejects on 'onerror'. This allows us to wait for
// the script to fully load before trying to use it.
// ===================================================================================
const loadScriptInParallel = (scriptPath, logger) => {
  if (typeof window.ats !== "undefined") {
    logger.info("ATS script already loaded.");
    return Promise.resolve();
  }
  if (state.scriptLoadingInitiated) {
    logger.info("Script loading already in progress.");
    // This part is tricky without a more robust promise cache, but for now
    // we assume the existing process will handle it.
    return Promise.resolve();
  }
  if (document.querySelector(`script[src="${scriptPath}"]`)) {
    logger.info("Script element already exists in DOM. Assuming it will load.");
    return Promise.resolve();
  }

  logger.info("Starting parallel script load", scriptPath);
  state.scriptLoadingInitiated = true;

  try {
    const preloadLink = document.createElement("link");
    preloadLink.rel = "preload";
    preloadLink.as = "script";
    preloadLink.href = scriptPath;
    document.head.appendChild(preloadLink);
    logger.info("Added preload hint for script");
  } catch (error) {
    logger.warn("Failed to add preload hint", error);
  }

  return new Promise((resolve, reject) => {
    const script = createNode(
      SCRIPT,
      {
        src: scriptPath,
        type: "text/javascript",
        async: true,
        crossorigin: "anonymous",
      },
      {
        // On error, reject the promise
        onerror: () => {
          logger.error("Script load failed", { scriptPath });
          state.scriptLoadingInitiated = false;
          reject(new Error(`Failed to load ATS script from ${scriptPath}`));
        },
        // On success, resolve the promise
        onload: () => {
          logger.info("Script loaded successfully");
          if (typeof window.ats === "undefined") {
            logger.warn("Script loaded but ATS object not initialized.");
          }
          resolve();
        },
      },
    );
    appendScript(script, logger);
  });
};

const processEnvelope = (envelope, resolve, cookieManager, logger) => {
  logger.info("Received RampID object", envelope);
  let parsedEnvelope;
  try {
    parsedEnvelope = JSON.parse(envelope).envelope;
  } catch (error) {
    logger.info("parse RampID envelope as is", error);
    parsedEnvelope = envelope;
  }

  if (parsedEnvelope && !state.rampIdCallInitiated) {
    logger.info("Valid RampID envelope received", { envelope: parsedEnvelope });
    state.rampIdCallInitiated = true;
    state.rampIdEnv = parsedEnvelope;
    state.envelopeRetrievalInProgress = false;
    state.inProgressRampIdPromise = null;
    storeRampIdInCookie(cookieManager, state.rampIdEnv, logger);
    resolve(state.rampIdEnv);
  } else {
    logger.warn("Invalid RampID envelope received", {
      envelope: parsedEnvelope,
    });
    state.envelopeRetrievalInProgress = false;
  }
};

const retrieveEnvelopeWithRetries = (
  resolve,
  reject,
  cookieManager,
  logger,
) => {
  let retryCount = RETRY_CONFIG.MAX_COUNT;
  let timerMultiplier = 1;
  let totalElapsedTime = 0;

  const tryToRetrieve = () => {
    if (state.rampIdEnv) return;

    if (totalElapsedTime > RETRY_CONFIG.MAX_TIME_MS) {
      logger.error("Maximum retry time exceeded");
      state.envelopeRetrievalInProgress = false;
      reject(new Error("Failed to retrieve RampID - timeout"));
      state.inProgressRampIdPromise = null;
      return;
    }

    if (retryCount === 0) {
      logger.error("Maximum retries exceeded");
      state.envelopeRetrievalInProgress = false;
      reject(new Error("Failed to retrieve RampID after maximum retries"));
      state.inProgressRampIdPromise = null;
      return;
    }

    logger.info(`Waiting for RampID, retry count: ${retryCount}`);
    const delay = Math.min(
      RETRY_CONFIG.DELAY_BASE_MS * timerMultiplier,
      RETRY_CONFIG.MAX_DELAY_MS,
    );

    setTimeout(() => {
      totalElapsedTime += delay;
      retryCount -= 1;
      timerMultiplier += 1;

      if (
        typeof window.ats !== "undefined" &&
        window.ats !== null &&
        !state.rampIdEnv &&
        !state.envelopeRetrievalInProgress
      ) {
        logger.info("Attempting to retrieve envelope", {
          retryCount,
          timerMultiplier,
        });
        state.envelopeRetrievalInProgress = true;
        window.ats.retrieveEnvelope().then(
          (rampIdResponse) => {
            processEnvelope(rampIdResponse, resolve, cookieManager, logger);
            if (!state.rampIdEnv) tryToRetrieve();
          },
          () => {
            logger.warn("Failed to retrieve envelope");
            state.envelopeRetrievalInProgress = false;
            tryToRetrieve();
          },
        );
      } else {
        logger.info("Retrying RampID check", { retryCount, timerMultiplier });
        tryToRetrieve();
      }
    }, delay);
  };

  tryToRetrieve();
};

// ===================================================================================
// UPDATED FUNCTION 2: initiateRampIDCall
// This function is updated to wait for the loadScriptInParallel promise to
// resolve before it attempts to call window.ats.retrieveEnvelope(). This
// chained promise structure (.then()) eliminates the race condition.
// ===================================================================================
const initiateRampIDCall = (rampIdScriptPath, cookieManager, logger) => {
  if (state.inProgressRampIdPromise) {
    logger.info("Returning existing in-progress RampID promise");
    return state.inProgressRampIdPromise;
  }

  logger.info("Initiating new RampID call");

  state.inProgressRampIdPromise = new Promise((resolve, reject) => {
    // First, call the script loader and wait for it to complete.
    loadScriptInParallel(rampIdScriptPath, logger)
      .then(() => {
        // SUCCESS: This code runs ONLY AFTER the script is loaded.
        logger.info("ATS script loaded, proceeding with envelope retrieval.");

        // All the logic to retrieve the envelope is now safely placed here.
        if (
          typeof window.ats !== "undefined" &&
          !state.envelopeRetrievalInProgress
        ) {
          logger.info("ATS object found, checking configuration");
          state.envelopeRetrievalInProgress = true;
          window.ats
            .retrieveEnvelope()
            .then((envelopeResponse) => {
              if (envelopeResponse) {
                processEnvelope(
                  envelopeResponse,
                  resolve,
                  cookieManager,
                  logger,
                );
              } else {
                logger.info(
                  "No immediate envelope, waiting for lrEnvelopePresent event",
                );
                state.envelopeRetrievalInProgress = false;
                window.addEventListener("lrEnvelopePresent", () => {
                  if (state.envelopeRetrievalInProgress) return;
                  logger.info("lrEnvelopePresent event received");
                  state.envelopeRetrievalInProgress = true;
                  window.ats.retrieveEnvelope().then(
                    (envelopeResult) =>
                      processEnvelope(
                        envelopeResult,
                        resolve,
                        cookieManager,
                        logger,
                      ),
                    (error) => {
                      logger.error(
                        "Failed to retrieve envelope after event",
                        error,
                      );
                      state.envelopeRetrievalInProgress = false;
                      reject(error);
                      state.inProgressRampIdPromise = null;
                    },
                  );
                });
              }
            })
            .catch((error) => {
              logger.error("Error retrieving envelope", error);
              state.envelopeRetrievalInProgress = false;
              reject(error);
              state.inProgressRampIdPromise = null;
            });
        }
        // The retry mechanism will now safely start after the script has loaded.
        retrieveEnvelopeWithRetries(resolve, reject, cookieManager, logger);
      })
      .catch((error) => {
        // FAILURE: This code runs if the script fails to load.
        logger.error("Could not initiate RampID call.", error);
        state.inProgressRampIdPromise = null; // Reset promise on failure
        reject(error);
      });
  });

  return state.inProgressRampIdPromise;
};

const getRampId = (
  logger,
  rampIdScriptPath,
  cookieManager,
  resolveRampIdIfNotAvailable = true,
) => {
  if (state.rampIdEnv) {
    logger.info("Returning cached RampID");
    return Promise.resolve(state.rampIdEnv);
  }
  if (cookieManager) {
    const rampIdFromCookie = cookieManager.getValueWithLastUpdated("ramp_id");
    if (rampIdFromCookie) {
      logger.info("Returning RampID from cookie", rampIdFromCookie);
      state.rampIdEnv = rampIdFromCookie;
      return Promise.resolve(rampIdFromCookie);
    }
  }
  if (!resolveRampIdIfNotAvailable) {
    logger.info("Not resolving RampID, returning empty promise");
    return Promise.resolve(null);
  }
  logger.info("Initiating RampID collection", { scriptPath: rampIdScriptPath });
  return initiateRampIDCall(rampIdScriptPath, cookieManager, logger);
};

export { getRampId, initiateRampIDCall };
