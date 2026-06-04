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
 * Service contracts a platform package implements and injects into
 * `@adobe/alloy-core`.
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
 * @typedef {Object} NetworkService
 * @property {SendFetchRequest} sendFetchRequest
 *   Must send cookies (`credentials: "include"` in browsers).
 * @property {((url: string, body: Blob) => boolean) | null} sendBeacon
 *   Raw `navigator.sendBeacon` (bound to navigator), or null if unavailable.
 *   The core layer wraps this with fallback and logging.
 */

/**
 * @typedef {Object} Storage
 * @property {(name: string) => Promise<string | null>} getItem
 * @property {(name: string, value: string) => Promise<boolean>} setItem
 * @property {(name: string) => Promise<boolean>} removeItem
 * @property {() => Promise<boolean>} clear
 */

/**
 * @typedef {Object} NamespacedStorage
 * @property {Storage} session
 * @property {Storage} persistent
 */

/**
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
 * @typedef {Object} CookieService
 * @property {(name: string) => (string | undefined)} get
 * @property {() => Record<string, string>} getAll
 * @property {(name: string, value: string, options?: CookieAttributes) => (string | undefined)} set
 * @property {(name: string, options?: CookieAttributes) => void} remove
 * @property {(converter: CookieConverter) => CookieService} withConverter
 */

/**
 * @typedef {Object} RuntimeService
 * @property {(handler: Function, timeout?: number, ...args: any[]) => any} setTimeout
 * @property {(id: any) => void} clearTimeout
 * @property {(data: string) => string} atob
 * @property {(data: string) => string} btoa
 * @property {typeof TextEncoder} TextEncoder
 * @property {typeof TextDecoder} TextDecoder
 * @property {() => number} now
 *   Epoch-millisecond timestamp.
 */

/**
 * Bridge to legacy Adobe libraries (Visitor.js, `adobe.optIn`).
 *
 * @typedef {Object} LegacyService
 * @property {(params: { orgId: string, logger: import('../core/types.js').Logger }) => Promise<string | undefined>} getEcidFromVisitor
 * @property {(params: { logger: import('../core/types.js').Logger }) => Promise<void>} awaitVisitorOptIn
 *   Resolves immediately when no legacy opt-in object is present.
 */

/**
 * @typedef {Object} WindowContext
 * @property {string} title
 * @property {string} url
 * @property {string} referrer
 * @property {number} height
 * @property {number} width
 * @property {number} scrollY
 * @property {number} scrollX
 */

/**
 * @typedef {Object} GlobalsService
 * @property {() => string[]} getInstanceNames
 * @property {(instanceName: string) => any[]} getInstanceQueue
 * @property {() => import('../core/types.js').AlloyMonitor[]} getMonitors
 * @property {() => string} getLocationSearch
 * @property {() => string} getLocationHash
 * @property {() => string} getUserAgent
 * @property {() => string} getHostname
 * @property {() => { host: string, pathname: string }} getPageLocation
 * @property {() => boolean} isPageSsl
 * @property {() => WindowContext} getWindowContext
 */

/**
 * @typedef {Object} PlatformServices
 * @property {NetworkService} network
 * @property {StorageService} storage
 * @property {CookieService} cookie
 * @property {RuntimeService} runtime
 * @property {LegacyService} legacy
 * @property {GlobalsService} globals
 */

export {};
