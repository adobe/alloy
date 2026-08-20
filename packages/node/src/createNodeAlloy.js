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

/** @import { NetworkService, StorageService, CookieService, RuntimeService, LegacyService, GlobalsService } from "@adobe/alloy-core/services" */
/** @import { Logger } from "@adobe/alloy-core/core/types.js" */

import {
  createCustomInstance as createCoreCustomInstance,
  createCoreConfigs,
} from "@adobe/alloy-core";
import createNodePlatformServices from "./services/createNodePlatformServices.js";
import * as allRequiredComponents from "./components/requiredComponentCreators.js";

/** @import { NodeRequestLike } from "./services/createNodePlatformServices.js" */

/**
 * @typedef {Object} PlatformServiceOverrides
 * @property {(logger: Logger) => NetworkService} [network]
 * @property {StorageService} [storage]
 * @property {CookieService} [cookie]
 * @property {RuntimeService} [runtime]
 * @property {LegacyService} [legacy]
 * @property {GlobalsService} [globals]
 */

/**
 * @typedef {(commandName: string, options?: Record<string, unknown>) => Promise<any>} ExecuteCommand
 */

// Everything but `configure`: available directly on a top-level instance and
// on every bound handle returned by forRequest() (which is configured for
// you). Kept in sync with core's required components (DataCollector,
// Identity, LibraryInfo) — grows as Node picks up optional components.
const COMMAND_NAMES = [
  "setDebug",
  "sendEvent",
  "applyResponse",
  "getIdentity",
  "appendIdentityToUrl",
  "getLibraryInfo",
  "setConsent",
];

/**
 * @param {ExecuteCommand} executeCommand
 * @param {string[]} commandNames
 * @returns {Record<string, (options?: Record<string, unknown>) => Promise<any>>}
 */
const bindCommandMethods = (executeCommand, commandNames) => {
  /** @type {Record<string, (options?: Record<string, unknown>) => Promise<any>>} */
  const methods = {};
  commandNames.forEach((commandName) => {
    methods[commandName] = (options) => executeCommand(commandName, options);
  });
  return methods;
};

/**
 * Node entrypoint's method-based wrapper around core's string-command
 * dispatcher. Unlike the browser bundle, there's no pre-load stub queue to
 * keep call syntax uniform for, so real methods give better discoverability
 * and typo-safety than `alloy("commandName", options)`.
 *
 * @param {Object} [params]
 * @param {string} [params.name]
 * @param {Array<Object>} [params.monitors]
 * @param {Array<Function>} [params.components]
 * @param {PlatformServiceOverrides} [params.platformServices]
 */
const createNodeAlloy = ({
  name,
  monitors,
  components = [],
  platformServices = {},
} = {}) => {
  // Mirrors packages/browser/src/index.js: components a consumer can't opt
  // out of (currently just Context), prepended to whatever they passed in.
  const allComponents = [
    ...Object.values(allRequiredComponents),
    ...components,
  ];

  const executeCommand = createCoreCustomInstance(
    { name, monitors, components: allComponents },
    () => createNodePlatformServices(platformServices),
    createCoreConfigs(),
  );

  /** @type {Record<string, unknown> | undefined} */
  let capturedConfig;

  /**
   * A handle scoped to a single request: backed by its own fresh underlying
   * instance, reconfigured with the same config this instance was configured
   * with, but with `requestPlatformServices` overrides layered on top of
   * this instance's own platformServices — typically `cookie`, so identity
   * resolves from that request's cookies instead of shared in-memory state.
   * Call `configure()` on this instance before calling `forRequest()`.
   *
   * Building a whole new instance (not just swapping platformServices on a
   * shared one) is load-bearing, not incidental: core's Identity component
   * caches its resolved ECID/namespaces in plain closures once acquired
   * (see createIdentity.js's awaitIdentityPromise and
   * components/Identity/createComponent.js's cached namespaces/edge) —
   * those closures live for as long as the instance they were created in,
   * regardless of which cookie jar is passed in later. Reusing an instance
   * across requests and only swapping `cookie` would silently leak one
   * visitor's identity into another's. Don't "optimize" this into instance
   * reuse without re-deriving that state per request too.
   *
   * `cookie`/`storage` specifically never fall back to this instance's own
   * platformServices, even if it configured one — those two hold per-visitor
   * state, so inheriting a shared, stateful one as a silent default would
   * leak identity across visitors exactly like reusing the instance would.
   * If a request doesn't override them here, it gets a fresh, empty default
   * instead. Only the (stateless) `network`/`runtime`/`legacy`/`globals`
   * slots are safe to inherit as instance-wide defaults.
   *
   * `request` isn't a platform service override — it's this request's real
   * incoming HTTP request (anything with a `headers` object; a raw Node
   * `IncomingMessage`, an Express `req`, or a plain `{ headers }`), used to
   * forward the real visitor's `User-Agent`/`Accept-Language` upstream to
   * Edge Network and to populate `web.webPageDetails.URL` (see
   * components/context.js). Pass it whenever this call is proxying a real
   * visitor's request, so Edge Network's own device/geo parsing has real
   * data instead of whatever Node's own fetch() would send by default.
   *
   * @param {PlatformServiceOverrides & { request?: NodeRequestLike }} [requestOverrides]
   */
  const forRequest = (requestOverrides = {}) => {
    if (!capturedConfig) {
      throw new Error(
        "forRequest() can only be called after configure() has resolved.",
      );
    }
    const { request, ...requestPlatformServices } = requestOverrides;
    const { cookie, storage, ...sharedPlatformServices } = platformServices;
    const requestExecuteCommand = createCoreCustomInstance(
      { name, monitors, components: allComponents },
      () =>
        createNodePlatformServices({
          ...sharedPlatformServices,
          ...requestPlatformServices,
          request,
        }),
      // Fresh validators per request: orgId/datastreamId are being
      // reconfigured with the exact same values on purpose here, once per
      // request, so they must not be checked for uniqueness against every
      // other request this process has ever handled.
      createCoreConfigs(),
    );
    requestExecuteCommand("configure", capturedConfig);
    return bindCommandMethods(requestExecuteCommand, COMMAND_NAMES);
  };

  return {
    ...bindCommandMethods(executeCommand, COMMAND_NAMES),
    /** @param {Record<string, unknown>} options */
    configure(options) {
      // Only capture the config once configure() has actually succeeded —
      // if it rejects (invalid config), capturedConfig must stay unset, so
      // a subsequent forRequest() call still throws instead of silently
      // reconfiguring every request with a config core already rejected.
      return executeCommand("configure", options).then((result) => {
        capturedConfig = options;
        return result;
      });
    },
    forRequest,
  };
};

export default createNodeAlloy;
