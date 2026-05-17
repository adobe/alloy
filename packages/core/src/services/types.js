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
 * Platform-agnostic service contracts consumed by `@adobe/alloy-core`.
 *
 * Each platform package (browser, node, ...) implements these and injects an
 * object that satisfies `PlatformServices` into `createInstance` /
 * `createCustomInstance`. Core code should reach for these services instead of
 * touching `window`, `document`, `localStorage`, `setTimeout`, etc. directly.
 *
 * @file
 */

/**
 * @typedef {Object} NetworkResponse
 * @property {number} statusCode
 * @property {string} body
 * @property {(name: string) => (string | null)} getHeader
 */

/**
 * @typedef {(url: string, body: string) => Promise<NetworkResponse>} SendFetchRequest
 */

/**
 * @typedef {(url: string, body: string) => Promise<NetworkResponse>} SendBeaconRequest
 */

/**
 * Network capability: HTTP requests with optional fire-and-forget semantics.
 *
 * @typedef {Object} NetworkService
 * @property {SendFetchRequest} sendFetchRequest
 *   Promise-based HTTP fetch. Must preserve `credentials: "include"` semantics
 *   in browser environments so cookies are sent.
 * @property {SendBeaconRequest} sendBeaconRequest
 *   Fire-and-forget payload delivery. Adapters may fall back to
 *   `sendFetchRequest` when the underlying transport is unavailable.
 */

/**
 * @typedef {Object} Storage
 * @property {(name: string) => Promise<string | null>} getItem
 * @property {(name: string, value: string) => Promise<boolean>} setItem
 * @property {() => Promise<boolean>} clear
 */

/**
 * @typedef {Object} NamespacedStorage
 * @property {Storage} session
 * @property {Storage} persistent
 */

/**
 * Storage capability: namespaced session and persistent key/value storage.
 * The interface is intentionally async so that non-browser backends (Redis,
 * AsyncStorage, KV stores) can satisfy it. The browser adapter wraps sync
 * `localStorage`/`sessionStorage` calls in resolved promises.
 *
 * @typedef {Object} StorageService
 * @property {(namespace: string) => NamespacedStorage} createNamespacedStorage
 */

/**
 * @typedef {Object} CookieAttributes
 * @property {string} [domain]
 * @property {string} [path]
 * @property {Date | number} [expires]
 * @property {boolean} [secure]
 * @property {("strict" | "lax" | "none")} [sameSite]
 */

/**
 * @typedef {Object} CookieConverter
 * @property {(value: string, name: string) => string} [read]
 * @property {(value: string, name: string) => string} [write]
 */

/**
 * Cookie capability: read/write cookies via whatever mechanism the platform
 * exposes (`document.cookie` in browsers, HTTP headers on a server).
 *
 * @typedef {Object} CookieService
 * @property {(name: string) => (string | undefined)} get
 * @property {(name: string, value: string, options?: CookieAttributes) => (string | undefined)} set
 * @property {(name: string, options?: CookieAttributes) => void} remove
 * @property {(converter: CookieConverter) => CookieService} withConverter
 *   Returns a cookie service with custom (de)serialization. Required by the
 *   Audiences component.
 */

/**
 * Runtime capability: standard APIs (timers, encoding, time) that exist
 * cross-platform but must be injected to keep core import-safe.
 *
 * @typedef {Object} RuntimeService
 * @property {(handler: Function, timeout?: number, ...args: any[]) => any} setTimeout
 * @property {(id: any) => void} clearTimeout
 * @property {(data: string) => string} atob
 * @property {(data: string) => string} btoa
 * @property {typeof TextEncoder} TextEncoder
 * @property {typeof TextDecoder} TextDecoder
 * @property {() => number} now
 *   Epoch-millisecond timestamp (typically `Date.now()`).
 */

/**
 * Legacy capability: integration with browser-only Adobe libraries (Visitor.js
 * for ECID migration, `adobe.optIn` for legacy consent). In non-browser
 * environments this is a no-op service whose methods resolve with `undefined`.
 *
 * @typedef {Object} LegacyService
 * @property {(params: { orgId: string, logger: import('../core/types.js').Logger }) => Promise<string | undefined>} getEcidFromVisitor
 *   Resolves an ECID from the legacy Visitor service, or `undefined` if the
 *   service isn't present.
 * @property {(params: { logger: import('../core/types.js').Logger }) => Promise<void>} awaitVisitorOptIn
 *   Resolves once legacy `adobe.optIn` has approved ECID retrieval. Resolves
 *   immediately when no legacy opt-in object is present.
 */

/**
 * Globals capability: access to bootstrap state and ambient globals that
 * historically lived on `window` (the snippet queue, monitor array, helper
 * data like `location.search`).
 *
 * @typedef {Object} GlobalsService
 * @property {() => string[]} getInstanceNames
 *   Returns the list of SDK instance names registered by the snippet
 *   (`window.__alloyNS` in browsers).
 * @property {(instanceName: string) => any[]} getInstanceQueue
 *   Returns the pre-queued commands for an instance (`window[name].q` in
 *   browsers). Used by the bootstrap path to drain calls made before the
 *   library finished loading.
 * @property {() => import('../core/types.js').AlloyMonitor[]} getMonitors
 *   Returns the platform-provided monitor objects
 *   (`window.__alloyMonitors` in browsers).
 * @property {() => string} getLocationSearch
 *   Returns the current page's location search string (e.g. `?alloy_debug=true`)
 *   used for debug-flag detection. Empty string when not applicable.
 * @property {() => string} getUserAgent
 *   Returns the user-agent string. Empty string when not applicable.
 * @property {() => string} getHostname
 *   Returns the current hostname, used for apex-domain probing.
 */

/**
 * Coarse-grained services injected by a platform package into `@adobe/alloy-core`.
 * Implementations live in `@adobe/alloy` (browser) and future platform
 * packages (`@adobe/alloy-node`, ...).
 *
 * @typedef {Object} PlatformServices
 * @property {NetworkService} network
 * @property {StorageService} storage
 * @property {CookieService} cookie
 * @property {RuntimeService} runtime
 * @property {LegacyService} legacy
 * @property {GlobalsService} globals
 */

export {};
