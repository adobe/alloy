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

/**
 * Platform-service contract surface. See `./types.js` for the JSDoc typedefs
 * that describe each service. There are no runtime exports today; platform
 * packages provide the concrete implementations.
 *
 * @file
 */

/**
 * @typedef {import("./types.js").NetworkResponse} NetworkResponse
 * @typedef {import("./types.js").NetworkService} NetworkService
 * @typedef {import("./types.js").Storage} Storage
 * @typedef {import("./types.js").NamespacedStorage} NamespacedStorage
 * @typedef {import("./types.js").StorageService} StorageService
 * @typedef {import("./types.js").CookieAttributes} CookieAttributes
 * @typedef {import("./types.js").CookieConverter} CookieConverter
 * @typedef {import("./types.js").CookieService} CookieService
 * @typedef {import("./types.js").RuntimeService} RuntimeService
 * @typedef {import("./types.js").LegacyService} LegacyService
 * @typedef {import("./types.js").GlobalsService} GlobalsService
 * @typedef {import("./types.js").PlatformServices} PlatformServices
 */

export const Services = {};
