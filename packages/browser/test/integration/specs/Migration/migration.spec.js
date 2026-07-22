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
  afterEach,
  describe,
  expect,
  test,
} from "../../helpers/testsSetup/extend.js";
import alloyConfig from "../../helpers/alloy/config.js";

const { readFile } = server.commands;
const TARGET_CLUSTER = "35";
const TARGET_CLUSTER_HOST = `mboxedge${TARGET_CLUSTER}.tt.omtrdc.net`;
const TARGET_CLIENT_HOST = "unifiedjsqeonly.tt.omtrdc.net";
const ALLOY_SESSION_ID = "alloy-migration-session";
const EDGE_ECID = "41861666193140161934276845651148876988";
const LEGACY_ECID = "16908443662402872073525706953453086963";
const MIGRATION_LOCATION = "location-for-migration-testing";
const AMCV_COOKIE = `AMCV_${encodeURIComponent(alloyConfig.orgId)}`;
const COOKIE_EXPIRY = 4102444800;
const ALLOY_MBOX_COOKIE = `session#${ALLOY_SESSION_ID}#${COOKIE_EXPIRY}|PC#alloy-device#${COOKIE_EXPIRY}`;
const TARGET_REQUEST =
  /https?:\/\/(?:unifiedjsqeonly|mboxedge35)\.tt\.omtrdc\.net\/(?:m2\/unifiedjsqeonly\/mbox\/json|rest\/v1\/delivery)/;
const EDGE_REQUEST = /https:\/\/edge\.adobedc\.net\/ee\/(?:t35\/)?v1\/interact/;

const corsHeaders = {
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Origin": window.location.origin,
};

const getProfileContent = (favoriteColor) =>
  `The favorite Color for this visitor is ${favoriteColor}.`;

const createMigrationHandlers = () => {
  const profiles = new Map();

  const edgeHandler = http.post(EDGE_REQUEST, async ({ request }) => {
    const body = await request.clone().json();
    const event = body.events?.[0] || body;
    const ecid = body.xdm?.identityMap?.ECID?.[0]?.id || EDGE_ECID;
    const favoriteColor =
      event.data?.__adobe?.target?.["profile.favoriteColor"];
    if (favoriteColor) {
      profiles.set(ecid, favoriteColor);
    }
    const handle = [
      {
        type: "state:store",
        payload: [
          {
            key: "mbox",
            value: ALLOY_MBOX_COOKIE,
            maxAge: 1860,
          },
          {
            key: "mboxEdgeCluster",
            value: TARGET_CLUSTER,
            maxAge: 1860,
          },
        ],
      },
      {
        type: "identity:result",
        payload: [
          {
            id: ecid,
            namespace: { code: "ECID" },
          },
        ],
      },
    ];

    const profileColor = profiles.get(ecid);
    if (profileColor) {
      handle.push({
        type: "personalization:decisions",
        payload: [
          {
            id: "migration-proposition",
            scope: MIGRATION_LOCATION,
            items: [
              {
                id: "migration-offer",
                schema:
                  "https://ns.adobe.com/personalization/json-content-item",
                data: { content: getProfileContent(profileColor) },
              },
            ],
          },
        ],
      });
    }

    return HttpResponse.json(
      { requestId: "migration-edge-request", handle },
      { headers: corsHeaders },
    );
  });

  const targetMboxHandler = http.get(
    /https?:\/\/(?:unifiedjsqeonly|mboxedge35)\.tt\.omtrdc\.net\/m2\/unifiedjsqeonly\/mbox\/json/,
    ({ request }) => {
      const searchParams = new URL(request.url).searchParams;
      const ecid = searchParams.get("mboxMCGVID");
      const favoriteColor = searchParams.get("profile.favoriteColor");
      if (ecid && favoriteColor) {
        profiles.set(ecid, favoriteColor);
      }
      const profileColor = profiles.get(ecid);

      return HttpResponse.json(
        {
          sessionId: searchParams.get("mboxSession"),
          tntId: "legacy-device.35_0",
          edgeHost: TARGET_CLUSTER_HOST,
          offers: profileColor
            ? [{ html: getProfileContent(profileColor) }]
            : [],
        },
        { headers: corsHeaders },
      );
    },
  );

  const targetDeliveryHandler = http.post(
    /https?:\/\/(?:unifiedjsqeonly|mboxedge35)\.tt\.omtrdc\.net\/rest\/v1\/delivery/,
    async ({ request }) => {
      const body = await request.clone().json();
      const mboxes = body.execute?.mboxes || [];
      const ecid = body.id?.marketingCloudVisitorId;
      const favoriteColor = mboxes[0]?.profileParameters?.favoriteColor;
      if (ecid && favoriteColor) {
        profiles.set(ecid, favoriteColor);
      }
      const profileColor = profiles.get(ecid);

      return HttpResponse.json(
        {
          requestId: body.requestId,
          client: "unifiedjsqeonly",
          id: {
            tntId: "legacy-device.35_0",
            ...(ecid && { marketingCloudVisitorId: ecid }),
          },
          edgeHost: TARGET_CLUSTER_HOST,
          status: {},
          execute: {
            mboxes: mboxes.map(({ index }) => ({
              index,
              options: profileColor
                ? [{ content: getProfileContent(profileColor) }]
                : [],
            })),
          },
        },
        { headers: corsHeaders },
      );
    },
  );

  return [edgeHandler, targetMboxHandler, targetDeliveryHandler];
};

const getCookie = async (name) =>
  (
    (await cookieStore.get(name)) ??
    (await cookieStore.get(decodeURIComponent(name)))
  )?.value;

const loadAtJs = async (majorVersion, { ecid } = {}) => {
  if (ecid) {
    await cookieStore.set({
      name: AMCV_COOKIE,
      value: `MCMID|${ecid}`,
      path: "/",
    });
  }

  const visitorSource = await readFile(
    `${server.config.root}/sandboxes/browser/public/e2e/js/visitor.5.js`,
  );
  const visitorScript = document.createElement("script");
  visitorScript.dataset.legacyTarget = "visitor";
  visitorScript.textContent = visitorSource;
  document.head.appendChild(visitorScript);
  window.visitor = window.Visitor.getInstance(alloyConfig.orgId);
  window.targetGlobalSettings = {
    bodyHidingEnabled: false,
    globalMboxAutoCreate: false,
    pageLoadEnabled: false,
    serverDomain: TARGET_CLIENT_HOST,
  };

  const filename = majorVersion === 1 ? "at.js" : "at2.js";
  const source = await readFile(
    `${server.config.root}/sandboxes/browser/public/functional-test/legacyLibraries/${filename}`,
  );
  const script = document.createElement("script");
  script.dataset.legacyTarget = String(majorVersion);
  script.textContent = source;
  document.head.appendChild(script);

  expect(window.adobe.target.VERSION).toMatch(
    majorVersion === 1 ? /^1\./ : /^2\./,
  );
};

const requestAtJsOffer = (majorVersion) => {
  if (majorVersion === 1) {
    return new Promise((resolve, reject) => {
      window.adobe.target.getOffer({
        mbox: "migration-mbox",
        success: resolve,
        error: (_status, error) => reject(error),
      });
    });
  }

  return window.adobe.target.getOffers({
    request: {
      execute: {
        mboxes: [{ index: 0, name: "migration-mbox" }],
      },
    },
  });
};

const fetchAtJsOffer = ({ mbox = MIGRATION_LOCATION, params = {} } = {}) =>
  new Promise((resolve, reject) => {
    window.adobe.target.getOffer({
      mbox,
      params,
      success: resolve,
      error: (_status, error) => reject(error),
    });
  });

const assertMigrationMetadata = (body) => {
  expect(body.meta.target).toEqual({ migration: true });
};

afterEach(() => {
  document
    .querySelectorAll("script[data-legacy-target]")
    .forEach((script) => script.remove());
  delete window.targetGlobalSettings;
  delete window.adobe;
  delete window.mboxCreate;
  delete window.mboxDefine;
  delete window.mboxUpdate;
  window.Visitor = undefined;
  delete window.visitor;
  window.s_c_il = [];
  window.s_c_in = 0;
});

describe("Migration (Web SDK ↔ At.js mixed-mode)", () => {
  test("C8085773: Web SDK → At.js 1.x transfers session and edge cluster", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(...createMigrationHandlers());
    await alloy("configure", {
      ...alloyConfig,
      targetMigrationEnabled: true,
    });
    await alloy("sendEvent");

    const edgeCall = await networkRecorder.findCall(EDGE_REQUEST);
    assertMigrationMetadata(edgeCall.request.body);
    expect(edgeCall.response.body.handle[0].payload).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "mbox", value: ALLOY_MBOX_COOKIE }),
        expect.objectContaining({
          key: "mboxEdgeCluster",
          value: TARGET_CLUSTER,
        }),
      ]),
    );
    const mboxCookie = await getCookie("mbox");
    const mboxEdgeCluster = await getCookie("mboxEdgeCluster");
    expect(mboxCookie).toBe(ALLOY_MBOX_COOKIE);
    expect(mboxEdgeCluster).toBe(TARGET_CLUSTER);

    networkRecorder.reset();
    await loadAtJs(1, { ecid: LEGACY_ECID });
    await requestAtJsOffer(1);

    const targetCall = await networkRecorder.findCall(TARGET_REQUEST);
    expect(targetCall.response.status).toBe(200);
    const targetUrl = new URL(targetCall.request.url);
    expect(targetUrl.hostname).toBe(TARGET_CLUSTER_HOST);
    expect(targetUrl.pathname).toBe("/m2/unifiedjsqeonly/mbox/json");
    expect(targetUrl.searchParams.get("mboxSession")).toBe(ALLOY_SESSION_ID);
  });

  test("C8085774: Web SDK → At.js 2.x transfers session and edge cluster", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(...createMigrationHandlers());
    await alloy("configure", {
      ...alloyConfig,
      targetMigrationEnabled: true,
    });
    await alloy("sendEvent");

    const edgeCall = await networkRecorder.findCall(EDGE_REQUEST);
    assertMigrationMetadata(edgeCall.request.body);
    expect(edgeCall.response.body.handle[0].payload).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "mbox", value: ALLOY_MBOX_COOKIE }),
        expect.objectContaining({
          key: "mboxEdgeCluster",
          value: TARGET_CLUSTER,
        }),
      ]),
    );
    const mboxCookie = await getCookie("mbox");
    const mboxEdgeCluster = await getCookie("mboxEdgeCluster");
    expect(mboxCookie).toBe(ALLOY_MBOX_COOKIE);
    expect(mboxEdgeCluster).toBe(TARGET_CLUSTER);

    networkRecorder.reset();
    await loadAtJs(2, { ecid: LEGACY_ECID });
    await requestAtJsOffer(2);

    const targetCalls = await networkRecorder.findCalls(TARGET_REQUEST, {
      minCalls: 2,
    });
    expect(targetCalls).toHaveLength(2);
    const targetCall = targetCalls[1];
    expect(targetCall.response.status).toBe(200);
    const targetUrl = new URL(targetCall.request.url);
    expect(targetUrl.hostname).toBe(TARGET_CLUSTER_HOST);
    expect(targetUrl.pathname).toBe("/rest/v1/delivery");
    expect(targetUrl.searchParams.get("sessionId")).toBe(ALLOY_SESSION_ID);
  });

  test("C8085775: At.js 1.x → Web SDK transfers session and edge cluster", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(...createMigrationHandlers());
    await loadAtJs(1, { ecid: LEGACY_ECID });
    await requestAtJsOffer(1);

    const targetCalls = await networkRecorder.findCalls(TARGET_REQUEST);
    expect(targetCalls).toHaveLength(1);
    const targetCall = targetCalls[0];
    expect(targetCall.response.status).toBe(200);
    const sessionId = new URL(targetCall.request.url).searchParams.get(
      "mboxSession",
    );
    const mboxCookie = await getCookie("mbox");
    expect(sessionId).toBeTruthy();
    expect(mboxCookie).toContain(`session#${sessionId}#`);
    expect(await getCookie("mboxEdgeCluster")).toBe(TARGET_CLUSTER);

    networkRecorder.reset();
    await alloy("configure", {
      ...alloyConfig,
      targetMigrationEnabled: true,
    });
    await alloy("sendEvent");

    const edgeCall = await networkRecorder.findCall(EDGE_REQUEST);
    expect(new URL(edgeCall.request.url).pathname).toBe(
      `/ee/t${TARGET_CLUSTER}/v1/interact`,
    );
    assertMigrationMetadata(edgeCall.request.body);
    expect(edgeCall.request.body.meta.state).toEqual(
      expect.objectContaining({
        cookiesEnabled: true,
        entries: expect.arrayContaining([{ key: "mbox", value: mboxCookie }]),
      }),
    );
  });

  test("C8085776: At.js 2.x → Web SDK transfers session and edge cluster", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(...createMigrationHandlers());
    await loadAtJs(2, { ecid: LEGACY_ECID });
    await requestAtJsOffer(2);

    const targetCalls = await networkRecorder.findCalls(TARGET_REQUEST, {
      minCalls: 2,
    });
    expect(targetCalls).toHaveLength(2);
    const targetCall = targetCalls[1];
    expect(targetCall.response.status).toBe(200);
    const sessionId = new URL(targetCall.request.url).searchParams.get(
      "sessionId",
    );
    const mboxCookie = await getCookie("mbox");
    expect(sessionId).toBeTruthy();
    expect(mboxCookie).toContain(`session#${sessionId}#`);
    expect(await getCookie("mboxEdgeCluster")).toBe(TARGET_CLUSTER);

    networkRecorder.reset();
    await alloy("configure", {
      ...alloyConfig,
      targetMigrationEnabled: true,
    });
    await alloy("sendEvent");

    const edgeCall = await networkRecorder.findCall(EDGE_REQUEST);
    expect(new URL(edgeCall.request.url).pathname).toBe(
      `/ee/t${TARGET_CLUSTER}/v1/interact`,
    );
    assertMigrationMetadata(edgeCall.request.body);
    expect(edgeCall.request.body.meta.state).toEqual(
      expect.objectContaining({
        cookiesEnabled: true,
        entries: expect.arrayContaining([{ key: "mbox", value: mboxCookie }]),
      }),
    );
  });

  test("C8085777: Web SDK → At.js 2.x shares the visitor profile", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    const favoriteColor = "violet-1234";
    worker.use(...createMigrationHandlers());
    await alloy("configure", {
      ...alloyConfig,
      idMigrationEnabled: true,
      targetMigrationEnabled: true,
    });
    await alloy("sendEvent", {
      renderDecisions: true,
      data: {
        __adobe: {
          target: { "profile.favoriteColor": favoriteColor },
        },
      },
    });

    const edgeCall = await networkRecorder.findCall(EDGE_REQUEST);
    assertMigrationMetadata(edgeCall.request.body);
    const mboxCookie = await getCookie("mbox");
    expect(mboxCookie).toBe(ALLOY_MBOX_COOKIE);
    expect(await getCookie("mboxEdgeCluster")).toBe(TARGET_CLUSTER);
    expect(await getCookie(AMCV_COOKIE)).toContain(`MCMID|${EDGE_ECID}`);

    networkRecorder.reset();
    await loadAtJs(2);
    await fetchAtJsOffer();

    const targetCalls = await networkRecorder.findCalls(TARGET_REQUEST, {
      minCalls: 2,
    });
    const targetCall = targetCalls[1];
    expect(targetCalls).toHaveLength(2);
    expect(targetCall.response.status).toBe(200);
    expect(targetCall.request.body.id.marketingCloudVisitorId).toBe(EDGE_ECID);
    expect(targetCall.response.body.execute.mboxes[0].options[0].content).toBe(
      getProfileContent(favoriteColor),
    );
    const targetUrl = new URL(targetCall.request.url);
    expect(targetUrl.hostname).toBe(TARGET_CLUSTER_HOST);
    expect(targetUrl.searchParams.get("sessionId")).toBe(ALLOY_SESSION_ID);
  });

  test("C8085778: Web SDK → At.js 1.x shares identity and visitor profile", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    const favoriteColor = "purple-123";
    worker.use(...createMigrationHandlers());
    await alloy("configure", {
      ...alloyConfig,
      idMigrationEnabled: true,
      targetMigrationEnabled: true,
    });
    await alloy("sendEvent", {
      renderDecisions: true,
      data: {
        __adobe: {
          target: { "profile.favoriteColor": favoriteColor },
        },
      },
    });

    const edgeCall = await networkRecorder.findCall(EDGE_REQUEST);
    assertMigrationMetadata(edgeCall.request.body);
    const edgeEcid = edgeCall.response.body.handle
      .find(({ type }) => type === "identity:result")
      .payload.find(({ namespace }) => namespace.code === "ECID").id;
    expect(await getCookie(AMCV_COOKIE)).toContain(`MCMID|${edgeEcid}`);

    networkRecorder.reset();
    await loadAtJs(1);
    await fetchAtJsOffer();

    const targetCall = await networkRecorder.findCall(TARGET_REQUEST);
    expect(targetCall.response.status).toBe(200);
    const searchParams = new URL(targetCall.request.url).searchParams;
    expect(searchParams.get("mboxMCGVID")).toBe(edgeEcid);
    expect(targetCall.response.body.offers[0].html).toBe(
      getProfileContent(favoriteColor),
    );
  });

  test("C8085779: At.js 1.x → Web SDK shares identity and visitor profile", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    const favoriteColor = "green-1234";
    worker.use(...createMigrationHandlers());
    await loadAtJs(1, { ecid: LEGACY_ECID });
    await fetchAtJsOffer({
      params: { "profile.favoriteColor": favoriteColor },
    });

    const targetCall = await networkRecorder.findCall(TARGET_REQUEST);
    const targetCalls = await networkRecorder.findCalls(TARGET_REQUEST);
    expect(targetCalls).toHaveLength(1);
    expect(targetCall.response.status).toBe(200);
    const targetEcid = new URL(targetCall.request.url).searchParams.get(
      "mboxMCGVID",
    );

    networkRecorder.reset();
    await alloy("configure", {
      ...alloyConfig,
      idMigrationEnabled: true,
      targetMigrationEnabled: true,
    });
    await alloy("sendEvent", { decisionScopes: [MIGRATION_LOCATION] });

    const edgeCall = await networkRecorder.findCall(EDGE_REQUEST);
    const edgeEcid = edgeCall.request.body.xdm.identityMap.ECID[0].id;
    expect(targetEcid).toBe(edgeEcid);
    const proposition = edgeCall.response.body.handle
      .find(({ type }) => type === "personalization:decisions")
      .payload.find(({ scope }) => scope === MIGRATION_LOCATION);
    expect(proposition.items[0].data.content).toBe(
      getProfileContent(favoriteColor),
    );
  });

  test("C8085780: At.js 2.x → Web SDK shares identity and visitor profile", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    const favoriteColor = "red-1234";
    worker.use(...createMigrationHandlers());
    await loadAtJs(2, { ecid: LEGACY_ECID });
    await fetchAtJsOffer({
      params: { "profile.favoriteColor": favoriteColor },
    });

    const targetCalls = await networkRecorder.findCalls(TARGET_REQUEST, {
      minCalls: 2,
    });
    const targetCall = targetCalls[1];
    expect(targetCalls).toHaveLength(2);
    expect(targetCall.response.status).toBe(200);
    const targetEcid = targetCall.request.body.id.marketingCloudVisitorId;

    networkRecorder.reset();
    await alloy("configure", {
      ...alloyConfig,
      idMigrationEnabled: true,
      targetMigrationEnabled: true,
    });
    await alloy("sendEvent", { decisionScopes: [MIGRATION_LOCATION] });

    const edgeCall = await networkRecorder.findCall(EDGE_REQUEST);
    const edgeEcid = edgeCall.request.body.xdm.identityMap.ECID[0].id;
    expect(targetEcid).toBe(edgeEcid);
    const proposition = edgeCall.response.body.handle
      .find(({ type }) => type === "personalization:decisions")
      .payload.find(({ scope }) => scope === MIGRATION_LOCATION);
    expect(proposition.items[0].data.content).toBe(
      getProfileContent(favoriteColor),
    );
  });
});
