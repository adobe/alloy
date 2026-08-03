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

// These tests exercise createNodeAlloy's own wiring (method binding,
// forRequest's guard and platformServices merging) against the real
// @adobe/alloy-core, but never call a command that reaches the network
// (configure and getLibraryInfo don't), so they run fully offline —
// complementing, not duplicating, the real-network coverage in
// packages/node/test/integration/nodeConsumer.spec.js.

import { describe, it, expect, vi } from "vitest";
import createNodeAlloy from "../../../src/createNodeAlloy.js";

const config = {
  orgId: "TEST_ORG@AdobeOrg",
  datastreamId: "test-datastream-id",
};

const COMMAND_METHOD_NAMES = [
  "setDebug",
  "sendEvent",
  "applyResponse",
  "getIdentity",
  "appendIdentityToUrl",
  "getLibraryInfo",
];

const createSpyCookieService = () => {
  const jar = new Map();
  return {
    get: vi.fn((name) => jar.get(name)),
    getAll: vi.fn(() => Object.fromEntries(jar)),
    set: vi.fn((name, value) => {
      jar.set(name, value);
      return value;
    }),
    remove: vi.fn((name) => jar.delete(name)),
    withConverter: vi.fn(),
  };
};

describe("createNodeAlloy", () => {
  it("exposes configure, forRequest, and every command method", () => {
    const alloy = createNodeAlloy();
    [...COMMAND_METHOD_NAMES, "configure", "forRequest"].forEach((method) => {
      expect(alloy[method]).toBeTypeOf("function");
    });
  });

  it("throws when forRequest() is called before configure()", () => {
    const alloy = createNodeAlloy();
    expect(() => alloy.forRequest()).toThrow(/configure/);
  });

  it("reads cookies from the platformServices override passed to createNodeAlloy", async () => {
    const cookie = createSpyCookieService();
    const alloy = createNodeAlloy({ platformServices: { cookie } });

    await alloy.configure(config);

    // Identity reads the existing kndctr cookie (if any) as part of
    // configure(), with no network call involved.
    expect(cookie.get).toHaveBeenCalled();
  });

  it("forRequest() returns a handle with every command method except configure", async () => {
    const alloy = createNodeAlloy({
      platformServices: { cookie: createSpyCookieService() },
    });
    await alloy.configure(config);

    const request = alloy.forRequest();

    COMMAND_METHOD_NAMES.forEach((method) => {
      expect(request[method]).toBeTypeOf("function");
    });
    expect(request.configure).toBeUndefined();
    expect(request.forRequest).toBeUndefined();
  });

  it("forRequest() reads cookies from its own request-scoped override instead of the top-level one", async () => {
    const topLevelCookie = createSpyCookieService();
    const requestCookie = createSpyCookieService();
    const alloy = createNodeAlloy({
      platformServices: { cookie: topLevelCookie },
    });
    await alloy.configure(config);
    topLevelCookie.get.mockClear();

    const request = alloy.forRequest({ cookie: requestCookie });
    // getLibraryInfo makes no network call; awaiting it just gives the
    // request-scoped configure() (kicked off inside forRequest) a chance
    // to run first, since every command waits on that instance's own
    // configure() to resolve.
    await request.getLibraryInfo();

    expect(requestCookie.get).toHaveBeenCalled();
    expect(topLevelCookie.get).not.toHaveBeenCalled();
  });

  it("forRequest() falls back to the top-level platformServices for anything it doesn't override", async () => {
    const topLevelCookie = createSpyCookieService();
    const alloy = createNodeAlloy({
      platformServices: { cookie: topLevelCookie },
    });
    await alloy.configure(config);
    topLevelCookie.get.mockClear();

    // No cookie override passed to forRequest() this time.
    await alloy.forRequest().getLibraryInfo();

    expect(topLevelCookie.get).toHaveBeenCalled();
  });
});
