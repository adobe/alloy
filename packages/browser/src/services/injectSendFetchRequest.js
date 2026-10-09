/*
Copyright 2019 Adobe. All rights reserved.
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
 * @param {Object} params
 * @param {typeof window.fetch} params.fetch
 * @param {{ info: (...args: any[]) => void }} params.logger
 * @returns {NetworkService["sendFetchRequest"]}
 */
export default ({ fetch, logger }) => {
  /**
   * @param {string} url
   * @param {string} body
   * @param {Record<string, string> | undefined} headers
   * @param {boolean} keepalive
   */
  const startFetch = (url, body, headers, keepalive) =>
    fetch(url, {
      method: "POST",
      cache: "no-cache",
      credentials: "include", // To set the cookie header in the request.
      headers: {
        "Content-Type": "text/plain; charset=UTF-8",
        ...headers,
      },
      referrerPolicy: "no-referrer-when-downgrade",
      body,
      ...(keepalive ? { keepalive: true } : {}),
    });

  return (url, body, headers, { keepalive = false } = {}) => {
    let responsePromise = startFetch(url, body, headers, keepalive);

    if (keepalive) {
      // Browsers reject keepalive requests whose body, together with every
      // other in-flight keepalive request and sendBeacon on the page, exceeds
      // 64 KiB. The rejection is a TypeError that looks the same as any other
      // network error ("Failed to fetch", "NetworkError when attempting to
      // fetch resource.", "Load failed") and arrives before anything is sent,
      // so retry once without keepalive. Only fetch() itself is covered here;
      // a failure while reading the response is not retried because the
      // server already received the request.
      responsePromise = responsePromise.catch(() => {
        logger.info(
          "Unable to send the request with `keepalive`; falling back to a regular `fetch`.",
        );
        return startFetch(url, body, headers, false);
      });
    }

    return responsePromise.then((response) => {
      return response.text().then((responseBody) => ({
        statusCode: response.status,
        // We expose headers through a function instead of creating an object
        // with all the headers up front largely because the native
        // request.getResponseHeader method is case-insensitive.
        getHeader(name) {
          return response.headers.get(name);
        },
        body: responseBody,
      }));
    });
  };
};
