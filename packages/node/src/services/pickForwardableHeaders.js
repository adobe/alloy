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

// Headers worth forwarding upstream to Edge Network when Node is proxying a
// request on a real visitor's behalf, so Edge Network's own server-side
// device/locale parsing (which normally reads these off the direct
// browser -> Edge Network request) still has something real to parse instead
// of whatever Node's own fetch() would send by default.
const FORWARDABLE_HEADER_NAMES = ["user-agent", "accept-language"];

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
