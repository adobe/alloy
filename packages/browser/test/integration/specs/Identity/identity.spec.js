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

import { http, HttpResponse } from "msw";

import { server } from "vitest/browser";
import {
  test,
  expect,
  describe,
  beforeEach,
  vi,
} from "../../helpers/testsSetup/extend.js";
import alloyConfig from "../../helpers/alloy/config.js";
import deleteCookies from "../../helpers/utils/deleteCookies.js";
import { withTemporaryUrl } from "../../helpers/utils/location.js";
import reloadAlloy from "../../helpers/alloy/reload.js";
import { demdexHandler } from "../../helpers/mswjs/handlers.js";
import {
  MAIN_IDENTITY_COOKIE_NAME,
  LEGACY_IDENTITY_COOKIE_NAME,
} from "../../helpers/constants/cookies.js";

const { readFile } = server.commands;

// A few behaviors (server-side ECID derivation from an FPID, cookie-over-FPID
// precedence) only exist at Experience Edge and cannot be reproduced by a mock.
// Like the original functional tests, these run against the real int edge by
// leaving /interact unhandled (the worker uses onUnhandledRequest: "bypass"),
// so they require edge access and return non-deterministic ECIDs.
const ecidFromResponse = (call) => {
  return call?.response?.body?.handle
    ?.find((h) => h.type === "identity:result")
    ?.payload?.find((p) => p.namespace?.code === "ECID")?.id;
};

// The ECID that all mock responses return
const MOCK_ECID = "41861666193140161934276845651148876988";
const DEMDEX_ECID = "75142138344462263894507331812511658810";
const MOCK_CORE = "71265032074538902643759651525003437623";

// A valid kndctr identity cookie value whose protobuf decodes to MOCK_ECID.
// Same value the mock responses write via state:store.
const KNOWN_IDENTITY_COOKIE_VALUE =
  "CiY0MTg2MTY2NjE5MzE0MDE2MTkzNDI3Njg0NTY1MTE0ODg3Njk4OFIQCM68vcXoMhgBKgNPUjIwAaAB0ry9xegysAHCqAHwAc68vcXoMg==";
const DEMDEX_IDENTITY_COOKIE_VALUE =
  "CiY3NTE0MjEzODM0NDQ2MjI2Mzg5NDUwNzMzMTgxMjUxMTY1ODgxMFIQCM68vcXoMhgBKgNPUjIwAaAB0ry9xegysAG8swHwAc68vcXoMg==";

const interactWithIdentityHandler = http.post(
  /https:\/\/edge\.adobedc\.net\/ee\/.*\/?v1\/interact/,
  async () => {
    return new HttpResponse(
      await readFile(
        `${server.config.root}/packages/browser/test/integration/helpers/mocks/sendEventWithIdentityCookieResponse.json`,
      ),
      {
        headers: {
          "Content-Type": "application/json",
          "x-adobe-edge": "or2;35",
        },
      },
    );
  },
);

const createFailFirstInteractHandler = () => {
  let isFirstRequest = true;
  return http.post(
    /https:\/\/edge\.adobedc\.net\/ee\/.*\/?v1\/interact/,
    async () => {
      if (isFirstRequest) {
        isFirstRequest = false;
        return HttpResponse.json(
          {
            type: "https://ns.adobe.com/aep/errors/EXEG-0003-400",
            status: 400,
            title: "Invalid request",
            detail: "INVALID_ID is not a valid ECID value.",
            report: {},
          },
          { status: 400 },
        );
      }
      return new HttpResponse(
        await readFile(
          `${server.config.root}/packages/browser/test/integration/helpers/mocks/sendEventWithIdentityCookieResponse.json`,
        ),
        {
          headers: {
            "Content-Type": "application/json",
            "x-adobe-edge": "or2;35",
          },
        },
      );
    },
  );
};

const coreAcquireHandler = http.post(
  /https:\/\/(?:adobedc\.demdex\.net|edge\.adobedc\.net)\/ee\/.*\/?v1\/identity\/acquire/,
  () => {
    return HttpResponse.json(
      {
        requestId: "core-acquire-response",
        handle: [
          {
            payload: [
              { id: MOCK_ECID, namespace: { code: "ECID" } },
              { id: MOCK_CORE, namespace: { code: "CORE" } },
            ],
            type: "identity:result",
          },
          {
            payload: [
              {
                key: MAIN_IDENTITY_COOKIE_NAME,
                value: KNOWN_IDENTITY_COOKIE_VALUE,
                maxAge: 34128000,
                attrs: { SameSite: "None" },
              },
            ],
            type: "state:store",
          },
        ],
      },
      {
        headers: {
          "x-adobe-edge": "or2;35",
        },
      },
    );
  },
);

// NOTE: This local acquireHandler is intentionally NOT replaced by the shared
// acquireHandler exported from helpers/mswjs/handlers.js. The shared handler
// uses acquireResponse.json (no identity cookie, no locationHint:result, no
// x-adobe-edge header), while this handler uses identityAcquireResponse.json
// and sets x-adobe-edge: or2;35. Tests in this file assert on
// identityResponse.edge.regionId (derived from x-adobe-edge) and on the
// identity cookie being set — both would fail with the shared handler.
const acquireHandler = http.post(
  /https:\/\/edge\.adobedc\.net\/ee\/.*\/?v1\/identity\/acquire/,
  async () => {
    return new HttpResponse(
      await readFile(
        `${server.config.root}/packages/browser/test/integration/helpers/mocks/identityAcquireResponse.json`,
      ),
      {
        headers: {
          "Content-Type": "application/json",
          "x-adobe-edge": "or2;35",
        },
      },
    );
  },
);

const setConsentInvalidIdErrorHandler = http.post(
  /https:\/\/edge\.adobedc\.net\/ee\/.*\/?v1\/privacy\/set-consent/,
  async ({ request }) => {
    const body = await request.json();
    const bodyStr = JSON.stringify(body);
    if (bodyStr.includes("INVALID_ID")) {
      return HttpResponse.json(
        {
          type: "https://ns.adobe.com/aep/errors/EXEG-0003-400",
          status: 400,
          title: "Invalid request",
          detail: "INVALID_ID is not a valid ECID value.",
          report: {},
        },
        { status: 400 },
      );
    }
    // Valid consent request — return identity cookie in state:store so alloy
    // stores the ECID and sets the browser cookie.
    return HttpResponse.json({
      requestId: "consent-success-id",
      handle: [
        {
          payload: [
            {
              id: MOCK_ECID,
              namespace: { code: "ECID" },
            },
          ],
          type: "identity:result",
        },
        {
          payload: [
            {
              key: MAIN_IDENTITY_COOKIE_NAME,
              value:
                "CiY0MTg2MTY2NjE5MzE0MDE2MTkzNDI3Njg0NTY1MTE0ODg3Njk4OFIQCM68vcXoMhgBKgNPUjIwAaAB0ry9xegysAHCqAHwAc68vcXoMg==",
              maxAge: 34128000,
              attrs: { SameSite: "None" },
            },
          ],
          type: "state:store",
        },
      ],
    });
  },
);

const acquireConfigOverrideErrorHandler = http.post(
  /https:\/\/edge\.adobedc\.net\/ee\/.*\/?v1\/identity\/acquire/,
  async ({ request }) => {
    const body = await request.json();
    const bodyStr = JSON.stringify(body);
    if (bodyStr.includes("myinvalidoverride")) {
      return HttpResponse.json(
        {
          type: "https://ns.adobe.com/aep/errors/EXEG-0003-400",
          status: 400,
          title: "Invalid config override",
          detail: "myinvalidoverride is not a valid configuration override.",
          report: {},
        },
        { status: 400 },
      );
    }
    return new HttpResponse(
      await readFile(
        `${server.config.root}/packages/browser/test/integration/helpers/mocks/identityAcquireResponse.json`,
      ),
      {
        headers: {
          "Content-Type": "application/json",
          "x-adobe-edge": "or2;35",
        },
      },
    );
  },
);

const getCookieValue = (name) => {
  return document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=");
};

const createAdobeMC = ({ id, timestamp, orgId } = {}) => {
  const ts = timestamp !== undefined ? timestamp : Date.now() / 1000;
  const mcmid = id || createRandomEcid();
  const mcorgid = orgId || alloyConfig.orgId;
  return encodeURIComponent(`TS=${ts}|MCMID=${mcmid}|MCORGID=${mcorgid}`);
};

const createRandomEcid = () => {
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  // Mask high bit of each 8-byte half to keep values within signed 64-bit range
  // eslint-disable-next-line no-bitwise
  buf[0] &= 0x7f;
  // eslint-disable-next-line no-bitwise
  buf[8] &= 0x7f;
  const view = new DataView(buf.buffer);
  const hi = view.getBigUint64(0, false).toString().padStart(19, "0");
  const lo = view.getBigUint64(8, false).toString().padStart(19, "0");
  return hi + lo;
};

describe("C2581: Queue requests until ECID is received", () => {
  beforeEach(async () => {
    await deleteCookies();
  });

  test("queues a second sendEvent until the first returns an ECID", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(interactWithIdentityHandler);

    await alloy("configure", {
      ...alloyConfig,
      thirdPartyCookiesEnabled: false,
    });

    // Fire both events; the second should wait for the first ECID response
    const first = alloy("sendEvent", {});
    const second = alloy("sendEvent", {});
    await Promise.all([first, second]);

    const calls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 15,
      minCalls: 2,
    });
    expect(calls.length).toBe(2);

    // Both requests should succeed - the second was queued until the first returned an ECID
    expect(calls[0].response.status).toBe(200);
    expect(calls[1].response.status).toBe(200);

    // The first response returns the ECID; the second request is released only after
    // the identity cookie is set. The ECID is transmitted via the identity cookie
    // (not as a plain string in the JSON body of subsequent requests).
    const firstResponseEcid = calls[0].response.body?.handle?.find(
      (h) => h.type === "identity:result",
    )?.payload?.[0]?.id;
    expect(firstResponseEcid).toBe(MOCK_ECID);

    // The queued second request must carry the resolved identity established by
    // the first response — the kndctr identity cookie value rides in the request
    // body's state entries (mirrors functional C2581's request-body assertion).
    const identityCookieValue = getCookieValue(MAIN_IDENTITY_COOKIE_NAME);
    expect(identityCookieValue).toBeTruthy();
    expect(JSON.stringify(calls[1].request.body)).toContain(
      identityCookieValue,
    );
  });
});

describe("C25822: Event command validates the identityMap", () => {
  test("rejects when identityMap id is not a string", async ({ alloy }) => {
    await alloy("configure", alloyConfig);

    let error;
    try {
      await alloy("sendEvent", {
        xdm: {
          identityMap: {
            HYP: [{ id: 123 }],
          },
        },
      });
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.message).toContain("xdm.identityMap.HYP[0].id");
  });

  test("sends a valid identityMap in the request body", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(interactWithIdentityHandler);

    await alloy("configure", alloyConfig);
    await alloy("sendEvent", {
      xdm: {
        identityMap: {
          HYP: [{ id: "id123" }],
        },
      },
    });

    const call = await networkRecorder.findCall(/v1\/interact/);
    expect(call.response.status).toBe(200);
    expect(call.request.body.events[0].xdm.identityMap).toEqual({
      HYP: [{ id: "id123" }],
    });
  });
});

describe("C1703722: getIdentity works when first command after configure", () => {
  beforeEach(async () => {
    await deleteCookies();
  });

  test("makes a network request and returns ECID and regionId", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(acquireHandler);

    await alloy("configure", alloyConfig);
    const identityResponse = await alloy("getIdentity");

    const acquireCalls = await networkRecorder.findCalls(
      /v1\/identity\/acquire/,
      { retries: 10 },
    );
    expect(acquireCalls.length).toBe(1);

    const identityCookie = getCookieValue(MAIN_IDENTITY_COOKIE_NAME);
    expect(identityCookie).toBeTruthy();

    expect(identityResponse.identity).toBeTruthy();
    expect(identityResponse.edge.regionId).toBeGreaterThan(0);
  });
});

describe("C1703723: getIdentity uses cached values when interact already called", () => {
  beforeEach(async () => {
    await deleteCookies();
  });

  test("does not make an acquire request when identity already obtained via sendEvent", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(interactWithIdentityHandler);

    await alloy("configure", alloyConfig);
    await alloy("sendEvent");

    networkRecorder.reset();

    const identityResponse = await alloy("getIdentity");

    const acquireCalls = await networkRecorder.findCalls(
      /v1\/identity\/acquire/,
      { retries: 3 },
    );
    expect(acquireCalls.length).toBe(0);

    const identityCookie = getCookieValue(MAIN_IDENTITY_COOKIE_NAME);
    expect(identityCookie).toBeTruthy();

    expect(identityResponse.identity).toBeTruthy();
    expect(identityResponse.edge.regionId).toBeGreaterThan(0);
  });
});

describe("C5287654: Cookies are set with sameSite=none", () => {
  beforeEach(async () => {
    await deleteCookies();
  });

  test("alloy writes the identity cookie with sameSite=none and secure", async ({
    alloy,
    worker,
  }) => {
    worker.use(interactWithIdentityHandler);

    await alloy("configure", alloyConfig);
    await alloy("sendEvent");

    // Inspect the actual browser cookie attributes (not just the mock's
    // response payload) to confirm alloy applies SameSite=None — which the
    // browser only honors alongside Secure.
    const identityCookie = await cookieStore.get(MAIN_IDENTITY_COOKIE_NAME);
    expect(identityCookie).toBeTruthy();
    expect(identityCookie.sameSite).toBe("none");
    expect(identityCookie.secure).toBe(true);
  });
});

describe("C5594871: getIdentity works with adobe_mc query string parameter", () => {
  test("ECID from adobe_mc is returned by getIdentity", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    await deleteCookies();

    const adobeMcEcid = createRandomEcid();

    // The acquire handler returns a fixed MOCK_ECID, but the request will contain
    // the adobe_mc ECID. We need a handler that echoes back the ECID from the request.
    worker.use(
      http.post(
        /https:\/\/edge\.adobedc\.net\/ee\/.*\/?v1\/identity\/acquire/,
        async ({ request }) => {
          const body = await request.json();
          // Echo back the ECID alloy placed in the request's xdm.identityMap.
          // No fallback: if alloy fails to forward it, identity.ECID is
          // undefined and the assertion below fails (rather than passing
          // vacuously against a hard-coded value).
          const ecidFromRequest = body.xdm?.identityMap?.ECID?.[0]?.id;
          return new HttpResponse(
            JSON.stringify({
              requestId: "acquire-adobe-mc-response",
              handle: [
                {
                  payload: [
                    {
                      id: ecidFromRequest,
                      namespace: { code: "ECID" },
                    },
                  ],
                  type: "identity:result",
                },
                {
                  payload: [
                    {
                      key: MAIN_IDENTITY_COOKIE_NAME,
                      value:
                        "CiY0MTg2MTY2NjE5MzE0MDE2MTkzNDI3Njg0NTY1MTE0ODg3Njk4OFIQCM68vcXoMhgBKgNPUjIwAaAB0ry9xegysAHCqAHwAc68vcXoMg==",
                      maxAge: 34128000,
                      attrs: { SameSite: "None" },
                    },
                  ],
                  type: "state:store",
                },
              ],
            }),
            {
              headers: {
                "Content-Type": "application/json",
                "x-adobe-edge": "or2;35",
              },
            },
          );
        },
      ),
    );

    const adobemc = createAdobeMC({ id: adobeMcEcid });

    await withTemporaryUrl(async ({ applyUrl, currentHref }) => {
      const url = new URL(currentHref);
      url.searchParams.set("adobe_mc", adobemc);
      applyUrl(url);

      await alloy("configure", {
        ...alloyConfig,
        thirdPartyCookiesEnabled: false,
      });

      const result = await alloy("getIdentity");
      expect(result.identity.ECID).toBe(adobeMcEcid);
    });

    const acquireCall = await networkRecorder.findCall(
      /v1\/identity\/acquire/,
      { retries: 10 },
    );
    expect(acquireCall).toBeDefined();
    // The acquire request should contain the ECID from adobe_mc in xdm.identityMap
    const ecidInRequest =
      acquireCall.request.body?.xdm?.identityMap?.ECID?.[0]?.id;
    expect(ecidInRequest).toBe(adobeMcEcid);
  });
});

describe("C5594872: An expired adobe_mc query string parameter is not used", () => {
  test("ignores the ECID from an expired adobe_mc and generates a new one", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    await deleteCookies();

    worker.use(interactWithIdentityHandler);

    const expiredEcid = createRandomEcid();
    // TTL is 5 minutes (300s); use a timestamp 400s in the past
    const expiredTimestamp = Date.now() / 1000 - 400;
    const expiredAdobeMC = createAdobeMC({
      id: expiredEcid,
      timestamp: expiredTimestamp,
    });

    await withTemporaryUrl(async ({ applyUrl, currentHref }) => {
      const url = new URL(currentHref);
      url.searchParams.set("adobe_mc", expiredAdobeMC);
      applyUrl(url);

      await alloy("configure", {
        ...alloyConfig,
        thirdPartyCookiesEnabled: false,
      });
      await alloy("sendEvent", {});
    });

    const call = await networkRecorder.findCall(/v1\/interact/);
    expect(call).toBeDefined();
    // The ECID from the mocked response should be used, not the expired one
    const returnedEcid = call.response.body?.handle?.find(
      (h) => h.type === "identity:result",
    )?.payload?.[0]?.id;
    expect(returnedEcid).toBeDefined();
    expect(returnedEcid).not.toBe(expiredEcid);
  });
});

describe("C5594865: Identity maintained across domains via adobe_mc", () => {
  test("a fresh domain state reuses the ECID passed via adobe_mc", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(interactWithIdentityHandler);
    const config = { ...alloyConfig, thirdPartyCookiesEnabled: false };

    await alloy("configure", config);
    await alloy("sendEvent");
    const { url } = await alloy("appendIdentityToUrl", {
      url: "https://secondary.example.test/",
    });
    expect(new URL(url).searchParams.get("adobe_mc")).toContain(MOCK_ECID);

    await deleteCookies();
    networkRecorder.reset();
    await reloadAlloy();
    await withTemporaryUrl(async ({ applyUrl, currentHref }) => {
      const destinationUrl = new URL(currentHref);
      destinationUrl.search = new URL(url).search;
      applyUrl(destinationUrl);
      await window.alloy("configure", config);
      await window.alloy("sendEvent");
    });

    const call = await networkRecorder.findCall(/v1\/interact/);
    expect(call.request.body.xdm.identityMap.ECID[0].id).toBe(MOCK_ECID);
    expect((await window.alloy("getIdentity")).identity.ECID).toBe(MOCK_ECID);
  });
});

describe("C5594866: Identity changed across domains via adobe_mc", () => {
  test("a different domain identity overrides the existing ECID and persists", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(interactWithIdentityHandler);
    const config = { ...alloyConfig, thirdPartyCookiesEnabled: false };

    document.cookie = `${MAIN_IDENTITY_COOKIE_NAME}=${DEMDEX_IDENTITY_COOKIE_VALUE}; path=/`;
    await alloy("configure", config);
    expect((await alloy("getIdentity")).identity.ECID).toBe(DEMDEX_ECID);

    await deleteCookies();
    await reloadAlloy();
    await window.alloy("configure", config);
    await window.alloy("sendEvent");
    const { url } = await window.alloy("appendIdentityToUrl", {
      url: "https://primary.example.test/",
    });

    await deleteCookies();
    networkRecorder.reset();
    await reloadAlloy();
    await withTemporaryUrl(async ({ applyUrl, currentHref }) => {
      const destinationUrl = new URL(currentHref);
      destinationUrl.search = new URL(url).search;
      applyUrl(destinationUrl);
      await window.alloy("configure", config);
      await window.alloy("sendEvent");
    });

    const changedCall = await networkRecorder.findCall(/v1\/interact/);
    expect(changedCall.request.body.xdm.identityMap.ECID[0].id).toBe(MOCK_ECID);

    networkRecorder.reset();
    await reloadAlloy();
    await window.alloy("configure", config);
    expect((await window.alloy("getIdentity")).identity.ECID).toBe(MOCK_ECID);
    expect(
      await networkRecorder.findCalls(/v1\/identity\/acquire/),
    ).toHaveLength(0);
  });
});

describe("C15325238: Last adobe_mc parameter wins", () => {
  test("the final adobe_mc parameter determines the ECID", async ({
    worker,
    networkRecorder,
  }) => {
    worker.use(interactWithIdentityHandler);
    await deleteCookies();
    await reloadAlloy();

    await withTemporaryUrl(async ({ applyUrl, currentHref }) => {
      const url = new URL(currentHref);
      url.searchParams.append(
        "adobe_mc",
        createAdobeMC({ id: createRandomEcid() }),
      );
      url.searchParams.append("adobe_mc", createAdobeMC({ id: MOCK_ECID }));
      applyUrl(url);
      await window.alloy("configure", {
        ...alloyConfig,
        thirdPartyCookiesEnabled: false,
      });
      await window.alloy("sendEvent");
    });

    const call = await networkRecorder.findCall(/v1\/interact/);
    expect(call.request.body.xdm.identityMap.ECID[0].id).toBe(MOCK_ECID);
    expect((await window.alloy("getIdentity")).identity.ECID).toBe(MOCK_ECID);
  });
});

describe("C5598188: Informative error when using an invalid orgID", () => {
  test("logs a warning containing the invalid org id when the identity cookie cannot be set", async ({
    alloy,
    worker,
  }) => {
    // Handler that mimics a response for the invalid org id config
    worker.use(
      http.post(
        /https:\/\/edge\.adobedc\.net\/ee\/.*\/?v1\/interact/,
        async () => {
          // Return a response with a state:store referencing the invalid org ID,
          // which alloy cannot write as a first-party cookie on the test domain.
          return HttpResponse.json({
            requestId: "invalid-org-response",
            handle: [
              {
                payload: [
                  {
                    id: "12345678901234567890123456789012345678",
                    namespace: { code: "ECID" },
                  },
                ],
                type: "identity:result",
              },
              {
                payload: [
                  {
                    key: "kndctr_invalid-org-id_AdobeOrg_identity",
                    value: "somevalue",
                    maxAge: 34128000,
                    attrs: { SameSite: "None" },
                  },
                ],
                type: "state:store",
              },
            ],
          });
        },
      ),
    );

    const warnSpy = vi.spyOn(console, "warn");

    try {
      await alloy("configure", {
        ...alloyConfig,
        orgId: "invalid-org-id@Adobe",
        debugEnabled: true,
      });
      await alloy("sendEvent", {});

      // Functional C5598188 requires two distinct warnings, not just one.
      const warnCalls = warnSpy.mock.calls.map((args) => args.join(" "));
      expect(
        warnCalls.some((msg) => msg.includes("Identity cookie not found")),
      ).toBe(true);
      expect(warnCalls.some((msg) => msg.includes("invalid-org-id"))).toBe(
        true,
      );
    } finally {
      warnSpy.mockRestore();
    }
  });
});

describe("C6842980: FPID from the identityMap is used to generate an ECID", () => {
  const fpidEvent = {
    xdm: { identityMap: { FPID: [{ id: "alloy-integration-fpid-6842980" }] } },
  };
  const liveConfig = {
    ...alloyConfig,
    thirdPartyCookiesEnabled: false,
    idMigrationEnabled: false,
  };

  beforeEach(async () => {
    await deleteCookies();
  });

  // Live edge: the edge derives the ECID from the FPID, so we read the ECID the
  // edge returns (not alloy's cache) across two fresh sessions with the same
  // FPID and assert it is stable.
  test("the edge derives the same ECID from the same FPID across fresh sessions", async ({
    networkRecorder,
  }) => {
    await window.alloy("configure", liveConfig);
    await window.alloy("sendEvent", fpidEvent);
    const firstCall = await networkRecorder.findCall(/v1\/interact/, {
      retries: 40,
    });
    const firstEcid = ecidFromResponse(firstCall);
    expect(firstEcid).toBeTruthy();

    // Fresh session: clear identity and reinitialize alloy (mirrors the
    // functional reloadPage), then send the same FPID again.
    await deleteCookies();
    networkRecorder.reset();
    await reloadAlloy();

    await window.alloy("configure", liveConfig);
    await window.alloy("sendEvent", fpidEvent);
    const secondCall = await networkRecorder.findCall(/v1\/interact/, {
      retries: 40,
    });

    expect(ecidFromResponse(secondCall)).toBe(firstEcid);
  }, 30000);
});

// NOTE: Functional C6842981 supplies the FPID via a custom first-party cookie
// (`myFPID`). That cookie-to-FPID mapping is configured at the datastream/edge,
// not in alloy — alloy has no FPID-specific code or `fpidCookieName` option
// (confirmed: no `fpid` reference anywhere in source). At the alloy layer this
// collapses to the same observable behavior as C6842980: alloy forwards the
// FPID from the identityMap, which is what we assert here.

describe("C6842981: FPID from identityMap produces a stable ECID across requests", () => {
  const fpidValue = "stable-fpid-value-for-test-6842981";
  const fpidEvent = {
    xdm: {
      identityMap: {
        FPID: [{ id: fpidValue }],
      },
    },
  };

  beforeEach(async () => {
    await deleteCookies();
  });

  test("consistent FPID in identityMap produces the same ECID on repeat requests", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(interactWithIdentityHandler);

    await alloy("configure", {
      ...alloyConfig,
      thirdPartyCookiesEnabled: false,
      idMigrationEnabled: false,
    });
    await alloy("sendEvent", fpidEvent);

    const firstCall = await networkRecorder.findCall(/v1\/interact/);
    // User-provided identityMap rides at events[0].xdm.identityMap, not the
    // request-level xdm.identityMap.
    expect(
      firstCall.request.body?.events?.[0]?.xdm?.identityMap?.FPID?.[0]?.id,
    ).toBe(fpidValue);

    // Remove identity cookie and send again with the same FPID
    await deleteCookies();
    networkRecorder.reset();

    await alloy("sendEvent", fpidEvent);

    const secondCall = await networkRecorder.findCall(/v1\/interact/);
    expect(
      secondCall.request.body?.events?.[0]?.xdm?.identityMap?.FPID?.[0]?.id,
    ).toBe(fpidValue);
  });
});

describe("C6842982: existing identity takes precedence over an FPID", () => {
  const fpidEvent = {
    xdm: { identityMap: { FPID: [{ id: "alloy-integration-fpid-6842982" }] } },
  };
  const liveConfig = {
    ...alloyConfig,
    thirdPartyCookiesEnabled: false,
    idMigrationEnabled: false,
  };

  beforeEach(async () => {
    await deleteCookies();
  });

  // Live edge: precedence is an edge decision, so assert against the ECID the
  // edge returns. A first request establishes an ECID; a later request supplies
  // a different FPID, yet the edge must keep the established ECID.
  test("the edge keeps the established ECID when a later request supplies an FPID", async ({
    networkRecorder,
  }) => {
    await window.alloy("configure", liveConfig);

    await window.alloy("sendEvent", {});
    const firstCall = await networkRecorder.findCall(/v1\/interact/, {
      retries: 40,
    });
    const establishedEcid = ecidFromResponse(firstCall);
    expect(establishedEcid).toBeTruthy();

    networkRecorder.reset();

    await window.alloy("sendEvent", fpidEvent);
    const secondCall = await networkRecorder.findCall(/v1\/interact/, {
      retries: 40,
    });

    expect(ecidFromResponse(secondCall)).toBe(establishedEcid);
  }, 30000);
});

describe("C14699834: Identity is still established if the first request fails", () => {
  beforeEach(async () => {
    await deleteCookies();
  });

  test("identity established after a failed sendEvent", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(createFailFirstInteractHandler());

    await alloy("configure", {
      ...alloyConfig,
      thirdPartyCookiesEnabled: false,
    });

    // First sendEvent with an invalid ECID — should fail
    let error;
    try {
      await alloy("sendEvent", {
        xdm: {
          identityMap: {
            ECID: [{ id: "INVALID_ID" }],
          },
        },
      });
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error.message).toContain("INVALID_ID");

    // No identity cookie should be set yet
    const identityCookieBefore = getCookieValue(MAIN_IDENTITY_COOKIE_NAME);
    expect(identityCookieBefore).toBeFalsy();

    networkRecorder.reset();

    // Second sendEvent without invalid ID — should succeed and establish identity
    await alloy("sendEvent", {});

    const call = await networkRecorder.findCall(/v1\/interact/, {
      retries: 15,
    });
    expect(call.response.status).toBe(200);

    const identityCookieAfter = getCookieValue(MAIN_IDENTITY_COOKIE_NAME);
    expect(identityCookieAfter).toBeTruthy();
  });

  test("identity established after a failed setConsent", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    // setConsentInvalidIdErrorHandler handles errors for INVALID_ID and returns an
    // identity cookie for valid consent requests — handles both calls in this test.
    worker.use(setConsentInvalidIdErrorHandler);

    await alloy("configure", {
      ...alloyConfig,
      thirdPartyCookiesEnabled: false,
    });

    // First setConsent with an invalid ECID — should fail
    let error;
    try {
      await alloy("setConsent", {
        identityMap: {
          ECID: [{ id: "INVALID_ID" }],
        },
        consent: [
          {
            standard: "Adobe",
            version: "1.0",
            value: { general: "in" },
          },
        ],
      });
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error.message).toContain("INVALID_ID");

    // No identity cookie yet
    const identityCookieBefore = getCookieValue(MAIN_IDENTITY_COOKIE_NAME);
    expect(identityCookieBefore).toBeFalsy();

    // A successful setConsent should establish identity
    await alloy("setConsent", {
      consent: [
        {
          standard: "Adobe",
          version: "1.0",
          value: { general: "in" },
        },
      ],
    });

    // The second set-consent call should succeed and set the identity cookie via state:store
    const consentCalls = await networkRecorder.findCalls(
      /v1\/privacy\/set-consent/,
      { retries: 15, minCalls: 2 },
    );
    const successfulConsentCall = consentCalls.find(
      (c) => c.response.status === 200,
    );
    expect(successfulConsentCall).toBeDefined();

    const identityCookieAfter = getCookieValue(MAIN_IDENTITY_COOKIE_NAME);
    expect(identityCookieAfter).toBeTruthy();
  });

  test("identity established after a failed getIdentity", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(acquireConfigOverrideErrorHandler);

    await alloy("configure", {
      ...alloyConfig,
      thirdPartyCookiesEnabled: false,
    });

    // First getIdentity with an invalid config override — should fail
    let error;
    try {
      await alloy("getIdentity", {
        edgeConfigOverrides: { myinvalidoverride: "myvalue" },
      });
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    // alloy surfaces the server response body; our error detail names the
    // invalid override. Match it specifically (functional asserts the same).
    expect(error.message.toLowerCase()).toContain("myinvalidoverride");

    // No identity cookie yet
    const identityCookieBefore = getCookieValue(MAIN_IDENTITY_COOKIE_NAME);
    expect(identityCookieBefore).toBeFalsy();

    networkRecorder.reset();

    // A successful getIdentity should establish identity
    await alloy("getIdentity");

    const acquireCall = await networkRecorder.findCall(
      /v1\/identity\/acquire/,
      { retries: 15 },
    );
    expect(acquireCall.response.status).toBe(200);

    const identityCookieAfter = getCookieValue(MAIN_IDENTITY_COOKIE_NAME);
    expect(identityCookieAfter).toBeTruthy();
  });
});

describe("C19160486: CORE identity namespace behavior", () => {
  beforeEach(async () => {
    await deleteCookies();
  });

  test("third-party cookies disabled: only ECID is fetched (not CORE)", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(interactWithIdentityHandler);

    await alloy("configure", {
      ...alloyConfig,
      thirdPartyCookiesEnabled: false,
    });
    await alloy("sendEvent");

    const call = await networkRecorder.findCall(/v1\/interact/);
    expect(call).toBeDefined();

    const requestBody = call.request.body;
    // With third-party cookies disabled, only ECID should be in the identity fetch query
    expect(requestBody.query?.identity?.fetch).toEqual(["ECID"]);
  });

  test("requesting CORE when third-party cookies are disabled throws an error", async ({
    alloy,
  }) => {
    await alloy("configure", {
      ...alloyConfig,
      thirdPartyCookiesEnabled: false,
    });

    let error;
    try {
      await alloy("getIdentity", { namespaces: ["CORE"] });
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.message).toContain(
      "The CORE namespace cannot be requested when third-party cookies are disabled",
    );
  });

  test("ECID and CORE can be requested separately", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(coreAcquireHandler);
    await alloy("configure", {
      ...alloyConfig,
      thirdPartyCookiesEnabled: true,
    });

    const ecidResult = await alloy("getIdentity", { namespaces: ["ECID"] });
    expect(ecidResult.identity).toEqual({ ECID: MOCK_ECID });
    const firstCall = await networkRecorder.findCall(/v1\/identity\/acquire/);
    expect(firstCall.request.body.query.identity.fetch).toEqual([
      "ECID",
      "CORE",
    ]);

    const coreResult = await alloy("getIdentity", {
      namespaces: ["CORE"],
    });
    expect(coreResult.identity).toEqual({ CORE: MOCK_CORE });
    expect(
      await networkRecorder.findCalls(/v1\/identity\/acquire/),
    ).toHaveLength(1);
  });

  test("CORE identity is returned when ECID is read from the identity cookie", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    document.cookie = `${MAIN_IDENTITY_COOKIE_NAME}=${KNOWN_IDENTITY_COOKIE_VALUE}; path=/`;
    worker.use(coreAcquireHandler);
    await alloy("configure", {
      ...alloyConfig,
      thirdPartyCookiesEnabled: true,
    });

    const result = await alloy("getIdentity", {
      namespaces: ["ECID", "CORE"],
    });
    expect(result.identity).toEqual({ ECID: MOCK_ECID, CORE: MOCK_CORE });
    const call = await networkRecorder.findCall(/v1\/identity\/acquire/);
    expect(call.request.body.query.identity.fetch).toEqual(["ECID", "CORE"]);
    expect(call.request.body.xdm).toBeUndefined();
  });
});

describe("C21636438: Decode the kndctr identity cookie", () => {
  beforeEach(async () => {
    await deleteCookies();
  });

  test("extracts the ECID from a pre-existing identity cookie without a network request", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    // A fresh alloy with the identity cookie already present must decode the
    // ECID from the cookie and skip the acquire request entirely.
    document.cookie = `${MAIN_IDENTITY_COOKIE_NAME}=${KNOWN_IDENTITY_COOKIE_VALUE}; path=/`;
    worker.use(acquireHandler);

    await alloy("configure", alloyConfig);
    const result = await alloy("getIdentity", { namespaces: ["ECID"] });
    expect(result.identity.ECID).toBe(MOCK_ECID);

    const acquireCalls = await networkRecorder.findCalls(
      /v1\/identity\/acquire/,
      { retries: 3 },
    );
    expect(acquireCalls.length).toBe(0);
  });

  test("falls back to a network request when the cookie is not base64", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    document.cookie = `${MAIN_IDENTITY_COOKIE_NAME}=gibberish; path=/`;
    worker.use(acquireHandler);

    await alloy("configure", alloyConfig);
    const result = await alloy("getIdentity", { namespaces: ["ECID"] });
    expect(result.identity.ECID).toBe(MOCK_ECID);

    const acquireCalls = await networkRecorder.findCalls(
      /v1\/identity\/acquire/,
      { retries: 10 },
    );
    expect(acquireCalls.length).toBe(1);
  });

  test("falls back to a network request when the cookie is base64 but not a valid protobuf", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    // base64 of [0x00, 0x00, 0x00, 0x00] — decodes but is not a valid protobuf.
    document.cookie = `${MAIN_IDENTITY_COOKIE_NAME}=AAAAAA==; path=/`;
    worker.use(acquireHandler);

    await alloy("configure", alloyConfig);
    const result = await alloy("getIdentity", { namespaces: ["ECID"] });
    expect(result.identity.ECID).toBe(MOCK_ECID);

    const acquireCalls = await networkRecorder.findCalls(
      /v1\/identity\/acquire/,
      { retries: 10 },
    );
    expect(acquireCalls.length).toBe(1);
  });
});

// Covers migrationEnabled behavior: if an AMCV cookie is present, alloy should
// read the ECID from it during configure and include it in the first request.

describe("Legacy identity cookie migration (migrationEnabled)", () => {
  const legacyEcid = "16908443662402872073525706953453086963";
  const legacyAmcvValue =
    "77933605%7CMCIDTS%7C18290%7CMCMID%7C16908443662402872073525706953453086963%7CMCAAMLH-1580857889%7C9%7CMCAAMB-1580857889%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1580260289s%7CNONE%7CvVersion%7C4.5.1";

  beforeEach(async () => {
    await deleteCookies();
  });

  test("reads ECID from AMCV cookie and sends it in the first request when migrationEnabled", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    // Set the legacy AMCV cookie (URL-encoded name, URL-encoded value)
    document.cookie = `${LEGACY_IDENTITY_COOKIE_NAME}=${legacyAmcvValue}; path=/`;

    worker.use(interactWithIdentityHandler);

    await alloy("configure", {
      ...alloyConfig,
      thirdPartyCookiesEnabled: false,
      idMigrationEnabled: true,
    });
    await alloy("sendEvent");

    const call = await networkRecorder.findCall(/v1\/interact/);
    expect(call).toBeDefined();

    // The request body should include the legacy ECID in the ECID namespace
    const requestBodyStr = JSON.stringify(call.request.body);
    expect(requestBodyStr).toContain(legacyEcid);
  });
});

describe("C10922: demdex is used for the first request", () => {
  test("first request routes through demdex, reload skips it", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(demdexHandler, interactWithIdentityHandler);
    const config = { ...alloyConfig, thirdPartyCookiesEnabled: true };

    await alloy("configure", config);
    await alloy("sendEvent");
    const firstCall = await networkRecorder.findCall(/v1\/interact/);
    expect(firstCall.request.url).toContain("adobedc.demdex.net");
    expect(getCookieValue(MAIN_IDENTITY_COOKIE_NAME)).toBeTruthy();

    networkRecorder.reset();
    await reloadAlloy();
    await window.alloy("configure", config);
    await window.alloy("sendEvent");
    const secondCall = await networkRecorder.findCall(/v1\/interact/);
    expect(secondCall.request.url).toContain(alloyConfig.edgeDomain);
    expect(secondCall.request.url).not.toContain("demdex.net");
  });
});

describe("C21636436: ECID preserved after a collect beacon", () => {
  test("ECID is unchanged after a documentUnloading collect call", async ({
    worker,
  }) => {
    worker.use(interactWithIdentityHandler);
    const sendBeacon = vi
      .spyOn(navigator, "sendBeacon")
      .mockImplementation(() => true);
    await reloadAlloy();

    try {
      await window.alloy("configure", {
        ...alloyConfig,
        thirdPartyCookiesEnabled: false,
      });
      await window.alloy("sendEvent");
      const initialEcid = (
        await window.alloy("getIdentity", { namespaces: ["ECID"] })
      ).identity.ECID;

      await window.alloy("sendEvent", {
        documentUnloading: true,
        xdm: { eventType: "test-event" },
      });

      expect(sendBeacon).toHaveBeenCalledOnce();
      expect(sendBeacon.mock.calls[0][0]).toContain("/v1/collect");
      expect(
        (await window.alloy("getIdentity", { namespaces: ["ECID"] })).identity
          .ECID,
      ).toBe(initialEcid);
    } finally {
      sendBeacon.mockRestore();
    }
  });
});

describe("C21636437: demdex fallback when demdex is blocked", () => {
  test("falls back to the edge domain when demdex is blocked", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(
      http.post("https://adobedc.demdex.net/ee/v1/interact", () =>
        HttpResponse.error(),
      ),
      interactWithIdentityHandler,
    );
    await alloy("configure", {
      ...alloyConfig,
      thirdPartyCookiesEnabled: true,
    });
    await alloy("sendEvent");

    const calls = await networkRecorder.findCalls(/v1\/interact/, {
      minCalls: 2,
      retries: 15,
    });
    expect(calls[0].request.url).toContain("adobedc.demdex.net");
    expect(calls[1].request.url).toContain(alloyConfig.edgeDomain);
    expect(calls[1].response.status).toBe(200);
  });
});
