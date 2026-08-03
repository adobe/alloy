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

import { describe, it, expect } from "vitest";
import createNodePlatformServices from "../../../../src/services/createNodePlatformServices.js";

describe("createNodePlatformServices", () => {
  it("defaults every service when no overrides are given", () => {
    const platformServices = createNodePlatformServices();

    expect(platformServices.createNetworkService).toBeTypeOf("function");
    expect(platformServices.storage.createNamespacedStorage).toBeTypeOf(
      "function",
    );
    expect(platformServices.cookie.get).toBeTypeOf("function");
    expect(platformServices.runtime.now).toBeTypeOf("function");
    expect(platformServices.legacy.getEcidFromVisitor).toBeTypeOf("function");
    expect(platformServices.globals.isPageSsl()).toBe(true);
  });

  it("uses a given cookie/storage/runtime/legacy/globals override wholesale instead of the default", () => {
    const overrides = {
      cookie: { fake: "cookie" },
      storage: { fake: "storage" },
      runtime: { fake: "runtime" },
      legacy: { fake: "legacy" },
      globals: { fake: "globals" },
    };

    const platformServices = createNodePlatformServices(overrides);

    expect(platformServices.cookie).toBe(overrides.cookie);
    expect(platformServices.storage).toBe(overrides.storage);
    expect(platformServices.runtime).toBe(overrides.runtime);
    expect(platformServices.legacy).toBe(overrides.legacy);
    expect(platformServices.globals).toBe(overrides.globals);
  });

  it("calls a given network override with the logger instead of the default", () => {
    const fakeNetworkService = { fake: "network" };
    const network = (logger) => {
      expect(logger).toBe("the-logger");
      return fakeNetworkService;
    };

    const platformServices = createNodePlatformServices({ network });

    expect(platformServices.createNetworkService("the-logger")).toBe(
      fakeNetworkService,
    );
  });
});
