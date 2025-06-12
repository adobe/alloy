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
let rampIdEnv;
let rampIdCallInitiated;
let inProgressPromise = null; // Store the in-progress promise
const getScriptElement = function getScriptElement(url) {
  const scriptTag = document.createElement("script");
  scriptTag.language = "Javascript";
  scriptTag.type = "text/javascript";
  scriptTag.src = url;
  return scriptTag;
};
const initiateRampIDCall = function initiateRampIDCall(rampIdScriptPath) {
  // If there's already a fetch in progress, return that promise
  if (inProgressPromise) {
    return inProgressPromise;
  }

  // Create a new promise and store it
  inProgressPromise = new Promise((resolve, reject) => {
    let rampIdObj;
    let retryCount = 5;
    let timerMultiplier = 1;
    const timeoutIds = [];

    const waitForRampId = function waitForRampId(tmpRampIdObj) {
      if (tmpRampIdObj !== undefined) {
        rampIdObj = tmpRampIdObj;
        rampIdEnv = JSON.parse(rampIdObj).envelope;
        if (
          rampIdEnv !== undefined &&
          rampIdEnv !== "" &&
          !rampIdCallInitiated
        ) {
          rampIdCallInitiated = true;
          // Clear any pending timeouts
          timeoutIds.forEach((id) => clearTimeout(id));
          // Resolve the promise with the rampId envelope
          resolve(rampIdEnv);
          inProgressPromise = null; // Clear stored promise on success
        }
      } else {
        const timeoutIdObj = setTimeout(function timeoutHandler() {
          if (
            window.ats !== undefined &&
            rampIdObj === undefined &&
            retryCount !== 0
          ) {
            retryCount -= 1;
            timerMultiplier += 1;
            window.ats.retrieveEnvelope().then(
              function resolveHandler(rampIdResponse) {
                waitForRampId(rampIdResponse);
              },
              function rejectHandler() {
                // Handle error silently
              },
            );
          } else if (retryCount !== 0) {
            retryCount -= 1;
            timerMultiplier += 1;
            waitForRampId(tmpRampIdObj);
          } else {
            // If we've exhausted retries, reject the promise
            reject(
              new Error("Failed to retrieve RampID after maximum retries"),
            );
            inProgressPromise = null; // Clear stored promise on failure
          }
        }, 500 * timerMultiplier);

        // Keep track of timeout IDs to clear them if needed
        timeoutIds.push(timeoutIdObj);
      }
    };

    if (typeof window.ats !== "undefined") {
      // check for indirect mode of rampID initialization
      const laConfiguration = window.ats.outputCurrentConfiguration();
      if (
        laConfiguration !== undefined &&
        laConfiguration.DETECTION_MODULE_INFO !== undefined
      ) {
        window.ats
          .retrieveEnvelope()
          .then(function envelopeHandler(envelopeResponse) {
            if (envelopeResponse !== undefined) {
              waitForRampId(envelopeResponse);
            } else {
              window.addEventListener(
                "lrEnvelopePresent",
                function lrEnvelopePresentHandler() {
                  window.ats.retrieveEnvelope().then(
                    function envelopeResolveHandler(envelopeResult) {
                      waitForRampId(envelopeResult);
                    },
                    function envelopeRejectHandler(error) {
                      reject(error);
                      inProgressPromise = null; // Clear stored promise on error
                    },
                  );
                },
              );
            }
          })
          .catch((error) => {
            reject(error);
            inProgressPromise = null; // Clear stored promise on error
          });
      }
    } else {
      // Load the rampId script if not already loaded

      const script = getScriptElement(rampIdScriptPath);

      if (script.addEventListener) {
        script.addEventListener("load", waitForRampId, false);
      } else {
        script.attachEvent("onload", waitForRampId);
      }

      script.onerror = function scriptErrorHandler() {
        reject(new Error("Failed to load RampId script"));
        inProgressPromise = null; // Clear stored promise on error
      };

      if (document.body !== undefined) {
        document.body.appendChild(script);
      } else {
        document.head.appendChild(script);
      }
    }
  });

  return inProgressPromise;
};

// Store rampId in cookie using sessionManager
const storeRampIdInCookie = function storeRampIdInCookie(
  sessionManager,
  rampId,
) {
  if (sessionManager && rampId) {
    try {
      sessionManager.setValue("ramp_id", rampId);
      return true;
    } catch {
      // Handle error silently for production
      return false;
    }
  }
  return false;
};

// Expose function to get the current rampId
const getRampId = function getRampId(
  rampIdScriptPath,
  sessionManager,
  resolveRampIdIfNotAvailable = true,
) {
  // Check if rampId is already initialized in memory
  if (rampIdEnv && rampIdEnv !== "") {
    return Promise.resolve(rampIdEnv);
  }

  // If not in memory, check if available in cookie using sessionManager
  if (sessionManager) {
    try {
      const cookieRampId = sessionManager.getValue("ramp_id");
      if (cookieRampId) {
        // Update in-memory value
        rampIdEnv = cookieRampId;
        rampIdCallInitiated = true;
        return Promise.resolve(cookieRampId);
      }
    } catch {
      // Handle error silently for production
    }
  }
  if (resolveRampIdIfNotAvailable) {
    // If not in memory or cookie, initialize and store in cookie
    return initiateRampIDCall(rampIdScriptPath).then((rampId) => {
      if (sessionManager) {
        storeRampIdInCookie(sessionManager, rampId);
      }
      return rampId;
    });
  }
  return Promise.resolve(null);
};
// Export the functions for use in other modules
export { getRampId, initiateRampIDCall };
