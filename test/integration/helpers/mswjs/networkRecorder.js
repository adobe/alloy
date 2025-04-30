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
class NetworkRecorder {
  constructor() {
    this.calls = [];
  }

  /**
   * Captures request information for network calls
   * @param {Object} options - The request capture options
   * @param {Object} options.request - The request object
   * @param {string} options.requestId - Unique identifier for the request
   */
  captureRequest({ request, requestId }) {
    let call = this.calls.find((c) => c.requestId === requestId);

    if (!call) {
      call = { requestId };
      this.calls.push(call);
    }

    call.request = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      timestamp: Date.now(),
    };
  }

  /**
   * Captures response information for network calls
   * @param {Object} options - The response capture options
   * @param {string} options.requestId - Unique identifier for the request
   * @param {Response} options.response - The response object
   */
  async captureResponse({ requestId, response }) {
    const call = this.calls.find((c) => c.requestId === requestId);

    if (!call) {
      return;
    }

    // Clone the response to be able to read the body
    const responseClone = response.clone();
    let body;

    try {
      const bodyText = await responseClone.text();
      try {
        // Try to parse as JSON first
        body = JSON.parse(bodyText);
      } catch {
        // If not JSON, store as text
        body = bodyText;
      }
    } catch (e) {
      body = `Unable to read body: ${e.message}`;
    }

    call.response = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body,
      timestamp: Date.now(),
    };
  }

  /**
   * Adds a delay to allow pending network calls to be captured
   * @param {number} ms - Milliseconds to delay (defaults to 10ms)
   * @returns {Promise<void>} - Promise that resolves after the delay
   */
  // eslint-disable-next-line class-methods-use-this
  async waitForCalls(ms = 10) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  /**
   * Finds network calls that match either a regex pattern or a segment URL string
   * @param {RegExp|string} pattern - Regex pattern or segment URL string to match against
   * @returns {Array} - Array of matching call objects
   */
  findCalls(pattern) {
    if (!pattern) {
      return [];
    }

    // If pattern is a string, treat it as a segment URL
    if (typeof pattern === "string") {
      pattern = new RegExp(`/${pattern}/`, "i");
    }

    return this.calls.filter(
      (call) => call.request && pattern.test(call.request.url),
    );
  }

  /**
   * Finds the first network call that match either a regex pattern or a segment URL string
   * @param {RegExp|string} pattern - Regex pattern or segment URL string to match against
   * @returns {object|undefined} The first call matching the pattern. undefined otherwise.
   */
  findCall(pattern) {
    return this.findCalls(pattern)[0];
  }

  reset() {
    this.calls = [];
  }
}

export const networkRecorder = new NetworkRecorder();
