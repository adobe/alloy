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

import cookieJar from "@adobe/alloy-core/utils/cookieJar.js";

/**
 * Browser implementation of {@link CookieService} backed by `js-cookie` via the
 * shared `cookieJar` utility. Cookies are read from and written to
 * `document.cookie`. The optional `jar` parameter is how `withConverter`
 * recurses — every converted js-cookie instance still needs to satisfy the
 * `CookieService` contract.
 *
 * @param {{ get: Function, set: Function, remove: Function, withConverter: Function }} [jar]
 * @returns {CookieService}
 */
const createBrowserCookieService = (jar = cookieJar) => ({
  get: (name) => jar.get(name),
  set: (name, value, options) => jar.set(name, value, options),
  remove: (name, options) => {
    jar.remove(name, options);
  },
  withConverter: (converter) =>
    createBrowserCookieService(jar.withConverter(converter)),
});

export default createBrowserCookieService;
