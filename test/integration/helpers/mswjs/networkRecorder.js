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

import waitFor from "../utils/waitFor.js";

class NetworkRecorder {
  /**
   * @typedef {Object} NetworkCall
   * @property {string} requestId
   * @property {Object} [request]
   * @property {string} request.url
   * @property {string} request.method
   * @property {Record<string, string>} request.headers
   * @property {number} request.timestamp
   * @property {Object} [response]
   * @property {number} response.status
   * @property {string} response.statusText
   * @property {Record<string, string>} response.headers
   * @property {number} response.timestamp
   * @property {string | Object} response.body
   */

  constructor() {
    /** @type {NetworkCall[]} */
    this.calls = [];
  }

  /**
   * Captures request information for network calls
   * @param {Object} options - The request capture options
   * @param {Request} options.request - The request object
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
    /** @type {string | Object} */
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
   * Finds network calls that match either a regex pattern or a segment URL string
   * @param {RegExp|string} pattern - Regex pattern or segment URL string to match against
   * @param {Object} [options] - Search options
   * @param {number} [options.retries=5] - Number of retries if no calls are found
   * @param {number} [options.delayMs] - Milliseconds to delay between retries
   * @returns {Promise<NetworkCall[]>} - Array of matching call objects
   */
  async findCalls(pattern, { retries = 5, delayMs } = {}) {
    if (!pattern) {
      return [];
    }

    // If pattern is a string, treat it as a segment URL
    if (typeof pattern === "string") {
      pattern = new RegExp(`/${pattern}/`, "i");
    }

    let retriesLeft = retries;

    /** @type {NetworkCall[]} */
    let calls = [];

    while (retriesLeft > 0) {
      calls = this.calls.filter(
        (call) => call.request && pattern.test(call.request.url),
      );

      if (calls.length > 0 && calls.every((c) => c.response)) {
        break;
      }

      // eslint-disable-next-line no-await-in-loop
      await waitFor(delayMs);
      retriesLeft -= 1;
    }

    return calls.filter((call) => call.request && call.response);
  }

  /**
   * Finds the first network call that match either a regex pattern or a segment URL string
   * @param {RegExp|string} pattern - Regex pattern or segment URL string to match against
   * @param {Object} [options] - Search options
   * @param {number} [options.retries] - Number of retries if no calls are found
   * @param {number} [options.delayMs] - Milliseconds to delay between retries
   * @returns {Promise<NetworkCall | undefined>} The first call matching the pattern. undefined otherwise.
   */
  async findCall(pattern, options) {
    const calls = await this.findCalls(pattern, options);
    return calls.length > 0 ? calls[0] : undefined;
  }

  reset() {
    this.calls = [];
  }
}

export const networkRecorder = new NetworkRecorder();
