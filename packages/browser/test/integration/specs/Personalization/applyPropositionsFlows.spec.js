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
import alloyConfig from "../../helpers/alloy/config.js";
import { test, expect } from "../../helpers/testsSetup/extend.js";
import { appendHtmlToBody } from "../../helpers/utils/domHelpers.js";

const interact = /https:\/\/edge.adobedc.net\/ee\/.*\/?v1\/interact/;
const pageWide = "__view__";
const schemas = [
  "https://ns.adobe.com/personalization/default-content-item",
  "https://ns.adobe.com/personalization/dom-action",
  "https://ns.adobe.com/personalization/html-content-item",
  "https://ns.adobe.com/personalization/json-content-item",
  "https://ns.adobe.com/personalization/redirect-item",
];
const getPayload = (call) =>
  call.response.body.handle.find(
    ({ type }) => type === "personalization:decisions",
  ).payload;
const metadata = ({ id, scope, scopeDetails }) => ({ id, scope, scopeDetails });
const calls = (recorder, minCalls) =>
  recorder.findCalls(interact, { retries: 30, delayMs: 100, minCalls });
const noExtraCalls = async (recorder, count) => {
  await recorder.waitForIdle();
  expect(
    await recorder.findCalls(interact, {
      retries: 5,
      delayMs: 100,
      minCalls: count + 1,
    }),
  ).toHaveLength(count);
};
const element = (id, text) => {
  const [el] = appendHtmlToBody("<div></div>");
  el.id = id;
  el.textContent = text;
  return el;
};
const fixtureHandler = (fixture) =>
  http.post(interact, async ({ request }) => {
    const body = await request.json();
    if (body.events[0].query?.personalization) {
      return HttpResponse.text(
        await server.commands.readFile(
          `${server.config.root}/packages/browser/test/integration/helpers/mocks/${fixture}`,
        ),
      );
    }
    return HttpResponse.json({ requestId: "notification", handle: [] });
  });

test("C6364797: apply previously unrendered page-wide propositions without a request", async ({
  alloy,
  worker,
  networkRecorder,
}) => {
  const target = element("apply-pagewide", "Original content");
  const decisionContent =
    '<div id="C28755">Here is an awesome target offer!</div>';
  worker.use(
    http.post(interact, () =>
      HttpResponse.json({
        requestId: "pagewide",
        handle: [
          {
            type: "personalization:decisions",
            eventIndex: 0,
            payload: [
              {
                id: "AT:pagewide",
                scope: pageWide,
                scopeDetails: {
                  decisionProvider: "TGT",
                  activity: { id: "pagewide" },
                  experience: { id: "0" },
                },
                items: [
                  {
                    id: "pagewide-item",
                    schema: schemas[1],
                    data: {
                      type: "setHtml",
                      format: "application/vnd.adobe.target.dom-action",
                      selector: "#apply-pagewide",
                      content: decisionContent,
                    },
                  },
                ],
              },
            ],
          },
        ],
      }),
    ),
  );
  await alloy("configure", alloyConfig);
  const result = await alloy("sendEvent", { renderDecisions: false });
  const initialCalls = await calls(networkRecorder, 1);
  expect(initialCalls).toHaveLength(1);
  expect(initialCalls[0].response.status).toBe(200);
  const query = initialCalls[0].request.body.events[0].query.personalization;
  expect(query.decisionScopes).toEqual([pageWide]);
  expect(query.schemas).toEqual(expect.arrayContaining(schemas));
  expect(getPayload(initialCalls[0])[0].items[0].data.content).toBe(
    decisionContent,
  );
  expect(result.decisions).toHaveLength(1);
  expect(result.decisions[0].scope).toBe(pageWide);
  expect(result.decisions[0].items[0].data.content).toBe(decisionContent);
  expect(result.propositions).toHaveLength(1);
  expect(result.propositions[0].renderAttempted).toBe(false);
  expect(target.textContent).toBe("Original content");
  const applied = await alloy("applyPropositions", {
    propositions: result.propositions,
  });
  expect(applied.propositions).toHaveLength(1);
  expect(applied.propositions[0].renderAttempted).toBe(true);
  expect(target.innerHTML).toBe(decisionContent);
  await noExtraCalls(networkRecorder, 1);
});

test("C6364799: apply HTML content using scope metadata without a request", async ({
  alloy,
  worker,
  networkRecorder,
}) => {
  const target = element("apply-home-item1", "Original content");
  worker.use(fixtureHandler("personalizationFormBasedResponse.json"));
  await alloy("configure", alloyConfig);
  const result = await alloy("sendEvent", {
    decisionScopes: ["alloy-test-scope-1"],
  });
  const initialCalls = await calls(networkRecorder, 1);
  expect(initialCalls).toHaveLength(1);
  expect(initialCalls[0].response.status).toBe(200);
  const query = initialCalls[0].request.body.events[0].query.personalization;
  expect(query.decisionScopes).toEqual(["alloy-test-scope-1", pageWide]);
  expect(query.schemas).toEqual(
    expect.arrayContaining(schemas.filter((schema) => schema !== schemas[1])),
  );
  expect(result.decisions[0].renderAttempted).toBeUndefined();
  expect(result.propositions[0].renderAttempted).toBe(false);
  const decision = result.decisions.find(
    ({ scope }) => scope === "alloy-test-scope-1",
  );
  expect(decision.id).toBe(
    "AT:eyJhY3Rpdml0eUlkIjoiMTI2NDg2IiwiZXhwZXJpZW5jZUlkIjoiMCJ9",
  );
  expect(decision.items[0].data.content).toBe(
    "<h3>welcome to TARGET AWESOME WORLD!!! </h3>",
  );
  const applied = await alloy("applyPropositions", {
    propositions: [
      {
        id: "AT:eyJhY3Rpdml0eUlkIjoiNDQyMzU4IiwiZXhwZXJpZW5jZUlkIjoiIn1=",
        scope: "alloy-test-scope-1",
        scopeDetails: { decisionProvider: "TGT" },
        items: [
          {
            id: "442359",
            schema: schemas[2],
            data: {
              content: "<p>Some custom content for the home page</p>",
              format: "text/html",
              id: "1202448",
            },
          },
        ],
      },
    ],
    metadata: {
      "alloy-test-scope-1": {
        selector: "#apply-home-item1",
        actionType: "setHtml",
      },
    },
  });
  expect(applied.propositions).toHaveLength(1);
  expect(applied.propositions[0].renderAttempted).toBe(true);
  expect(target.innerHTML).toBe("<p>Some custom content for the home page</p>");
  await noExtraCalls(networkRecorder, 1);
});

test("C6364798: re-render a cached SPA view without another notification", async ({
  alloy,
  worker,
  networkRecorder,
}) => {
  const page = element("pageWideScope", "original page wide");
  const products = element(
    "personalization-products-container",
    "original products",
  );
  const cart = element("personalization-cart-container", "original cart");
  worker.use(fixtureHandler("personalizationSpaResponse.json"));
  await alloy("configure", alloyConfig);
  const initial = await alloy("sendEvent", {
    renderDecisions: true,
    xdm: { web: { webPageDetails: { viewName: "products" } } },
  });
  const pageCalls = await calls(networkRecorder, 2);
  expect(pageCalls).toHaveLength(2);
  expect([200, 207]).toContain(pageCalls[0].response.status);
  const query = pageCalls[0].request.body.events[0].query.personalization;
  expect(query.decisionScopes).toEqual([pageWide]);
  expect(query.schemas).toEqual(expect.arrayContaining(schemas));
  const payload = getPayload(pageCalls[0]);
  expect(payload).toHaveLength(3);
  expect(page.textContent).toBe("test for a page wide scope");
  expect(products.textContent).toBe("This is product view");
  const display = pageCalls[1].request.body.events[0].xdm;
  expect(display.eventType).toBe("decisioning.propositionDisplay");
  expect(display._experience.decisioning).toEqual({
    propositions: payload
      .filter(({ scope }) => [pageWide, "products"].includes(scope))
      .map(metadata),
    propositionEventType: { display: 1 },
  });
  expect(initial.propositions).toHaveLength(2);
  expect(
    initial.propositions.every(
      ({ renderAttempted }) => renderAttempted === true,
    ),
  ).toBe(true);

  const view = await alloy("sendEvent", {
    renderDecisions: true,
    decisionScopes: [],
    xdm: { web: { webPageDetails: { viewName: "Cart" } } },
  });
  const viewCalls = await calls(networkRecorder, 3);
  expect(viewCalls).toHaveLength(3);
  const viewEvent = viewCalls[2].request.body.events[0];
  expect(viewEvent.query).toBeUndefined();
  expect(viewEvent.xdm._experience.decisioning).toEqual({
    propositions: payload.filter(({ scope }) => scope === "cart").map(metadata),
    propositionEventType: { display: 1 },
  });
  expect(view.propositions).toHaveLength(1);
  expect(view.propositions[0].renderAttempted).toBe(true);
  expect(cart.textContent).toBe("This is cart view");

  cart.textContent = "reset before re-render";
  const applied = await alloy("applyPropositions", {
    propositions: view.propositions,
  });
  expect(applied.propositions).toHaveLength(view.propositions.length);
  expect(applied.propositions[0].renderAttempted).toBe(true);
  expect(cart.textContent).toBe("This is cart view");
  await noExtraCalls(networkRecorder, 3);

  cart.textContent = "reset before cached re-render";
  const cached = await alloy("applyPropositions", {
    propositions: initial.propositions.filter(
      ({ scope }) => scope === pageWide,
    ),
    viewName: "Cart",
  });
  expect(cached.propositions).toHaveLength(1);
  expect(cached.propositions[0].renderAttempted).toBe(true);
  expect(cart.textContent).toBe("This is cart view");
  await noExtraCalls(networkRecorder, 3);

  await alloy("sendEvent", {
    renderDecisions: true,
    decisionScopes: [],
    xdm: {
      eventType: "noviewoffers",
      web: { webPageDetails: { viewName: "noView" } },
    },
  });
  const noViewCalls = await calls(networkRecorder, 4);
  expect(noViewCalls).toHaveLength(4);
  const noView = noViewCalls[3].request.body.events[0];
  expect(noView.query).toBeUndefined();
  expect(noView.xdm.eventType).toBe("noviewoffers");
  expect(noView.xdm.web.webPageDetails.viewName).toBe("noView");
  expect(noView.xdm._experience.decisioning.propositions).toEqual([
    {
      scope: "noView",
      scopeDetails: { characteristics: { scopeType: "view" } },
    },
  ]);
}, 30000);
