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
 * @returns {PlatformServices}
 */
const createBrowserPlatformServices = () => ({
  createNetworkService: (logger) => createBrowserNetworkService({ logger }),
  storage: createBrowserStorageService(),
  cookie: createBrowserCookieService(),
  runtime: createBrowserRuntimeService(),
  legacy: createBrowserLegacyService(),
  globals: createBrowserGlobalsService(),
});

export default createBrowserPlatformServices;
