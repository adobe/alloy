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

import { describe, it, expect, vi, afterEach } from "vitest";
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

  describe("request", () => {
    const fetchMock = vi.fn();

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("exposes the given request as-is, for components (e.g. Context) to read", () => {
      const request = { headers: { referer: "https://example.com/page" } };

      const platformServices = createNodePlatformServices({ request });

      expect(platformServices.request).toBe(request);
    });

    it("is undefined by default", () => {
      const platformServices = createNodePlatformServices();

      expect(platformServices.request).toBeUndefined();
    });

    it("forwards the request's forwardable headers to the default network service", async () => {
      fetchMock.mockResolvedValueOnce(new Response("", { status: 200 }));
      vi.stubGlobal("fetch", fetchMock);
      const request = {
        headers: { "user-agent": "Mozilla/5.0", cookie: "not-forwarded" },
      };

      const platformServices = createNodePlatformServices({ request });
      const network = platformServices.createNetworkService(console);
      await network.sendFetchRequest("https://example.com", "payload");

      expect(fetchMock).toHaveBeenCalledWith(
        "https://example.com",
        expect.objectContaining({
          headers: expect.objectContaining({ "user-agent": "Mozilla/5.0" }),
        }),
      );
    });

    it("forwards headers from a WHATWG Headers instance, e.g. a fetch-standard Request", async () => {
      fetchMock.mockResolvedValueOnce(new Response("", { status: 200 }));
      vi.stubGlobal("fetch", fetchMock);
      const request = {
        headers: new Headers({
          "user-agent": "Mozilla/5.0",
          cookie: "not-forwarded",
        }),
      };

      const platformServices = createNodePlatformServices({ request });
      const network = platformServices.createNetworkService(console);
      await network.sendFetchRequest("https://example.com", "payload");

      expect(fetchMock).toHaveBeenCalledWith(
        "https://example.com",
        expect.objectContaining({
          headers: expect.objectContaining({ "user-agent": "Mozilla/5.0" }),
        }),
      );
    });

    it("does not forward request headers when network is explicitly overridden", () => {
      const network = vi.fn(() => ({ fake: "network" }));
      const request = { headers: { "user-agent": "Mozilla/5.0" } };

      const platformServices = createNodePlatformServices({
        network,
        request,
      });
      platformServices.createNetworkService(console);

      expect(network).toHaveBeenCalledWith(console);
    });
  });
});
