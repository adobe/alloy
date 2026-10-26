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

import type { Logger } from "@adobe/alloy-core/core/types.js";
import type { CookieManager } from "../types.js";
import { loadScript } from "@adobe/alloy-core/utils/dom";
import { RAMP_ID, RAMP_ID_EXPIRES } from "../constants/index.js";

const RETRY_CONFIG = {
  MAX_COUNT: 15,
  MAX_TIME_MS: 30000,
  DELAY_BASE_MS: 500,
  MAX_DELAY_MS: 5000,
  SHORT_TIMEOUT_MS: 2000,
};

const state: {
  rampIdEnv: string | undefined;
  rampIdCallInitiated: boolean;
  inProgressRampIdPromise: Promise<string | null> | null;
  scriptLoadingInitiated: boolean;
  envelopeRetrievalInProgress: boolean;
} = {
  rampIdEnv: undefined,
  rampIdCallInitiated: false,
  inProgressRampIdPromise: null,
  scriptLoadingInitiated: false,
  envelopeRetrievalInProgress: false,
};

const processEnvelope = (
  envelope: string,
  resolve: (value: string) => void,
  cookieManager: CookieManager,
  logger: Logger,
) => {
  let parsedEnvelope: string;
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
    cookieManager.setValue(RAMP_ID_EXPIRES, Date.now() + 48 * 60 * 60 * 1000); //expires in 48 hours
    resolve(state.rampIdEnv);
  } else {
    logger.warn("Invalid RampID envelope received", {
      envelope: parsedEnvelope,
    });
    state.envelopeRetrievalInProgress = false;
  }
};

const retrieveEnvelopeWithRetries = (
  resolve: (value: string) => void,
  reject: (reason: unknown) => void,
  cookieManager: CookieManager,
  logger: Logger,
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

const initiateRampIDCall = (
  rampIdScriptPath: string,
  cookieManager: CookieManager,
  logger: Logger,
  useShortTimeout = false,
): Promise<string | null> => {
  if (state.inProgressRampIdPromise) {
    return state.inProgressRampIdPromise;
  }

  const timeoutMs = useShortTimeout
    ? RETRY_CONFIG.SHORT_TIMEOUT_MS
    : RETRY_CONFIG.MAX_TIME_MS;

  let timedOut = false;

  const mainPromise = new Promise<string>((resolve, reject) => {
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
                if (!timedOut) {
                  processEnvelope(
                    envelopeResponse,
                    resolve,
                    cookieManager,
                    logger,
                  );
                }
              } else {
                state.envelopeRetrievalInProgress = false;
                window.addEventListener("lrEnvelopePresent", () => {
                  // window.ats was present when the script loaded.
                  if (state.envelopeRetrievalInProgress || timedOut) return;
                  state.envelopeRetrievalInProgress = true;
                  window.ats!.retrieveEnvelope().then(
                    (envelopeResult) => {
                      if (!timedOut) {
                        processEnvelope(
                          envelopeResult,
                          resolve,
                          cookieManager,
                          logger,
                        );
                      }
                    },
                    (error) => {
                      if (!timedOut) {
                        logger.error(
                          "Failed to retrieve envelope after event",
                          error,
                        );
                        state.envelopeRetrievalInProgress = false;
                        reject(error);
                        state.inProgressRampIdPromise = null;
                      }
                    },
                  );
                });
              }
            })
            .catch((error) => {
              if (!timedOut) {
                logger.error("Error retrieving envelope", error);
                state.envelopeRetrievalInProgress = false;
                reject(error);
                state.inProgressRampIdPromise = null;
              }
            });
        }

        retrieveEnvelopeWithRetries(
          (val) => {
            if (!timedOut) resolve(val);
          },
          (err) => {
            if (!timedOut) reject(err);
          },
          cookieManager,
          logger,
        );
      },
      onError: (error) => {
        if (!timedOut) {
          reject(error);
        }
        state.inProgressRampIdPromise = null;
      },
    });
  });

  const timeoutPromise = new Promise<null>((resolve) => {
    setTimeout(() => {
      timedOut = true;
      resolve(null);
    }, timeoutMs);
  });

  state.inProgressRampIdPromise = Promise.race([
    mainPromise,
    timeoutPromise,
  ]).finally(() => {
    state.inProgressRampIdPromise = null;
  });

  return state.inProgressRampIdPromise;
};

const getRampId = (
  logger: Logger,
  rampIdScriptPath: string | null | undefined,
  cookieManager: CookieManager,
  resolveRampIdIfNotAvailable = true,
  useShortTimeout = false,
): Promise<string | null> => {
  if (state.rampIdEnv) {
    return Promise.resolve(state.rampIdEnv);
  }
  if (cookieManager) {
    const rampIdFromCookie = cookieManager.getValue<string>(RAMP_ID);
    const rampIdExpires = cookieManager.getValue<number>(RAMP_ID_EXPIRES);
    if (rampIdFromCookie && rampIdExpires && rampIdExpires > Date.now()) {
      state.rampIdEnv = rampIdFromCookie;
      return Promise.resolve(rampIdFromCookie);
    }
  }
  if (!resolveRampIdIfNotAvailable || rampIdScriptPath == null) {
    return Promise.resolve(null);
  }
  return initiateRampIDCall(
    rampIdScriptPath,
    cookieManager,
    logger,
    useShortTimeout,
  );
};

export { getRampId, initiateRampIDCall };
