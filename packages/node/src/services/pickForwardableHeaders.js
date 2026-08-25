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

/** @import { NodeRequestHeaders } from "./createNodePlatformServices.js" */

import getHeader from "./getHeader.js";

// Forwarded so Edge Network's own device/locale/geo parsing sees the real
// visitor instead of this Node process.
const FORWARDABLE_HEADER_NAMES = [
  "user-agent",
  "accept-language",
  // User-Agent Client Hints
  "sec-ch-ua",
  "sec-ch-ua-mobile",
  "sec-ch-ua-platform",
  "sec-ch-ua-platform-version",
  "sec-ch-ua-arch",
  "sec-ch-ua-bitness",
  "sec-ch-ua-full-version-list",
  "sec-ch-ua-model",
  "sec-ch-ua-wow64",
  // Client IP, as set by a proxy/load balancer in front of this server —
  // otherwise Edge Network attributes every request to this server's IP.
  "x-forwarded-for",
  "forwarded",
  "x-real-ip",
];

/**
 * @param {NodeRequestHeaders} [headers]
 * @returns {Record<string, string>}
 */
const pickForwardableHeaders = (headers) => {
  /** @type {Record<string, string>} */
  const picked = {};
  FORWARDABLE_HEADER_NAMES.forEach((name) => {
    const value = getHeader(headers, name);
    if (typeof value === "string" && value) {
      picked[name] = value;
    }
  });
  return picked;
};

export default pickForwardableHeaders;
