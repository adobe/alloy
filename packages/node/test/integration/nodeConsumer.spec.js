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
import { randomUUID } from "node:crypto";
import { describe, it, expect } from "vitest";
import * as core from "@adobe/alloy-core";
import * as coreServices from "@adobe/alloy-core/services";
import * as node from "../../src/index.js";
import createNodeCookieService from "../../src/services/createNodeCookieService.js";

// @adobe/alloy-node requires edgeCredentials — there's no more
// unauthenticated fallback to test against, so this whole suite needs a
// real OAuth Server-to-Server credential AND a real datastream under that
// same org (Edge Network rejects a datastream that belongs to a different
// org than the token does) — no fallback datastream, since nobody could
// reach one that belongs to an org they don't have credentials for anyway.
// Run with, e.g.:
//   node --env-file=.env ./node_modules/.bin/vitest run --project node-integration
// In CI, these env vars are populated from repo secrets (see
// .github/workflows/quality-checks.yml) — skips (not fails) when they're
// absent, e.g. on a fork's pull_request run, where secrets aren't exposed.
const { CLIENT_ID, CLIENT_SECRET, SCOPES, IMS_ORG_ID, DATASTREAM_ID } =
  process.env;
const hasEdgeCredentials = !!(
  CLIENT_ID &&
  CLIENT_SECRET &&
  SCOPES &&
  IMS_ORG_ID &&
  DATASTREAM_ID
);

const config = {
  orgId: IMS_ORG_ID,
  datastreamId: DATASTREAM_ID,
  edgeDomain: "edge.adobedc.net",
  edgeBasePath: "ee",
  thirdPartyCookiesEnabled: false,
  debugEnabled: false,
  edgeCredentials: {
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    scopes: SCOPES ? SCOPES.split(",") : [],
  },
};

// The Server API requires an explicit primary identity per event (no
// browser cookie to resolve one from) — unique per call so identity
// continuity tests aren't accidentally sharing this instead of the cookie
// jar they're actually testing.
const identityMap = () => ({
  Email: [{ id: `${randomUUID()}@nodeConsumer.test`, primary: true }],
});

describe.skipIf(!hasEdgeCredentials)("Node consumer integration", () => {
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

  it("rejects configure() without edgeCredentials", async () => {
    const alloy = node.createInstance();
    const { edgeCredentials, ...configWithoutCredentials } = config;
    await expect(alloy.configure(configWithoutCredentials)).rejects.toThrow(
      /edgeCredentials/,
    );
  });

  it('rejects configure() with defaultConsent: "pending"', async () => {
    const alloy = node.createInstance();
    await expect(
      alloy.configure({ ...config, defaultConsent: "pending" }),
    ).rejects.toThrow(/pending/);
  });

  // Each createInstance() call gets its own orgId/datastreamId uniqueness
  // scope (see createNodeAlloy.js), so separate tests configuring the same
  // real org/datastream on separate instances don't collide.
  it("configures an instance and sends an authenticated event via the Server API (v2)", async () => {
    const alloy = node.createInstance();
    await expect(alloy.configure(config)).resolves.toBeDefined();

    const result = await alloy.sendEvent({
      xdm: { eventType: "test.nodeConsumer", identityMap: identityMap() },
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
      xdm: { eventType: "test.nodeConsumer", identityMap: identityMap() },
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
      xdm: { eventType: "test.nodeConsumer", identityMap: identityMap() },
      decisionScopes: ["test-nodeConsumer-scope"],
    });

    expect(Array.isArray(result.propositions)).toBe(true);
  });

  // Proves Consent is real, wired-up core component (not just a stub): the
  // real /privacy/set-consent round trip succeeds and writes a real consent
  // cookie to whatever cookie service the caller supplies — the same
  // pattern proven for identity above, now for consent state. setConsent
  // itself always goes through v1 (see injectSendEdgeNetworkRequest.js),
  // so this doesn't need a primary identity the way sendEvent() does.
  it("setConsent() writes a real consent cookie to a request-scoped cookie service", async () => {
    const alloy = node.createInstance();
    await alloy.configure(config);

    const cookie = createNodeCookieService();
    const request = alloy.forRequest({ cookie });

    await request.setConsent({
      consent: [
        { standard: "Adobe", version: "1.0", value: { general: "in" } },
      ],
    });

    const cookieNames = Object.keys(cookie.getAll());
    expect(cookieNames.some((name) => name.endsWith("_consent"))).toBe(true);
  });

  // These consent tests pass `decisionScopes` and check for `propositions`
  // in the result as a real, observable signal that the request actually
  // reached Edge Network — a plain sendEvent() resolves to `{}` whether or
  // not consent blocked it, so it can't tell the two cases apart on its own.

  it("a real opt-out setConsent blocks a subsequent sendEvent", async () => {
    const alloy = node.createInstance();
    await alloy.configure(config);

    await alloy.setConsent({
      consent: [
        { standard: "Adobe", version: "1.0", value: { general: "out" } },
      ],
    });
    const result = await alloy.sendEvent({
      xdm: { eventType: "test.nodeConsumer", identityMap: identityMap() },
      decisionScopes: ["test-nodeConsumer-scope"],
    });

    expect(result).toEqual({});
  });

  it("consent persists across two forRequest() calls sharing a cookie jar, without a second setConsent", async () => {
    const sharedCookie = createNodeCookieService();
    const alloy = node.createInstance();
    await alloy.configure({ ...config, defaultConsent: "out" });

    await alloy.forRequest({ cookie: sharedCookie }).setConsent({
      consent: [
        { standard: "Adobe", version: "1.0", value: { general: "in" } },
      ],
    });

    const result = await alloy.forRequest({ cookie: sharedCookie }).sendEvent({
      xdm: { eventType: "test.nodeConsumer", identityMap: identityMap() },
      decisionScopes: ["test-nodeConsumer-scope"],
    });

    expect(Array.isArray(result.propositions)).toBe(true);
  });

  it("the real Edge Network interprets the Adobe 2.0 standard's collect.val the same way our code assumes", async () => {
    const alloy = node.createInstance();
    await alloy.configure(config);

    await alloy.setConsent({
      consent: [
        { standard: "Adobe", version: "2.0", value: { collect: { val: "n" } } },
      ],
    });
    const declined = await alloy.sendEvent({
      xdm: { eventType: "test.nodeConsumer", identityMap: identityMap() },
      decisionScopes: ["test-nodeConsumer-scope"],
    });
    expect(declined).toEqual({});

    await alloy.setConsent({
      consent: [
        { standard: "Adobe", version: "2.0", value: { collect: { val: "y" } } },
      ],
    });
    const allowed = await alloy.sendEvent({
      xdm: { eventType: "test.nodeConsumer", identityMap: identityMap() },
      decisionScopes: ["test-nodeConsumer-scope"],
    });
    expect(Array.isArray(allowed.propositions)).toBe(true);
  });

  // Proves the Context component's request-forwarding actually reaches a
  // real Edge Network round trip without erroring — the forwarded
  // User-Agent/Accept-Language headers and the derived web.webPageDetails.URL
  // are exercised by the real request pipeline, not just mocked in unit
  // tests. There's no way to inspect what Edge Network received/parsed from
  // here, so this only proves the plumbing doesn't break the request.
  it("forRequest({ request }) sends a real event without error", async () => {
    const alloy = node.createInstance();
    await alloy.configure(config);

    const request = alloy.forRequest({
      cookie: createNodeCookieService(),
      request: {
        headers: {
          "user-agent": "Mozilla/5.0 (nodeConsumer integration test)",
          "accept-language": "en-US",
          referer: "https://example.com/sample-page",
        },
      },
    });

    await expect(
      request.sendEvent({
        xdm: { eventType: "test.nodeConsumer", identityMap: identityMap() },
      }),
    ).resolves.toBeDefined();
  });

  it("appendIdentityToUrl() appends a real ECID query param to a real URL", async () => {
    const alloy = node.createInstance();
    await alloy.configure(config);

    const request = alloy.forRequest({ cookie: createNodeCookieService() });
    const result = await request.appendIdentityToUrl({
      url: "https://example.com/?a=b",
    });

    expect(result.url).toMatch(/^https:\/\/example\.com\/\?a=b/);
    expect(result.url).not.toBe("https://example.com/?a=b");
  });
});
