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

/**
 * Creates a wrapper around a callback that implements a rolling timeout.
 * The timeout resets on every data event or ping. If no activity occurs
 * within the timeout period, an error is passed to the callback.
 * After timeout fires, all subsequent calls are ignored.
 *
 * @param {Object} options - Configuration options
 * @param {Function} options.onStreamResponseCallback - The callback function to wrap
 * @param {number} options.streamTimeout - Timeout duration in milliseconds
 * @returns {Object} Object with onEvent, onPing, and onComplete handler functions
 */
export default ({ onStreamResponseCallback, streamTimeout }) => {
  let timedOut = false;
  let timeoutId;

  const resetTimeout = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timedOut = true;
      onStreamResponseCallback({
        error: {
          message: `Stream timeout: No data received within ${streamTimeout / 1000} seconds`,
        },
      });
    }, streamTimeout);
  };

  // Start initial timeout
  resetTimeout();

  return {
    /**
     * Handle data events from the stream parser.
     * Resets the timeout and forwards the event to the callback.
     *
     * @param {Object} event - The parsed SSE event
     */
    onEvent: (event) => {
      if (timedOut) {
        return;
      }
      resetTimeout();
      onStreamResponseCallback(event);
    },

    /**
     * Handle ping events from the stream parser.
     * Resets the timeout but does not forward anything to the callback.
     */
    onPing: () => {
      if (timedOut) {
        return;
      }
      resetTimeout();
    },

    /**
     * Handle stream completion.
     * Clears the timeout since the stream has ended successfully.
     */
    onComplete: () => {
      clearTimeout(timeoutId);
    },
  };
};
