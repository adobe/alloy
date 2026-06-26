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

// Mirrors of the service typedefs in `packages/core/src/services/types.js`.
// When you add or rename a method on a typedef, update the matching entry
// below. Only presence is checked here — signatures and semantics are
// covered by the sibling behavioral specs.
import { describe, it, expect } from "vitest";
import createBrowserNetworkService from "../../../../src/services/createBrowserNetworkService.js";
import createBrowserStorageService from "../../../../src/services/createBrowserStorageService.js";
import createBrowserCookieService from "../../../../src/services/createBrowserCookieService.js";
import createBrowserRuntimeService from "../../../../src/services/createBrowserRuntimeService.js";
import createBrowserLegacyService from "../../../../src/services/createBrowserLegacyService.js";
import createBrowserGlobalsService from "../../../../src/services/createBrowserGlobalsService.js";

const noopLogger = { info() {}, warn() {}, error() {} };

const expectFunctions = (obj, names) => {
  for (const name of names) {
    expect(typeof obj[name], `expected ${name} to be a function`).toBe(
      "function",
    );
  }
};

describe("Service contracts", () => {
  it("NetworkService implements the typedef", () => {
    const network = createBrowserNetworkService({ logger: noopLogger });
    expectFunctions(network, ["sendFetchRequest", "sendBeaconRequest"]);
  });

  it("StorageService implements the typedef (including nested Storage shape)", () => {
    const storage = createBrowserStorageService();
    expectFunctions(storage, ["createNamespacedStorage"]);
    const namespaced = storage.createNamespacedStorage("contract-test.");
    expect(namespaced).toHaveProperty("session");
    expect(namespaced).toHaveProperty("persistent");
    for (const area of [namespaced.session, namespaced.persistent]) {
      expectFunctions(area, ["getItem", "setItem", "removeItem", "clear"]);
    }
  });

  it("CookieService implements the typedef and withConverter returns a CookieService", () => {
    const cookie = createBrowserCookieService();
    const methods = ["get", "getAll", "set", "remove", "withConverter"];
    expectFunctions(cookie, methods);
    const converted = cookie.withConverter({});
    expectFunctions(converted, methods);
  });

  it("RuntimeService implements the typedef", () => {
    const runtime = createBrowserRuntimeService();
    expectFunctions(runtime, [
      "setTimeout",
      "clearTimeout",
      "atob",
      "btoa",
      "now",
    ]);
    // TextEncoder/TextDecoder are constructors, which also `typeof === "function"`.
    expectFunctions(runtime, ["TextEncoder", "TextDecoder"]);
  });

  it("LegacyService implements the typedef", () => {
    const legacy = createBrowserLegacyService();
    expectFunctions(legacy, ["getEcidFromVisitor", "awaitVisitorOptIn"]);
  });

  it("GlobalsService implements the typedef", () => {
    const globals = createBrowserGlobalsService();
    expectFunctions(globals, [
      "getInstanceNames",
      "getInstanceQueue",
      "getMonitors",
      "getLocationSearch",
      "getLocationHash",
      "getUserAgent",
      "getHostname",
      "getPageLocation",
      "isPageSsl",
      "fireReferrerHideableImage",
      "getWindowContext",
    ]);
  });
});
