/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/** @import { NetworkService } from "@adobe/alloy-core/services" */

/**
 * Node has no `navigator.sendBeacon`, so there is no separate unload-safe
 * transport — both network strategies use `fetch`.
 *
 * @param {Object} [options]
 * @param {Record<string, string>} [options.headers] Extra headers merged
 * into every outgoing request (e.g. from `pickForwardableHeaders`). Can't
 * override `Content-Type`.
 * @returns {NetworkService}
 */
const createNodeNetworkService = ({ headers: forwardedHeaders = {} } = {}) => {
  /**
   * @param {string} url
   * @param {string} body
   */
  const sendFetchRequest = (url, body) =>
    fetch(url, {
      method: "POST",
      headers: {
        ...forwardedHeaders,
        "Content-Type": "text/plain; charset=UTF-8",
      },
      body,
    }).then((response) =>
      response.text().then((responseBody) => ({
        statusCode: response.status,
        /** @param {string} name */
        getHeader(name) {
          return response.headers.get(name);
        },
        body: responseBody,
      })),
    );

  return {
    sendFetchRequest,
    sendBeaconRequest: sendFetchRequest,
  };
};

export default createNodeNetworkService;
