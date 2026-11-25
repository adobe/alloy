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
import alloyConfig from "../../helpers/alloy/config.js";
import { test, expect } from "../../helpers/testsSetup/extend.js";

const defaultItem = {
  id: "0",
  schema: "https://ns.adobe.com/personalization/default-content-item",
  meta: {
    "activity.id": "139738",
    "activity.name": "Functional: C5805676",
    "experience.id": "0",
    "offer.id": "0",
    "offer.name": "Default Content",
  },
};
const metricItem = {
  id: "139738",
  schema: "https://ns.adobe.com/personalization/measurement",
  data: { format: "application/vnd.adobe.target.metric", type: "click" },
};
const makeHandler = (scope) =>
  http.post(
    /https:\/\/edge.adobedc.net\/ee\/.*\/?v1\/interact/,
    async ({ request }) => {
      const body = await request.json();
      if (!body.events[0].query?.personalization?.schemas) {
        return HttpResponse.json({ requestId: "notification", handle: [] });
      }
      return HttpResponse.json({
        requestId: "merged-metric",
        handle: [
          {
            type: "personalization:decisions",
            eventIndex: 0,
            payload: [
              {
                id: "AT:merged-metric",
                scope,
                scopeDetails: {
                  decisionProvider: "TGT",
                  activity: { id: "139738" },
                  experience: { id: "0" },
                  characteristics: { eventToken: "metric-token" },
                },
                items: [defaultItem, metricItem],
              },
            ],
          },
        ],
      });
    },
  );

// Target performs the server-side merge, so this must use live Edge.
test("C5805676: live Target merges default content and measurement", async ({
  alloy,
  networkRecorder,
}) => {
  await alloy("configure", {
    orgId: "5BFE274A5F6980A50A495C08@AdobeOrg",
    datastreamId: "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83",
    edgeDomain: "edge.adobedc.net",
    edgeBasePath: "ee",
    debugEnabled: true,
  });
  const result = await alloy("sendEvent", {
    decisionScopes: ["form-based-scope"],
    xdm: {
      web: {
        webPageDetails: {
          URL: "https://alloyio.com/functional-test/testPage.html?test=C5805676",
        },
      },
    },
  });
  const calls = await networkRecorder.findCalls(/v1\/interact/);
  const payload = calls[0].response.body.handle
    .filter((handle) => handle.type === "personalization:decisions")
    .flatMap((handle) => handle.payload);
  const proposition = payload.find((p) => p.scope === "form-based-scope");
  expect(proposition?.items).toEqual([
    expect.objectContaining({
      schema: defaultItem.schema,
      meta: defaultItem.meta,
    }),
    metricItem,
  ]);
  expect(
    result.propositions.find((p) => p.scope === "form-based-scope"),
  ).toEqual(
    expect.objectContaining({
      items: proposition.items,
      renderAttempted: false,
    }),
  );
}, 30000);

test("C5805676: merged default and metric items are returned together without rendering", async ({
  alloy,
  worker,
  networkRecorder,
}) => {
  worker.use(makeHandler("form-based-scope"));
  await alloy("configure", alloyConfig);
  const result = await alloy("sendEvent", {
    decisionScopes: ["form-based-scope"],
  });
  const calls = await networkRecorder.findCalls(/v1\/interact/);
  expect(calls).toHaveLength(1);
  expect(calls[0].response.status).toBe(200);
  const query = calls[0].request.body.events[0].query.personalization;
  expect(query.decisionScopes).toEqual(["form-based-scope", "__view__"]);
  expect(query.schemas).toEqual(
    expect.arrayContaining([
      "https://ns.adobe.com/personalization/default-content-item",
      "https://ns.adobe.com/personalization/dom-action",
      "https://ns.adobe.com/personalization/html-content-item",
      "https://ns.adobe.com/personalization/json-content-item",
      "https://ns.adobe.com/personalization/redirect-item",
    ]),
  );
  expect(result.propositions).toEqual([
    expect.objectContaining({
      scope: "form-based-scope",
      items: [defaultItem, metricItem],
      renderAttempted: false,
    }),
  ]);
});

test("C5805676: rendered merged default content sends its display metadata", async ({
  alloy,
  worker,
  networkRecorder,
}) => {
  worker.use(makeHandler("__view__"));
  await alloy("configure", alloyConfig);
  await alloy("sendEvent", { renderDecisions: true });
  const calls = await networkRecorder.findCalls(/v1\/interact/, {
    retries: 30,
    delayMs: 100,
    minCalls: 2,
  });
  expect(calls).toHaveLength(2);
  const proposition = calls[0].response.body.handle[0].payload[0];
  const xdm = calls[1].request.body.events[0].xdm;
  expect(xdm.eventType).toBe("decisioning.propositionDisplay");
  expect(xdm._experience.decisioning.propositionEventType.display).toBe(1);
  expect(xdm._experience.decisioning.propositions).toEqual([
    {
      id: proposition.id,
      scope: proposition.scope,
      scopeDetails: proposition.scopeDetails,
    },
  ]);
});
