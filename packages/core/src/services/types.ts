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

import type { AlloyMonitor, Logger } from "../core/types.js";
import type { CookieAttributes, CookieConverter } from "../utils/types.js";

export interface NetworkResponse {
  statusCode: number;
  body: string;
  getHeader: (name: string) => string | null;
  /**
   * `true` when the request was handed to `navigator.sendBeacon`. The browser
   * gives no response for these, so `statusCode`, `body`, and `getHeader` are
   * placeholders rather than values from the server.
   */
  sentWithBeacon?: boolean;
}

export interface SendFetchRequestOptions {
  /**
   * Send the request with `keepalive` so the browser finishes it even if the
   * page unloads. Implementations fall back to a regular request if the
   * browser refuses (for example, when in-flight keepalive data on the page
   * would exceed 64 KiB). Ignored where there is no page to unload (Node).
   */
  keepalive?: boolean;
}

export type SendFetchRequest = (
  url: string,
  body: string,
  headers?: Record<string, string>,
  options?: SendFetchRequestOptions,
) => Promise<NetworkResponse>;

export type SendBeaconRequest = (
  url: string,
  body: string,
) => Promise<NetworkResponse>;

export interface NetworkService {
  /**
   * Must send cookies (`credentials: "include"` in browsers).
   */
  sendFetchRequest: SendFetchRequest;
  /**
   * Falls back to `sendFetchRequest` when the underlying transport is unavailable.
   */
  sendBeaconRequest: SendBeaconRequest;
}

/** Asynchronous key-value storage a platform provides (see utils `Storage` for the sync one). */
export interface Storage {
  getItem: (name: string) => Promise<string | null>;
  setItem: (name: string, value: string) => Promise<boolean>;
  removeItem: (name: string) => Promise<boolean>;
  clear: () => Promise<boolean>;
}

export interface NamespacedStorage {
  session: Storage;
  persistent: Storage;
}

export interface StorageService {
  createNamespacedStorage: (namespace: string) => NamespacedStorage;
}

export type { CookieAttributes, CookieConverter } from "../utils/types.js";

export interface CookieService {
  get: (name: string) => string | undefined;
  getAll: () => Record<string, string>;
  set: (
    name: string,
    value: string,
    options?: CookieAttributes,
  ) => string | undefined;
  remove: (name: string, options?: CookieAttributes) => void;
  withConverter: (converter: CookieConverter) => CookieService;
}

export interface RuntimeService {
  setTimeout: (
    handler: (...args: never[]) => void,
    timeout?: number,
    ...args: unknown[]
  ) => ReturnType<typeof setTimeout>;
  clearTimeout: (id: ReturnType<typeof setTimeout> | undefined) => void;
  atob: (data: string) => string;
  btoa: (data: string) => string;
  TextEncoder: typeof TextEncoder;
  TextDecoder: typeof TextDecoder;
  /**
   * Epoch-millisecond timestamp.
   */
  now: () => number;
}

/**
 * Bridge to legacy Adobe libraries (Visitor.js, `adobe.optIn`).
 */
export interface LegacyService {
  getEcidFromVisitor: (params: {
    orgId: string;
    logger: Logger;
  }) => Promise<string | undefined>;
  /**
   * Resolves immediately when no legacy opt-in object is present.
   */
  awaitVisitorOptIn: (params: { logger: Logger }) => Promise<void>;
}

export interface WindowContext {
  title: string;
  url: string;
  referrer: string;
  height: number;
  width: number;
  scrollY: number;
  scrollX: number;
}

export interface GlobalsService {
  getInstanceNames: () => string[];
  getInstanceQueue: (instanceName: string) => unknown[];
  getMonitors: () => AlloyMonitor[];
  getLocationSearch: () => string;
  getLocationHash: () => string;
  getUserAgent: () => string;
  getHostname: () => string;
  getPageLocation: () => { host: string; pathname: string };
  isPageSsl: () => boolean;
  fireReferrerHideableImage: (request: {
    hideReferrer: boolean;
    url: string;
  }) => Promise<void>;
  getWindowContext: () => WindowContext;
}

export interface PlatformServices {
  createNetworkService: (logger: Logger) => NetworkService;
  storage: StorageService;
  cookie: CookieService;
  runtime: RuntimeService;
  legacy: LegacyService;
  globals: GlobalsService;
}
