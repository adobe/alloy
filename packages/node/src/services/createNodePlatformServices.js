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

/** @import { NetworkService, StorageService, CookieService, RuntimeService, LegacyService, GlobalsService, PlatformServices } from "@adobe/alloy-core/services" */
/** @import { Logger } from "@adobe/alloy-core/core/types.js" */

import createNodeNetworkService from "./createNodeNetworkService.js";
import createNodeStorageService from "./createNodeStorageService.js";
import createNodeCookieService from "./createNodeCookieService.js";
import createNodeRuntimeService from "./createNodeRuntimeService.js";
import createNodeLegacyService from "./createNodeLegacyService.js";
import createNodeGlobalsService from "./createNodeGlobalsService.js";
import pickForwardableHeaders from "./pickForwardableHeaders.js";

/**
 * @typedef {Record<string, string | string[] | undefined> | Headers} NodeRequestHeaders
 * Either a plain headers object (Node's `IncomingMessage.headers`,
 * Express's `req.headers`) or a WHATWG `Headers` instance (fetch-standard
 * `Request.headers`). See `getHeader.js`.
 */

/**
 * @typedef {Object} NodeRequestLike
 * @property {NodeRequestHeaders} [headers]
 */

/**
 * Each override replaces the corresponding default in-memory Node
 * implementation wholesale — e.g. pass a `cookie` service backed by a real
 * HTTP request/response or a database to persist identity across requests.
 *
 * @param {Object} [overrides]
 * @param {(logger: Logger) => NetworkService} [overrides.network]
 * @param {StorageService} [overrides.storage]
 * @param {CookieService} [overrides.cookie]
 * @param {RuntimeService} [overrides.runtime]
 * @param {LegacyService} [overrides.legacy]
 * @param {GlobalsService} [overrides.globals]
 * @param {NodeRequestLike} [overrides.request] The real incoming request
 * Node is proxying an event for, if any — forwarded to Edge Network via
 * `pickForwardableHeaders` (unless `network` is overridden), and exposed
 * as-is on the returned object for the Context component to read.
 * @returns {PlatformServices & { request?: NodeRequestLike }}
 */
const createNodePlatformServices = ({
  network,
  storage,
  cookie,
  runtime,
  legacy,
  globals,
  request,
} = {}) => ({
  createNetworkService: (logger) =>
    network
      ? network(logger)
      : createNodeNetworkService({
          headers: pickForwardableHeaders(request?.headers),
        }),
  storage: storage || createNodeStorageService(),
  cookie: cookie || createNodeCookieService(),
  runtime: runtime || createNodeRuntimeService(),
  legacy: legacy || createNodeLegacyService(),
  globals: globals || createNodeGlobalsService(),
  request,
});

export default createNodePlatformServices;
