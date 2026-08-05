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

// Imports are static so file-load failure is the signal. Dynamic
// `await import()` would be charged against the 5s per-test timeout, which
// Vite's first-run dep bundling can blow past when the full suite runs in
// parallel.
import { describe, it, expect } from "vitest";
import * as core from "@adobe/alloy-core";
import * as coreServices from "@adobe/alloy-core/services";
import * as node from "../../src/index.js";
import createNodeCookieService from "../../src/services/createNodeCookieService.js";

const config = {
  orgId: "5BFE274A5F6980A50A495C08@AdobeOrg",
  datastreamId: "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83",
  edgeDomain: "edge.adobedc.net",
  edgeBasePath: "ee",
  thirdPartyCookiesEnabled: false,
  debugEnabled: false,
};

describe("Node consumer integration", () => {
  it("imports @adobe/alloy-core without throwing", () => {
    expect(core.createCustomInstance).toBeTypeOf("function");
    expect(core.createInstance).toBeTypeOf("function");
    expect(core.createCoreConfigs).toBeTypeOf("function");
  });

  it("imports @adobe/alloy-core/services without throwing", () => {
    expect(coreServices).toBeDefined();
  });

  it("imports @adobe/alloy-node without throwing", () => {
    expect(node.createInstance).toBeTypeOf("function");
    expect(node.createCustomInstance).toBeTypeOf("function");
  });

  it("creates an instance with the expected methods", () => {
    const alloy = node.createInstance();
    [
      "configure",
      "setDebug",
      "sendEvent",
      "applyResponse",
      "getIdentity",
      "appendIdentityToUrl",
      "getLibraryInfo",
      "forRequest",
    ].forEach((method) => {
      expect(alloy[method]).toBeTypeOf("function");
    });
  });

  // Each createInstance() call gets its own orgId/datastreamId uniqueness
  // scope (see createNodeAlloy.js), so separate tests configuring the same
  // real org/datastream on separate instances don't collide.
  it("configures an instance and sends an event", async () => {
    const alloy = node.createInstance();
    await expect(alloy.configure(config)).resolves.toBeDefined();

    const result = await alloy.sendEvent({
      xdm: {
        eventType: "test.nodeConsumer",
        _id: "00000000-0000-0000-0000-000000000000",
      },
    });

    expect(result).toBeDefined();
  });

  // Proves identity cookies get written to whatever cookie service the
  // consumer supplies (e.g. one backed by a real HTTP request/response),
  // rather than only the built-in in-memory default.
  it("writes identity cookies to a custom cookie service", async () => {
    const cookie = createNodeCookieService();
    const alloy = node.createInstance({ platformServices: { cookie } });
    await alloy.configure(config);

    await alloy.sendEvent({
      xdm: {
        eventType: "test.nodeConsumer",
        _id: "00000000-0000-0000-0000-000000000001",
      },
    });

    expect(Object.keys(cookie.getAll())).not.toHaveLength(0);
  });

  it("forRequest() throws before configure() has been called", () => {
    const alloy = node.createInstance();
    expect(() => alloy.forRequest()).toThrow(/configure/);
  });

  // The core scenario forRequest() exists for: a shared, long-lived instance
  // configured once, handling many requests from possibly-different
  // visitors. Two requests that happen to share a cookie service (i.e. the
  // same visitor) should resolve to the same identity, without needing to
  // reconfigure or share any other server-side state between them.
  it("forRequest() resolves the same identity across requests sharing a cookie service", async () => {
    const alloy = node.createInstance();
    await alloy.configure(config);

    const cookie = createNodeCookieService();
    const request1 = alloy.forRequest({ cookie });
    const identity1 = await request1.getIdentity();

    const request2 = alloy.forRequest({ cookie });
    const identity2 = await request2.getIdentity();

    expect(identity1.identity.ECID).toEqual(identity2.identity.ECID);
  });

  // The converse of the test above: two requests that do NOT share a
  // cookie service (i.e. two different visitors) must not leak identity
  // between them. This specifically exercises forRequest()'s real
  // protection against that: it rebuilds the entire underlying instance
  // per call (not just the cookie service) — Identity's own in-memory
  // "have we resolved this visitor's ECID yet" state (createIdentity.js's
  // awaitIdentityPromise, createComponent.js's cached namespaces/edge) is
  // a plain closure that would otherwise persist across calls sharing an
  // instance, regardless of which cookie jar was passed in.
  it("forRequest() resolves independent identities across requests with different cookie services", async () => {
    const alloy = node.createInstance();
    await alloy.configure(config);

    const requestA = alloy.forRequest({ cookie: createNodeCookieService() });
    const identityA = await requestA.getIdentity();

    const requestB = alloy.forRequest({ cookie: createNodeCookieService() });
    const identityB = await requestB.getIdentity();

    expect(identityA.identity.ECID).not.toEqual(identityB.identity.ECID);
  });

  // Regression test for a real leak flagged in review: passing a stateful
  // cookie override at the top level and then calling forRequest() without
  // a per-request override used to silently reuse that same shared cookie
  // jar for every request — meaning two visitors that both omit a
  // request-level override would resolve to the same identity.
  it("forRequest() must not leak identity between visitors via a top-level cookie override", async () => {
    const sharedCookie = createNodeCookieService();
    const alloy = node.createInstance({
      platformServices: { cookie: sharedCookie },
    });
    await alloy.configure(config);

    const visitorA = alloy.forRequest();
    const identityA = await visitorA.getIdentity();

    const visitorB = alloy.forRequest();
    const identityB = await visitorB.getIdentity();

    expect(identityA.identity.ECID).not.toEqual(identityB.identity.ECID);
  });

  // Proves the real request/response round trip for personalization: the
  // query actually reaches the Edge Network with a decisionScope attached,
  // and the response comes back parsed into a `propositions` array — even
  // though this scope has no real activity configured, so it's expected to
  // resolve empty rather than throw or come back malformed.
  it("sendEvent() with decisionScopes returns a propositions array", async () => {
    const alloy = node.createInstance();
    await alloy.configure(config);

    const result = await alloy.sendEvent({
      xdm: { eventType: "test.nodeConsumer" },
      decisionScopes: ["test-nodeConsumer-scope"],
    });

    expect(Array.isArray(result.propositions)).toBe(true);
  });
});
