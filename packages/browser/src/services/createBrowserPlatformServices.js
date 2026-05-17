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

/** @import { PlatformServices } from "@adobe/alloy-core/services" */

import createBrowserNetworkService from "./createBrowserNetworkService.js";
import createBrowserStorageService from "./createBrowserStorageService.js";
import createBrowserCookieService from "./createBrowserCookieService.js";
import createBrowserRuntimeService from "./createBrowserRuntimeService.js";
import createBrowserLegacyService from "./createBrowserLegacyService.js";
import createBrowserGlobalsService from "./createBrowserGlobalsService.js";

/**
 * Composes the browser-side {@link PlatformServices} bag that gets passed into
 * `@adobe/alloy-core`. A new bag is created per Alloy instance so that
 * per-instance dependencies (like the logger threaded into the network
 * service) stay scoped correctly.
 *
 * @param {{ logger: import('@adobe/alloy-core/core/types.js').Logger }} dependencies
 * @returns {PlatformServices}
 */
const createBrowserPlatformServices = ({ logger }) => ({
  network: createBrowserNetworkService({ logger }),
  storage: createBrowserStorageService(),
  cookie: createBrowserCookieService(),
  runtime: createBrowserRuntimeService(),
  legacy: createBrowserLegacyService(),
  globals: createBrowserGlobalsService(),
});

export default createBrowserPlatformServices;
