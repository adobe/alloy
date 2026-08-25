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

/**
 * Reads a single header from either shape `request.headers` can be — a
 * plain object, or a WHATWG `Headers` instance (e.g. fetch-standard
 * `Request`s, as used by Next.js Route Handlers, Hono, etc.), which only
 * exposes values through `.get()`.
 *
 * @param {NodeRequestHeaders | undefined} headers
 * @param {string} name Lowercase header name.
 * @returns {string | string[] | undefined}
 */
const getHeader = (headers, name) => {
  if (!headers) {
    return undefined;
  }
  if (headers instanceof Headers) {
    return headers.get(name) ?? undefined;
  }
  return headers[name];
};

export default getHeader;
