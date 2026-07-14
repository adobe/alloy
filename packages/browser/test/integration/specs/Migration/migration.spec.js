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
const COOKIE_EXPIRY = 4102444800;
const ALLOY_MBOX_COOKIE = `session#${ALLOY_SESSION_ID}#${COOKIE_EXPIRY}|PC#alloy-device#${COOKIE_EXPIRY}`;
const TARGET_REQUEST =
  /https?:\/\/(?:unifiedjsqeonly|mboxedge35)\.tt\.omtrdc\.net\/(?:m2\/unifiedjsqeonly\/mbox\/json|rest\/v1\/delivery)/;
const EDGE_REQUEST = /https:\/\/edge\.adobedc\.net\/ee\/(?:t35\/)?v1\/interact/;

const corsHeaders = {
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Origin": window.location.origin,
};

const edgeHandler = http.post(EDGE_REQUEST, () =>
  HttpResponse.json(
    {
      requestId: "migration-edge-request",
      handle: [
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
      ],
    },
    { headers: corsHeaders },
  ),
);

const targetMboxHandler = http.get(
  /https?:\/\/(?:unifiedjsqeonly|mboxedge35)\.tt\.omtrdc\.net\/m2\/unifiedjsqeonly\/mbox\/json/,
  ({ request }) => {
    const sessionId = new URL(request.url).searchParams.get("mboxSession");

    return HttpResponse.json(
      {
        sessionId,
        tntId: "legacy-device.35_0",
        edgeHost: TARGET_CLUSTER_HOST,
        offers: [],
      },
      { headers: corsHeaders },
    );
  },
);

const targetDeliveryHandler = http.post(
  /https?:\/\/(?:unifiedjsqeonly|mboxedge35)\.tt\.omtrdc\.net\/rest\/v1\/delivery/,
  async ({ request }) => {
    const body = await request.clone().json();

    return HttpResponse.json(
      {
        requestId: body.requestId,
        client: "unifiedjsqeonly",
        id: { tntId: "legacy-device.35_0" },
        edgeHost: TARGET_CLUSTER_HOST,
        status: {},
        execute: {
          mboxes: (body.execute?.mboxes || []).map(({ index }) => ({
            index,
            options: [],
          })),
        },
      },
      { headers: corsHeaders },
    );
  },
);

const getCookie = async (name) => (await cookieStore.get(name))?.value;

const loadAtJs = async (majorVersion) => {
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

const assertMigrationMetadata = (body) => {
  expect(body.meta.target).toEqual({ migration: true });
};

const runAlloyToAtJs = async ({
  majorVersion,
  alloy,
  worker,
  networkRecorder,
}) => {
  worker.use(edgeHandler, targetMboxHandler, targetDeliveryHandler);
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
  expect(await getCookie("mbox")).toBe(ALLOY_MBOX_COOKIE);
  expect(await getCookie("mboxEdgeCluster")).toBe(TARGET_CLUSTER);

  networkRecorder.reset();
  await loadAtJs(majorVersion);
  await requestAtJsOffer(majorVersion);

  const targetCall = await networkRecorder.findCall(TARGET_REQUEST);
  const targetUrl = new URL(targetCall.request.url);
  expect(targetUrl.hostname).toBe(TARGET_CLUSTER_HOST);
  expect(targetUrl.pathname).toBe(
    majorVersion === 1 ? "/m2/unifiedjsqeonly/mbox/json" : "/rest/v1/delivery",
  );
  expect(
    targetUrl.searchParams.get(
      majorVersion === 1 ? "mboxSession" : "sessionId",
    ),
  ).toBe(ALLOY_SESSION_ID);
};

const runAtJsToAlloy = async ({
  majorVersion,
  alloy,
  worker,
  networkRecorder,
}) => {
  worker.use(edgeHandler, targetMboxHandler, targetDeliveryHandler);
  await loadAtJs(majorVersion);
  await requestAtJsOffer(majorVersion);

  const targetCall = await networkRecorder.findCall(TARGET_REQUEST);
  const targetUrl = new URL(targetCall.request.url);
  const sessionId = targetUrl.searchParams.get(
    majorVersion === 1 ? "mboxSession" : "sessionId",
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
});

describe("Migration (Web SDK ↔ At.js mixed-mode)", () => {
  test("C8085773: Web SDK → At.js 1.x transfers session and edge cluster", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    await runAlloyToAtJs({
      alloy,
      worker,
      networkRecorder,
      majorVersion: 1,
    });
  });

  test("C8085774: Web SDK → At.js 2.x transfers session and edge cluster", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    await runAlloyToAtJs({
      alloy,
      worker,
      networkRecorder,
      majorVersion: 2,
    });
  });

  test("C8085775: At.js 1.x → Web SDK transfers session and edge cluster", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    await runAtJsToAlloy({
      alloy,
      worker,
      networkRecorder,
      majorVersion: 1,
    });
  });

  test("C8085776: At.js 2.x → Web SDK transfers session and edge cluster", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    await runAtJsToAlloy({
      alloy,
      worker,
      networkRecorder,
      majorVersion: 2,
    });
  });
});
