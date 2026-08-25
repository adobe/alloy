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
import { consent } from "@adobe/alloy-core";
import createNodeAlloy from "../../../src/createNodeAlloy.js";
import createNodeCookieService from "../../../src/services/createNodeCookieService.js";
import createFakeEdgeNetworkFetch from "./helpers/fakeEdgeNetworkFetch.js";

const config = {
  orgId: "TEST_ORG@AdobeOrg",
  datastreamId: "test-datastream-id",
};

const interactCalls = (fetchMock) =>
  fetchMock.mock.calls.filter(([url]) => /\/v1\/interact\b/.test(url));

const setConsentCalls = (fetchMock) =>
  fetchMock.mock.calls.filter(([url]) => /\/privacy\/set-consent\b/.test(url));

const inOption = {
  standard: "Adobe",
  version: "1.0",
  value: { general: "in" },
};
const outOption = {
  standard: "Adobe",
  version: "1.0",
  value: { general: "out" },
};

describe("Consent", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("holds sendEvent while defaultConsent is pending, then sends after opt-in", async () => {
    const fetchMock = createFakeEdgeNetworkFetch();
    vi.stubGlobal("fetch", fetchMock);
    const alloy = createNodeAlloy({ components: [consent] });
    await alloy.configure({ ...config, defaultConsent: "pending" });

    let resolved = false;
    const pending = alloy
      .sendEvent({ xdm: { eventType: "test" } })
      .then((result) => {
        resolved = true;
        return result;
      });
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(resolved).toBe(false);
    expect(interactCalls(fetchMock)).toHaveLength(0);

    await alloy.setConsent({ consent: [inOption] });
    await pending;
    expect(resolved).toBe(true);
    expect(interactCalls(fetchMock)).toHaveLength(1);
  });

  it("opt-out blocks the event: no /v1/interact request fires and sendEvent resolves empty", async () => {
    const fetchMock = createFakeEdgeNetworkFetch();
    vi.stubGlobal("fetch", fetchMock);
    const alloy = createNodeAlloy({ components: [consent] });
    await alloy.configure(config);
    await alloy.setConsent({ consent: [outOption] });

    const result = await alloy.sendEvent({ xdm: { eventType: "test" } });

    expect(result).toEqual({});
    expect(interactCalls(fetchMock)).toHaveLength(0);
  });

  it("revoking consent after an opt-in blocks later events", async () => {
    const fetchMock = createFakeEdgeNetworkFetch();
    vi.stubGlobal("fetch", fetchMock);
    const alloy = createNodeAlloy({ components: [consent] });
    await alloy.configure(config);

    await alloy.setConsent({ consent: [inOption] });
    await alloy.sendEvent({ xdm: { eventType: "while-in" } });
    expect(interactCalls(fetchMock)).toHaveLength(1);

    await alloy.setConsent({ consent: [outOption] });
    const result = await alloy.sendEvent({ xdm: { eventType: "while-out" } });

    expect(result).toEqual({});
    expect(interactCalls(fetchMock)).toHaveLength(1);
  });

  it("defaultConsent: out blocks events until an explicit opt-in", async () => {
    const fetchMock = createFakeEdgeNetworkFetch();
    vi.stubGlobal("fetch", fetchMock);
    const alloy = createNodeAlloy({ components: [consent] });
    await alloy.configure({ ...config, defaultConsent: "out" });

    await alloy.sendEvent({ xdm: { eventType: "before-opt-in" } });
    expect(interactCalls(fetchMock)).toHaveLength(0);

    await alloy.setConsent({ consent: [inOption] });
    await alloy.sendEvent({ xdm: { eventType: "after-opt-in" } });

    expect(interactCalls(fetchMock)).toHaveLength(1);
  });

  it("transmits the consent value to Edge and writes it to the cookie", async () => {
    const fetchMock = createFakeEdgeNetworkFetch();
    vi.stubGlobal("fetch", fetchMock);
    const cookie = createNodeCookieService();
    const alloy = createNodeAlloy({
      components: [consent],
      platformServices: { cookie },
    });
    await alloy.configure(config);

    await alloy.setConsent({ consent: [outOption] });

    const [, requestInit] = setConsentCalls(fetchMock).at(-1);
    expect(JSON.parse(requestInit.body).consent).toEqual([outOption]);
    expect(cookie.get("kndctr_TEST_ORG_AdobeOrg_consent")).toBe("general=out");
  });

  it("forwards an identityMap on setConsent", async () => {
    const fetchMock = createFakeEdgeNetworkFetch();
    vi.stubGlobal("fetch", fetchMock);
    const alloy = createNodeAlloy({ components: [consent] });
    await alloy.configure(config);

    await alloy.setConsent({
      consent: [inOption],
      identityMap: {
        CRMID: [
          { id: "known-customer-id", authenticatedState: "authenticated" },
        ],
      },
    });

    const [, requestInit] = setConsentCalls(fetchMock).at(-1);
    expect(JSON.parse(requestInit.body).identityMap).toEqual({
      CRMID: [{ id: "known-customer-id", authenticatedState: "authenticated" }],
    });
  });

  it("persists consent across two requests sharing a cookie jar, without re-calling setConsent", async () => {
    const fetchMock = createFakeEdgeNetworkFetch();
    vi.stubGlobal("fetch", fetchMock);
    const sharedCookie = createNodeCookieService();
    const alloy = createNodeAlloy({ components: [consent] });
    await alloy.configure({ ...config, defaultConsent: "out" });

    await alloy.forRequest({ cookie: sharedCookie }).setConsent({
      consent: [inOption],
    });

    fetchMock.mockClear();
    await alloy.forRequest({ cookie: sharedCookie }).sendEvent({
      xdm: { eventType: "test" },
    });

    expect(interactCalls(fetchMock)).toHaveLength(1);
  });

  it("clears stored consent when the identity cookie is missing", async () => {
    const fetchMock = createFakeEdgeNetworkFetch();
    vi.stubGlobal("fetch", fetchMock);
    const cookie = createNodeCookieService();
    // A consent cookie with no matching identity cookie shouldn't be trusted
    // — it's tied to an identity this visitor no longer has.
    cookie.set("kndctr_TEST_ORG_AdobeOrg_consent", "general=in");
    const alloy = createNodeAlloy({
      components: [consent],
      platformServices: { cookie },
    });
    await alloy.configure({ ...config, defaultConsent: "out" });

    const result = await alloy.sendEvent({ xdm: { eventType: "test" } });

    expect(result).toEqual({});
    expect(interactCalls(fetchMock)).toHaveLength(0);
    expect(cookie.get("kndctr_TEST_ORG_AdobeOrg_consent")).toBeUndefined();
  });

  it("gates events on the Adobe 2.0 standard's collect.val", async () => {
    const fetchMock = createFakeEdgeNetworkFetch();
    vi.stubGlobal("fetch", fetchMock);
    const alloy = createNodeAlloy({ components: [consent] });
    await alloy.configure(config);

    await alloy.setConsent({
      consent: [
        { standard: "Adobe", version: "2.0", value: { collect: { val: "n" } } },
      ],
    });
    const declined = await alloy.sendEvent({ xdm: { eventType: "test" } });
    expect(declined).toEqual({});
    expect(interactCalls(fetchMock)).toHaveLength(0);

    await alloy.setConsent({
      consent: [
        { standard: "Adobe", version: "2.0", value: { collect: { val: "y" } } },
      ],
    });
    await alloy.sendEvent({ xdm: { eventType: "test" } });
    expect(interactCalls(fetchMock)).toHaveLength(1);
  });

  it("rejects setConsent with invalid options instead of resolving silently", async () => {
    const alloy = createNodeAlloy({ components: [consent] });
    await alloy.configure(config);

    await expect(alloy.setConsent({})).rejects.toThrow();
  });

  it("rejects setConsent when Edge responds with a 4xx instead of resolving silently", async () => {
    const fetchMock = createFakeEdgeNetworkFetch({ setConsentStatus: 400 });
    vi.stubGlobal("fetch", fetchMock);
    const alloy = createNodeAlloy({ components: [consent] });
    await alloy.configure(config);

    await expect(alloy.setConsent({ consent: [inOption] })).rejects.toThrow();
  });

  it("still resolves getIdentity after a failed setConsent call", async () => {
    const fetchMock = createFakeEdgeNetworkFetch({ setConsentStatus: 400 });
    vi.stubGlobal("fetch", fetchMock);
    const alloy = createNodeAlloy({ components: [consent] });
    await alloy.configure(config);

    await alloy.setConsent({ consent: [inOption] }).catch(() => {});

    const identity = await alloy.getIdentity();
    expect(identity.identity.ECID).toBeDefined();
  });

  it("holds getIdentity while consent is pending, then resolves after opt-in", async () => {
    const fetchMock = createFakeEdgeNetworkFetch();
    vi.stubGlobal("fetch", fetchMock);
    const alloy = createNodeAlloy({ components: [consent] });
    await alloy.configure({ ...config, defaultConsent: "pending" });

    let resolved = false;
    const pending = alloy.getIdentity().then((result) => {
      resolved = true;
      return result;
    });
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(resolved).toBe(false);

    await alloy.setConsent({ consent: [inOption] });
    const identity = await pending;

    expect(resolved).toBe(true);
    expect(identity.identity.ECID).toBeDefined();
  });

  it("resolves appendIdentityToUrl with the unchanged URL while consent is pending, instead of hanging", async () => {
    const fetchMock = createFakeEdgeNetworkFetch();
    vi.stubGlobal("fetch", fetchMock);
    const alloy = createNodeAlloy({ components: [consent] });
    await alloy.configure({ ...config, defaultConsent: "pending" });

    const result = await alloy.appendIdentityToUrl({
      url: "https://example.com/?a=b",
    });

    expect(result).toEqual({ url: "https://example.com/?a=b" });
    expect(interactCalls(fetchMock)).toHaveLength(0);
  });

  it("dedupes duplicate identical setConsent calls to a single /privacy/set-consent request", async () => {
    const fetchMock = createFakeEdgeNetworkFetch();
    vi.stubGlobal("fetch", fetchMock);
    const alloy = createNodeAlloy({ components: [consent] });
    await alloy.configure(config);

    await alloy.setConsent({ consent: [inOption] });
    await alloy.setConsent({ consent: [inOption] });
    await alloy.setConsent({ consent: [inOption] });

    expect(setConsentCalls(fetchMock)).toHaveLength(1);
  });
});
