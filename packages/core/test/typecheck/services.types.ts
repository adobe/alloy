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

// Compile-time tests for the service contracts. Checked by
// `pnpm --filter @adobe/alloy-core run typecheck`; never executed.

/* eslint-disable import/extensions -- `.js` specifiers resolve to `.ts` sources, as in src */
import { expectTypeOf } from "vitest";
import { Services } from "../../src/services/index.js";
import type {
  CookieAttributes,
  CookieConverter,
  CookieService,
  GlobalsService,
  LegacyService,
  NamespacedStorage,
  NetworkResponse,
  NetworkService,
  PlatformServices,
  RuntimeService,
  SendBeaconRequest,
  SendFetchRequest,
  SendFetchRequestOptions,
  Storage,
  StorageService,
  WindowContext,
} from "../../src/services/index.js";

expectTypeOf(Services).toEqualTypeOf<Record<never, never>>();

const response: NetworkResponse = {
  statusCode: 200,
  body: "",
  getHeader: () => null,
};
expectTypeOf(response.sentWithBeacon).toEqualTypeOf<boolean | undefined>();

const fetchOptions: SendFetchRequestOptions = {};
expectTypeOf(fetchOptions.keepalive).toEqualTypeOf<boolean | undefined>();

const sendFetchRequest: SendFetchRequest = async () => response;
const sendBeaconRequest: SendBeaconRequest = async () => response;
const network: NetworkService = { sendFetchRequest, sendBeaconRequest };
expectTypeOf(network.sendFetchRequest).parameters.toEqualTypeOf<
  [string, string, Record<string, string>?, SendFetchRequestOptions?]
>();

const storage: Storage = {
  getItem: async () => null,
  setItem: async () => true,
  removeItem: async () => true,
  clear: async () => true,
};
const namespaced: NamespacedStorage = { session: storage, persistent: storage };
const storageService: StorageService = {
  createNamespacedStorage: () => namespaced,
};

const cookieAttributes: CookieAttributes = {};
expectTypeOf(cookieAttributes).toEqualTypeOf<{
  domain?: string;
  path?: string;
  expires?: Date | number;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
}>();
// @ts-expect-error sameSite only accepts the three cookie values.
const badSameSite: CookieAttributes = { sameSite: "loose" };
const converter: CookieConverter = {};

declare const cookie: CookieService;
expectTypeOf(cookie.get("x")).toEqualTypeOf<string | undefined>();
expectTypeOf(cookie.withConverter(converter)).toEqualTypeOf<CookieService>();

declare const runtime: RuntimeService;
const timer = runtime.setTimeout(() => {}, 10);
expectTypeOf(timer).toEqualTypeOf<ReturnType<typeof setTimeout>>();
runtime.clearTimeout(timer);
runtime.clearTimeout(undefined);
// @ts-expect-error the handler must be a function.
runtime.setTimeout("code", 10);

declare const legacy: LegacyService;
expectTypeOf(legacy.getEcidFromVisitor).returns.toEqualTypeOf<
  Promise<string | undefined>
>();

const windowContext: WindowContext = {
  title: "",
  url: "",
  referrer: "",
  height: 0,
  width: 0,
  scrollY: 0,
  scrollX: 0,
};

declare const globals: GlobalsService;
expectTypeOf(globals.getInstanceQueue("alloy")).toEqualTypeOf<unknown[]>();
expectTypeOf(globals.getWindowContext()).toEqualTypeOf<WindowContext>();
expectTypeOf(windowContext).toExtend<WindowContext>();

declare const cookieImpl: CookieService;
declare const runtimeImpl: RuntimeService;
declare const legacyImpl: LegacyService;
const services: PlatformServices = {
  createNetworkService: () => network,
  storage: storageService,
  cookie: cookieImpl,
  runtime: runtimeImpl,
  legacy: legacyImpl,
  globals,
};
expectTypeOf(services).toExtend<PlatformServices>();

const badServices: PlatformServices = {
  ...services,
  // @ts-expect-error storage must be a StorageService.
  storage: storage,
};

export { badSameSite, badServices };
