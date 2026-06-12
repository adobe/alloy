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
import {
  test,
  expect,
  describe,
  beforeEach,
} from "../../helpers/testsSetup/extend.js";
import { http, HttpResponse } from "msw";
import alloyConfig from "../../helpers/alloy/config.js";
import setupAlloy from "../../helpers/alloy/setup.js";
import setupBaseCode from "../../helpers/alloy/setupBaseCode.js";
import cleanAlloy from "../../helpers/alloy/clean.js";
import {
  LEGACY_ECID,
  LEGACY_IDENTITY_COOKIE_NAME,
  setLegacyIdentityCookie,
  setSecidCookie,
} from "../../helpers/utils/legacyCookies.js";
import { withTemporaryUrl } from "../../helpers/utils/location.js";

// Matches the org in alloyConfig: 5BFE274A5F6980A50A495C08@AdobeOrg
const ORG_ID = "5BFE274A5F6980A50A495C08@AdobeOrg";

// ECID pattern — a long string of digits
const ECID_REGEX = /^\d{30,40}$/;

// TS must be within 300s of now or alloy rejects the adobe_mc value
function createAdobeMC(ecid, orgId = ORG_ID) {
  const ts = Math.floor(Date.now() / 1000);
  return encodeURIComponent(`TS=${ts}|MCMID=${ecid}|MCORGID=${orgId}`);
}

function createRandomEcid() {
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  // eslint-disable-next-line no-bitwise
  buf[0] &= 0x7f;
  // eslint-disable-next-line no-bitwise
  buf[8] &= 0x7f;
  const view = new DataView(buf.buffer);
  const hi = view.getBigUint64(0, false).toString().padStart(19, "0");
  const lo = view.getBigUint64(8, false).toString().padStart(19, "0");
  return hi + lo;
}

// Legacy ECID lives in xdm.identityMap (request-level), not events[0].xdm.identityMap
const createMigrationSendEventHandler = () =>
  http.post(
    /https:\/\/edge\.adobedc\.net\/ee\/.*\/?v1\/interact/,
    async ({ request }) => {
      const body = await request.json();
      const sentEcid = body?.xdm?.identityMap?.ECID?.[0]?.id ?? null;

      const ecid = sentEcid || "41861666193140161934276845651148876988";

      return HttpResponse.json({
        requestId: `migration-test-${Date.now()}`,
        handle: [
          {
            payload: [
              {
                id: ecid,
                namespace: { code: "ECID" },
              },
            ],
            type: "identity:result",
          },
          {
            payload: [
              {
                key: `kndctr_${encodeURIComponent(ORG_ID).replace(/%40/g, "_")}_cluster`,
                value: "or2",
                maxAge: 1800,
              },
            ],
            type: "state:store",
          },
        ],
      });
    },
  );

describe("ID Migration", () => {
  // Clear all cookies before each test; the alloy fixture only clears kndctr_/AMCV_ cookies.
  beforeEach(() => {
    document.cookie.split(";").forEach((c) => {
      const name = c.split("=")[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
  });

  test("C14394: migration enabled + AMCV cookie present → ECID sent in request and reflected in response", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(createMigrationSendEventHandler());

    // Set the legacy AMCV cookie before configuring alloy
    setLegacyIdentityCookie(ORG_ID);

    await alloy("configure", {
      ...alloyConfig,
      idMigrationEnabled: true,
    });

    await alloy("sendEvent", { renderDecisions: true });

    const call = await networkRecorder.findCall(/v1\/interact/);
    expect(call).toBeDefined();
    expect(call.response.status).toBeGreaterThanOrEqual(200);
    expect(call.response.status).toBeLessThanOrEqual(207);

    // alloy should have read the ECID from the legacy cookie and sent it
    // Note: legacy ECID is at request-level xdm.identityMap, not events[0].xdm.identityMap
    const sentEcid = call.request.body?.xdm?.identityMap?.ECID?.[0]?.id;
    expect(sentEcid).toBe(LEGACY_ECID);

    // The response should echo back the same ECID
    const responseBody = call.response.body;
    const ecidPayload = responseBody?.handle
      ?.find((h) => h.type === "identity:result")
      ?.payload?.find((p) => p.namespace?.code === "ECID");
    expect(ecidPayload?.id).toBe(LEGACY_ECID);
  });

  test("C14399: migration enabled + s_ecid cookie present → ECID sent in request", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(createMigrationSendEventHandler());

    // Set the s_ecid cookie before configuring alloy
    setSecidCookie();

    await alloy("configure", {
      ...alloyConfig,
      idMigrationEnabled: true,
    });

    await alloy("sendEvent", { renderDecisions: true });

    const call = await networkRecorder.findCall(/v1\/interact/);
    expect(call).toBeDefined();
    expect(call.response.status).toBeGreaterThanOrEqual(200);
    expect(call.response.status).toBeLessThanOrEqual(207);

    // alloy should have read the ECID from s_ecid and sent it
    // Note: legacy ECID is at request-level xdm.identityMap, not events[0].xdm.identityMap
    const sentEcid = call.request.body?.xdm?.identityMap?.ECID?.[0]?.id;
    expect(sentEcid).toBe(LEGACY_ECID);

    // The s_ecid cookie should still be present
    expect(document.cookie).toContain(
      "s_ecid=MCMID%7C16908443662402872073525706953453086963",
    );
  });

  test("C14400: migration disabled + s_ecid cookie present → ECID NOT sent in request, new ECID assigned", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(createMigrationSendEventHandler());

    // Set the s_ecid cookie — alloy should ignore it when migration is disabled
    setSecidCookie();

    await alloy("configure", {
      ...alloyConfig,
      idMigrationEnabled: false,
    });

    await alloy("sendEvent", { renderDecisions: true });

    const call = await networkRecorder.findCall(/v1\/interact/);
    expect(call).toBeDefined();
    expect(call.response.status).toBeGreaterThanOrEqual(200);
    expect(call.response.status).toBeLessThanOrEqual(207);

    // No XDM identityMap should be present (alloy doesn't send an ECID it generated itself
    // in the identityMap at the XDM level for a plain sendEvent)
    const xdmIdentityMap = call.request.body?.events?.[0]?.xdm?.identityMap;
    expect(xdmIdentityMap?.ECID).toBeUndefined();

    // The response returns a fresh ECID (from the mock's fallback)
    const responseBody = call.response.body;
    const ecidPayload = responseBody?.handle
      ?.find((h) => h.type === "identity:result")
      ?.payload?.find((p) => p.namespace?.code === "ECID");
    expect(ecidPayload?.id).toMatch(ECID_REGEX);

    // The legacy ECID should NOT be what was returned (a new one was assigned)
    expect(ecidPayload?.id).not.toBe(LEGACY_ECID);

    // AMCV cookie should NOT be set (migration disabled)
    expect(document.cookie).not.toContain(
      `${LEGACY_IDENTITY_COOKIE_NAME}=MCMID|${ecidPayload?.id}`,
    );
  });

  test("C14401: migration disabled + AMCV cookie present → ECID NOT sent in request", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(createMigrationSendEventHandler());

    // Set legacy AMCV cookie — alloy should ignore it when migration is disabled
    setLegacyIdentityCookie(ORG_ID);

    await alloy("configure", {
      ...alloyConfig,
      idMigrationEnabled: false,
    });

    await alloy("sendEvent", { renderDecisions: true });

    const call = await networkRecorder.findCall(/v1\/interact/);
    expect(call).toBeDefined();
    expect(call.response.status).toBeGreaterThanOrEqual(200);
    expect(call.response.status).toBeLessThanOrEqual(207);

    // No ECID from the legacy cookie should be present in the request
    const xdmIdentityMap = call.request.body?.events?.[0]?.xdm?.identityMap;
    expect(xdmIdentityMap?.ECID).toBeUndefined();

    // The response still returns a valid ECID (a new one, not the legacy one)
    const responseBody = call.response.body;
    const ecidPayload = responseBody?.handle
      ?.find((h) => h.type === "identity:result")
      ?.payload?.find((p) => p.namespace?.code === "ECID");
    expect(ecidPayload?.id).toMatch(ECID_REGEX);
  });

  test("C14402: migration enabled + no AMCV cookie → AMCV cookie created after sendEvent", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(createMigrationSendEventHandler());

    // No legacy cookie set — alloy should create one after sendEvent
    await alloy("configure", {
      ...alloyConfig,
      idMigrationEnabled: true,
    });

    await alloy("sendEvent", { renderDecisions: true });

    const call = await networkRecorder.findCall(/v1\/interact/);
    expect(call).toBeDefined();
    expect(call.response.status).toBeGreaterThanOrEqual(200);
    expect(call.response.status).toBeLessThanOrEqual(207);

    // Get the ECID that the server returned
    const responseBody = call.response.body;
    const ecidPayload = responseBody?.handle
      ?.find((h) => h.type === "identity:result")
      ?.payload?.find((p) => p.namespace?.code === "ECID");
    expect(ecidPayload?.id).toMatch(ECID_REGEX);

    // The AMCV cookie should now be present, containing the new ECID.
    // alloy uses js-cookie to write it; js-cookie encodes '@' as '%40' in names
    // and keeps '|' literal in values, so document.cookie shows '%40' in the name.
    expect(document.cookie).toContain(
      `${LEGACY_IDENTITY_COOKIE_NAME}=MCMID|${ecidPayload?.id}`,
    );
  });

  test("C14403: migration disabled + no AMCV cookie → AMCV cookie NOT created after sendEvent", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(createMigrationSendEventHandler());

    // No legacy cookie set
    await alloy("configure", {
      ...alloyConfig,
      idMigrationEnabled: false,
    });

    await alloy("sendEvent", { renderDecisions: true });

    const call = await networkRecorder.findCall(/v1\/interact/);
    expect(call).toBeDefined();
    expect(call.response.status).toBeGreaterThanOrEqual(200);
    expect(call.response.status).toBeLessThanOrEqual(207);

    // Get the ECID that the server returned
    const responseBody = call.response.body;
    const ecidPayload = responseBody?.handle
      ?.find((h) => h.type === "identity:result")
      ?.payload?.find((p) => p.namespace?.code === "ECID");
    expect(ecidPayload?.id).toMatch(ECID_REGEX);

    // No AMCV cookie should be written since migration is disabled
    expect(document.cookie).not.toContain(
      `AMCV_5BFE274A5F6980A50A495C08%40AdobeOrg=MCMID|${ecidPayload?.id}`,
    );
  });

  test("C5752639: identity changed via adobe_mc query param when migration enabled", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    const adobeMcEcid = createRandomEcid();
    const adobeMcValue = createAdobeMC(adobeMcEcid);

    // This handler echoes back whatever ECID was sent in the request, or uses
    // the adobe_mc ECID as a fallback. It also writes the AMCV cookie and the
    // kndctr identity cookie so future phases see persistence.
    // Handler that echoes back the ECID sent in the request (or falls back to
    // the adobe_mc ECID). alloy automatically writes the AMCV cookie from the
    // identity:result response — no need to write it manually via state:store.
    const echoEcidHandler = http.post(
      /https:\/\/edge\.adobedc\.net\/ee\/.*\/?v1\/interact/,
      async ({ request }) => {
        const url = new URL(request.url);
        const configId = url.searchParams.get("configId");
        if (
          !configId ||
          !configId.startsWith("bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83")
        ) {
          throw new Error("Handler not configured properly");
        }
        const body = await request.json();
        // alloy sends the adobe_mc / legacy ECID at the request-level xdm.identityMap
        const sentEcid = body?.xdm?.identityMap?.ECID?.[0]?.id ?? adobeMcEcid;
        return HttpResponse.json({
          requestId: `migration-echo-${Date.now()}`,
          handle: [
            {
              payload: [{ id: sentEcid, namespace: { code: "ECID" } }],
              type: "identity:result",
            },
            {
              payload: [
                {
                  key: "kndctr_5BFE274A5F6980A50A495C08_AdobeOrg_cluster",
                  value: "or2",
                  maxAge: 1800,
                },
              ],
              type: "state:store",
            },
          ],
        });
      },
    );

    worker.use(echoEcidHandler);

    // Phase 1: legacy AMCV cookie present, configure + sendEvent
    setLegacyIdentityCookie(ORG_ID);

    await alloy("configure", {
      ...alloyConfig,
      idMigrationEnabled: true,
    });
    await alloy("sendEvent");

    const phase1Call = await networkRecorder.findCall(/v1\/interact/);
    expect(phase1Call).toBeDefined();
    // Phase 1 sends LEGACY_ECID (from the AMCV cookie)
    expect(phase1Call.request.body?.xdm?.identityMap?.ECID?.[0]?.id).toBe(
      LEGACY_ECID,
    );

    // Phase 2: simulate reload with adobe_mc param in URL
    cleanAlloy();
    await setupBaseCode();
    networkRecorder.reset();

    await withTemporaryUrl(async ({ applyUrl, currentHref }) => {
      const url = new URL(currentHref);
      url.searchParams.set("adobe_mc", adobeMcValue);
      applyUrl(url);

      const alloy2 = await setupAlloy();
      await alloy2("configure", {
        ...alloyConfig,
        idMigrationEnabled: true,
      });
      await alloy2("sendEvent");

      const phase2Call = await networkRecorder.findCall(/v1\/interact/);
      expect(phase2Call).toBeDefined();
      // Phase 2 sends the ECID from adobe_mc
      expect(phase2Call.request.body?.xdm?.identityMap?.ECID?.[0]?.id).toBe(
        adobeMcEcid,
      );
    });

    // Phase 3: simulate reload without adobe_mc param
    cleanAlloy();
    await setupBaseCode();
    networkRecorder.reset();

    const alloy3 = await setupAlloy();
    await alloy3("configure", {
      ...alloyConfig,
      idMigrationEnabled: true,
    });
    await alloy3("sendEvent");

    const phase3Call = await networkRecorder.findCall(/v1\/interact/);
    expect(phase3Call).toBeDefined();
    // Phase 3 uses the ECID persisted from the adobe_mc (written to AMCV cookie in phase 2)
    expect(phase3Call.request.body?.xdm?.identityMap?.ECID?.[0]?.id).toBe(
      adobeMcEcid,
    );

    // The AMCV cookie should contain the adobe_mc ECID
    expect(document.cookie).toContain(
      `${LEGACY_IDENTITY_COOKIE_NAME}=MCMID|${adobeMcEcid}`,
    );
  });
});
