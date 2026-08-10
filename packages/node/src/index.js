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
import createNodeAlloy from "./createNodeAlloy.js";
import * as allOptionalComponents from "./allOptionalComponents.js";

/**
 * @alpha
 *
 * Creates a custom Node instance, including only the given optional
 * components (e.g. `personalization`). See `createInstance` to get every
 * optional component by default.
 *
 * Returns an object with real methods (`configure`, `sendEvent`,
 * `getIdentity`, ...) rather than the browser bundle's
 * `alloy("commandName", options)` calling convention — there's no pre-load
 * stub queue to keep call syntax uniform for in Node, so methods give
 * better discoverability. This is an early skeleton: most optional
 * components (Consent, Audiences, etc.) are not wired up yet.
 *
 * @param {Object} [options]
 * @param {Array<Function>} [options.components]
 * @param {Object} [options.platformServices] Overrides for one or more of
 * the default Node platform services (network, storage, cookie, runtime,
 * legacy, globals) — e.g. a `cookie` service backed by a real HTTP
 * request/response so identity persists across requests instead of only
 * within a single process. See `createNodePlatformServices` for the shape
 * of each override.
 */
export const createCustomInstance = ({
  platformServices = {},
  components = [],
  ...options
} = {}) =>
  createNodeAlloy({
    ...options,
    components,
    platformServices,
  });

/**
 * @alpha
 *
 * Creates a Node instance with every optional component included.
 *
 * @param {Object} [options]
 * @param {Object} [options.platformServices]
 */
export const createInstance = (options = {}) =>
  createCustomInstance({
    ...options,
    components: Object.values(allOptionalComponents),
  });

export { allOptionalComponents as components };
