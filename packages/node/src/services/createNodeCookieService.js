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

/** @import { CookieService } from "@adobe/alloy-core/services" */

/**
 * In-memory only; there is no HTTP request/response to read or write real
 * cookie headers against yet, so identity/consent state does not persist
 * across process restarts or across requests in a server context.
 *
 * The `jar` and `converter` params are the recursion seam for `withConverter`,
 * mirroring the browser cookie service built on js-cookie.
 *
 * @param {Map<string, string>} [jar]
 * @param {{ read?: Function, write?: Function }} [converter]
 * @returns {CookieService}
 */
const createNodeCookieService = (jar = new Map(), converter = {}) => ({
  get: (name) => {
    const value = jar.get(name);
    if (value === undefined) {
      return undefined;
    }
    return converter.read ? converter.read(value, name) : value;
  },
  getAll: () => {
    /** @type {Record<string, string>} */
    const result = {};
    jar.forEach((value, name) => {
      result[name] = converter.read ? converter.read(value, name) : value;
    });
    return result;
  },
  set: (name, value) => {
    const finalValue = converter.write ? converter.write(value, name) : value;
    jar.set(name, finalValue);
    return finalValue;
  },
  remove: (name) => {
    jar.delete(name);
  },
  withConverter: (newConverter) => createNodeCookieService(jar, newConverter),
});

export default createNodeCookieService;
