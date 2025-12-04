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
import { STREAM_START_TIMEOUT_MS } from "./constants.js";

/**
 * Creates a wrapper around a callback that implements a timeout for the first call.
 * If the callback is not invoked within the specified timeout, an error is passed to it.
 * After timeout fires, all subsequent calls are ignored.
 *
 * @param {Function} callback - The callback function to wrap
 * @returns {Function} Wrapped callback function
 */
export default ({ onStreamResponseCallback }) => {
  const timeoutMs = STREAM_START_TIMEOUT_MS;
  let firstCallMade = false;
  let timedOut = false;

  const timeoutId = setTimeout(() => {
    // Double-check firstCallMade right before firing
    if (!firstCallMade) {
      timedOut = true;
      onStreamResponseCallback({
        error: {
          message: "Stream timeout: No data received within 10 seconds",
        },
      });
    }
  }, timeoutMs);

  return (event) => {
    if (timedOut) {
      return;
    }
    if (!firstCallMade) {
      firstCallMade = true;
      clearTimeout(timeoutId);
    }
    onStreamResponseCallback(event);
  };
};
