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

import type { CookieService } from "@adobe/alloy-core/services/index.js";
import Cookies, { type CookieJar } from "js-cookie";

/**
 * The optional `jar` parameter is the recursion seam for `withConverter` —
 * every converted js-cookie instance must itself satisfy `CookieService`.
 */
const createBrowserCookieService = (
  jar: CookieJar = Cookies,
): CookieService => ({
  get: (name) => jar.get(name),
  getAll: () => jar.get(),
  set: (name, value, options) => jar.set(name, value, options),
  remove: (name, options) => {
    jar.remove(name, options);
  },
  withConverter: (converter) =>
    createBrowserCookieService(jar.withConverter(converter)),
});

export default createBrowserCookieService;
