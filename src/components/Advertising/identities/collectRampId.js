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

import { loadScript } from "../../../utils/dom/index.js";
import { RAMP_ID } from "../constants/index.js";

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

const processEnvelope = (envelope, resolve, cookieManager, logger) => {
  let parsedEnvelope;
  try {
    parsedEnvelope = JSON.parse(envelope).envelope;
  } catch {
    parsedEnvelope = envelope;
  }

  if (parsedEnvelope && !state.rampIdCallInitiated) {
    state.rampIdCallInitiated = true;
    state.rampIdEnv = parsedEnvelope;
    state.envelopeRetrievalInProgress = false;
    state.inProgressRampIdPromise = null;
    cookieManager.setValue(RAMP_ID, state.rampIdEnv);
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
        tryToRetrieve();
      }
    }, delay);
  };

  tryToRetrieve();
};

const initiateRampIDCall = (rampIdScriptPath, cookieManager, logger) => {
  if (state.inProgressRampIdPromise) {
    return state.inProgressRampIdPromise;
  }

  state.inProgressRampIdPromise = new Promise((resolve, reject) => {
    loadScript(rampIdScriptPath, {
      onLoad: () => {
        if (
          typeof window.ats !== "undefined" &&
          !state.envelopeRetrievalInProgress
        ) {
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
                state.envelopeRetrievalInProgress = false;
                window.addEventListener("lrEnvelopePresent", () => {
                  if (state.envelopeRetrievalInProgress) return;
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
        retrieveEnvelopeWithRetries(resolve, reject, cookieManager, logger);
      },
      onError: (error) => {
        logger.error("Could not initiate RampID call.", error);
        state.inProgressRampIdPromise = null;
        reject(error);
      },
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
    return Promise.resolve(state.rampIdEnv);
  }
  if (cookieManager) {
    const rampIdFromCookie = cookieManager.getValue(RAMP_ID);
    if (rampIdFromCookie) {
      state.rampIdEnv = rampIdFromCookie;
      return Promise.resolve(rampIdFromCookie);
    }
  }
  if (!resolveRampIdIfNotAvailable) {
    return Promise.resolve(null);
  }
  return initiateRampIDCall(rampIdScriptPath, cookieManager, logger);
};

export { getRampId, initiateRampIDCall };
