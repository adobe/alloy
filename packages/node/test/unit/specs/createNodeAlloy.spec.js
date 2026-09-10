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

import { describe, it, expect, vi, afterEach } from "vitest";
import { consent } from "@adobe/alloy-core";
import createNodeAlloy from "../../../src/createNodeAlloy.js";

// A fake edgeCredentials, sufficient to satisfy configure()'s requirement
// — these tests mock fetch entirely, so no real IMS auth ever happens.
const edgeCredentials = {
  clientId: "test-client-id",
  clientSecret: "test-client-secret",
  scopes: ["openid"],
};

const config = {
  orgId: "TEST_ORG@AdobeOrg",
  datastreamId: "test-datastream-id",
  edgeCredentials,
};

const COMMAND_METHOD_NAMES = [
  "setDebug",
  "sendEvent",
  "applyResponse",
  "getIdentity",
  "appendIdentityToUrl",
  "getLibraryInfo",
  "setConsent",
];

const fakeEdgeNetworkResponse = () =>
  new Response(JSON.stringify({ requestId: "test-request-id", handle: [] }), {
    status: 200,
  });

// sendEvent() now fetches an IMS token before hitting the Server API — this
// stub answers both, returning a fresh Response each call (mockResolvedValue
// would hand back the same already-consumed body on the second call).
const createFetchMock = () =>
  vi.fn(async (url) => {
    if (url.includes("/ims/token/v3")) {
      return new Response(
        JSON.stringify({
          access_token: "the-access-token",
          token_type: "bearer",
          expires_in: 86399,
        }),
        { status: 200 },
      );
    }
    return fakeEdgeNetworkResponse();
  });

const imsCalls = (fetchMock) =>
  fetchMock.mock.calls.filter(([url]) => url.includes("/ims/token/v3"));

// edgeCredentials makes sendEvent()'s interact request eligible for the
// Server API (v2), which uses a singular `event` key instead of v1's
// `events` array — see toServerApiPayloadJSON in
// injectSendEdgeNetworkRequest.js.
const lastEventSent = (fetchMock) => {
  const interactCalls = fetchMock.mock.calls.filter(([url]) =>
    url.includes("/interact"),
  );
  const [, requestInit] = interactCalls.at(-1);
  return JSON.parse(requestInit.body).event;
};

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

  // Regression test for a real leak: passing a stateful cookie override to
  // createNodeAlloy() and then calling forRequest() without a per-request
  // override used to silently reuse that same shared cookie jar for every
  // request — meaning two different visitors that both omit a request-level
  // override would resolve to the same identity. cookie/storage must always
  // get a fresh default instead unless a request explicitly overrides them.
  it("forRequest() does not inherit a stateful cookie override from the top-level platformServices", async () => {
    const sharedCookie = createSpyCookieService();
    const alloy = createNodeAlloy({
      platformServices: { cookie: sharedCookie },
    });
    await alloy.configure(config);
    sharedCookie.get.mockClear();

    // No cookie override passed to forRequest() this time.
    await alloy.forRequest().getLibraryInfo();

    expect(sharedCookie.get).not.toHaveBeenCalled();
  });

  it("forRequest() still falls back to the top-level platformServices for stateless slots like network", async () => {
    const networkService = {
      sendFetchRequest: vi.fn(),
      sendBeaconRequest: vi.fn(),
    };
    const network = vi.fn(() => networkService);
    const alloy = createNodeAlloy({ platformServices: { network } });
    await alloy.configure(config);

    // createNetworkService(logger) is called synchronously as soon as an
    // instance is set up, before any command runs — clear the call made by
    // createNodeAlloy()'s own top-level instance first.
    network.mockClear();
    alloy.forRequest();

    expect(network).toHaveBeenCalled();
  });

  // Regression test: configure() used to capture its options synchronously,
  // before core had validated them, so a forRequest() call after a rejected
  // configure() would proceed anyway with the invalid config instead of
  // throwing.
  it("does not capture the config if configure() rejects, so forRequest() still throws afterward", async () => {
    const alloy = createNodeAlloy();

    await expect(alloy.configure({})).rejects.toThrow();
    expect(() => alloy.forRequest()).toThrow(/configure/);
  });

  describe("Context", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("is always active — attaches implementationDetails even when no components were requested", async () => {
      const fetchMock = createFetchMock();
      vi.stubGlobal("fetch", fetchMock);
      const alloy = createNodeAlloy({
        platformServices: { cookie: createSpyCookieService() },
      });
      await alloy.configure(config);

      await alloy.sendEvent({ xdm: { eventType: "test" } });

      const { xdm } = lastEventSent(fetchMock);
      expect(xdm.implementationDetails).toEqual(
        expect.objectContaining({ environment: "server" }),
      );
    });

    it("forRequest({ request }) forwards the visitor's real headers to the default network service", async () => {
      const fetchMock = createFetchMock();
      vi.stubGlobal("fetch", fetchMock);
      const alloy = createNodeAlloy({
        platformServices: { cookie: createSpyCookieService() },
      });
      await alloy.configure(config);

      const request = alloy.forRequest({
        cookie: createSpyCookieService(),
        request: {
          headers: {
            "user-agent": "Mozilla/5.0",
            referer: "https://example.com/page",
          },
        },
      });
      await request.sendEvent({ xdm: { eventType: "test" } });

      const [, requestInit] = fetchMock.mock.calls.at(-1);
      expect(requestInit.headers).toEqual(
        expect.objectContaining({ "user-agent": "Mozilla/5.0" }),
      );
      const { xdm } = lastEventSent(fetchMock);
      expect(xdm.web).toEqual({
        webPageDetails: { URL: "https://example.com/page" },
      });
    });

    it("forwards Accept-Language in addition to User-Agent", async () => {
      const fetchMock = createFetchMock();
      vi.stubGlobal("fetch", fetchMock);
      const alloy = createNodeAlloy({
        platformServices: { cookie: createSpyCookieService() },
      });
      await alloy.configure(config);

      const request = alloy.forRequest({
        cookie: createSpyCookieService(),
        request: { headers: { "accept-language": "en-US,en;q=0.9" } },
      });
      await request.sendEvent({ xdm: { eventType: "test" } });

      const [, requestInit] = fetchMock.mock.calls.at(-1);
      expect(requestInit.headers).toEqual(
        expect.objectContaining({ "accept-language": "en-US,en;q=0.9" }),
      );
    });

    it("does not leak one request's referer-derived URL into a later request with no referer", async () => {
      const fetchMock = createFetchMock();
      vi.stubGlobal("fetch", fetchMock);
      const alloy = createNodeAlloy({
        platformServices: { cookie: createSpyCookieService() },
      });
      await alloy.configure(config);

      await alloy
        .forRequest({
          cookie: createSpyCookieService(),
          request: { headers: { referer: "https://example.com/page" } },
        })
        .sendEvent({ xdm: { eventType: "with-referer" } });

      await alloy
        .forRequest({ cookie: createSpyCookieService() })
        .sendEvent({ xdm: { eventType: "without-referer" } });

      const { xdm } = lastEventSent(fetchMock);
      expect(xdm.web).toBeUndefined();
    });

    it("attaches implementationDetails and the referer-derived URL to every event sent on one forRequest handle", async () => {
      const fetchMock = createFetchMock();
      vi.stubGlobal("fetch", fetchMock);
      const alloy = createNodeAlloy({
        platformServices: { cookie: createSpyCookieService() },
      });
      await alloy.configure(config);

      const request = alloy.forRequest({
        cookie: createSpyCookieService(),
        request: { headers: { referer: "https://example.com/page" } },
      });
      await request.sendEvent({ xdm: { eventType: "first" } });
      await request.sendEvent({ xdm: { eventType: "second" } });

      const interactCalls = fetchMock.mock.calls.filter(([url]) =>
        url.includes("/interact"),
      );
      interactCalls.slice(-2).forEach(([, requestInit]) => {
        const { xdm } = JSON.parse(requestInit.body).event;
        expect(xdm.implementationDetails).toEqual(
          expect.objectContaining({ environment: "server" }),
        );
        expect(xdm.web).toEqual({
          webPageDetails: { URL: "https://example.com/page" },
        });
      });
    });

    it("lets a caller-supplied xdm.web.webPageDetails.URL win over the referer-derived one", async () => {
      const fetchMock = createFetchMock();
      vi.stubGlobal("fetch", fetchMock);
      const alloy = createNodeAlloy({
        platformServices: { cookie: createSpyCookieService() },
      });
      await alloy.configure(config);

      const request = alloy.forRequest({
        cookie: createSpyCookieService(),
        request: { headers: { referer: "https://referer.example.com/" } },
      });
      await request.sendEvent({
        xdm: {
          eventType: "test",
          web: { webPageDetails: { URL: "https://explicit.example.com/" } },
        },
      });

      const { xdm } = lastEventSent(fetchMock);
      expect(xdm.web).toEqual({
        webPageDetails: { URL: "https://explicit.example.com/" },
      });
    });
  });

  describe("edgeCredentials", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    const edgeCredentials = {
      clientId: "myClientId",
      clientSecret: "myClientSecret",
      scopes: ["openid"],
      imsHost: "ims-na1.adobelogin.com",
    };

    it("authenticates with IMS once, then reuses the cached token across multiple forRequest() calls", async () => {
      const fetchMock = createFetchMock();
      vi.stubGlobal("fetch", fetchMock);
      const alloy = createNodeAlloy();
      await alloy.configure({ ...config, edgeCredentials });

      await alloy
        .forRequest({ cookie: createSpyCookieService() })
        .sendEvent({ xdm: { eventType: "first" } });
      await alloy
        .forRequest({ cookie: createSpyCookieService() })
        .sendEvent({ xdm: { eventType: "second" } });

      expect(imsCalls(fetchMock)).toHaveLength(1);
    });

    it("sends the interact request to the Server API domain with auth headers", async () => {
      const fetchMock = createFetchMock();
      vi.stubGlobal("fetch", fetchMock);
      const alloy = createNodeAlloy();
      await alloy.configure({ ...config, edgeCredentials });

      await alloy
        .forRequest({ cookie: createSpyCookieService() })
        .sendEvent({ xdm: { eventType: "test" } });

      const [url, requestInit] = fetchMock.mock.calls.at(-1);
      expect(url).toContain("https://server.adobedc.net/");
      expect(url).toContain("dataStreamId=test-datastream-id");
      expect(requestInit.headers).toEqual(
        expect.objectContaining({
          Authorization: "Bearer the-access-token",
          "x-api-key": "myClientId",
          "x-gw-ims-org-id": "TEST_ORG@AdobeOrg",
        }),
      );
    });

    it("rejects configure() without edgeCredentials — Node requires it, unlike the browser bundle", async () => {
      const alloy = createNodeAlloy();
      const { edgeCredentials: _unused, ...configWithoutCredentials } = config;

      await expect(alloy.configure(configWithoutCredentials)).rejects.toThrow(
        /edgeCredentials/,
      );
    });

    // Quickstart escape hatch: { clientId: "TEST", clientSecret: "TEST" }
    // satisfies the required-edgeCredentials check but is discarded rather
    // than used, so requests fall back to the unauthenticated v1 API.
    it('accepts { clientId: "TEST", clientSecret: "TEST" } and falls back to v1 instead of authenticating', async () => {
      const fetchMock = createFetchMock();
      vi.stubGlobal("fetch", fetchMock);
      const alloy = createNodeAlloy();

      await expect(
        alloy.configure({
          ...config,
          edgeCredentials: { clientId: "TEST", clientSecret: "TEST" },
        }),
      ).resolves.toBeDefined();
      await alloy
        .forRequest({ cookie: createSpyCookieService() })
        .sendEvent({ xdm: { eventType: "test" } });

      expect(imsCalls(fetchMock)).toHaveLength(0);
      const [url] = fetchMock.mock.calls.at(-1);
      expect(url).toContain("/v1/interact?configId=");
      expect(url).not.toContain("server.adobedc.net");
    });

    // Confirmed against the real API: privacy/set-consent 404s under v2,
    // so it must keep using v1 even when edgeCredentials is configured.
    it("still sends setConsent through v1, not the Server API, even with edgeCredentials configured", async () => {
      const fetchMock = createFetchMock();
      vi.stubGlobal("fetch", fetchMock);
      const alloy = createNodeAlloy({ components: [consent] });
      await alloy.configure({ ...config, edgeCredentials });

      await alloy.forRequest({ cookie: createSpyCookieService() }).setConsent({
        consent: [
          { standard: "Adobe", version: "1.0", value: { general: "in" } },
        ],
      });

      expect(imsCalls(fetchMock)).toHaveLength(0);
      const [url, requestInit] = fetchMock.mock.calls.at(-1);
      expect(url).toContain("/v1/privacy/set-consent?configId=");
      expect(url).not.toContain("server.adobedc.net");
      expect(requestInit.headers.Authorization).toBeUndefined();
    });
  });
});
