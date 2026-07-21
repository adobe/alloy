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

/*
 * Covers SPA-related personalization tests migrated from functional tests:
 *
 * C782718 — SPA support with auto-rendering and view notifications.
 * C782719 — SPA support with auto-rendering disabled.
 * C14286730 — Target SPA click interaction includes viewName in notification.
 *
 * CSP nonce behavior remains covered by the functional tests C753469 and C753470:
 * https://github.com/adobe/alloy/blob/main/packages/browser/test/functional/specs/Personalization/C753469.js
 * https://github.com/adobe/alloy/blob/main/packages/browser/test/functional/specs/Personalization/C753470.js
 * Vitest browser mode owns the runner document, so a spec cannot deliver a real
 * CSP before Alloy loads. Adding CSP dynamically would not exercise browser
 * enforcement or Alloy's page-load nonce discovery.
 */

import { http, HttpResponse } from "msw";
import { server } from "vitest/browser";
import alloyConfig from "../../helpers/alloy/config.js";
import {
  describe,
  test,
  expect,
  beforeEach,
} from "../../helpers/testsSetup/extend.js";

const { readFile } = server.commands;
const PAGE_WIDE_SCOPE = "__view__";
const PERSONALIZATION_SCHEMAS = [
  "https://ns.adobe.com/personalization/default-content-item",
  "https://ns.adobe.com/personalization/dom-action",
  "https://ns.adobe.com/personalization/html-content-item",
  "https://ns.adobe.com/personalization/json-content-item",
  "https://ns.adobe.com/personalization/redirect-item",
];

const getPersonalizationPayload = (call) =>
  call.response.body.handle.find(
    ({ type }) => type === "personalization:decisions",
  ).payload;

const getPropositionMeta = ({ id, scope, scopeDetails }) => ({
  id,
  scope,
  scopeDetails,
});

const spaPersonalizationHandler = http.post(
  /https:\/\/edge.adobedc.net\/ee\/.*\/?v1\/interact/,
  async (req) => {
    const url = new URL(req.request.url);
    if (
      url.searchParams.get("configId") !==
      "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83"
    ) {
      throw new Error("Handler not configured properly");
    }

    const requestBody = await req.request.json();
    const hasPersonalizationQuery =
      requestBody?.events?.[0]?.query?.personalization?.schemas?.length > 0;

    if (hasPersonalizationQuery) {
      return HttpResponse.text(
        await readFile(
          `${server.config.root}/packages/browser/test/integration/helpers/mocks/personalizationSpaResponse.json`,
        ),
      );
    }

    return HttpResponse.json({
      requestId: `spa-notification-${Date.now()}`,
      handle: [],
    });
  },
);

// ---------------------------------------------------------------------------
// C782718 — SPA support with auto-rendering and view notifications
// ---------------------------------------------------------------------------

describe("C782718: SPA support with auto-rendering and view notifications", () => {
  beforeEach(() => {
    // Set up SPA DOM structure
    const pageWideEl = document.createElement("div");
    pageWideEl.id = "pageWideScope";
    pageWideEl.textContent = "original page wide";
    document.body.appendChild(pageWideEl);

    const productsEl = document.createElement("div");
    productsEl.id = "personalization-products-container";
    productsEl.textContent = "original products";
    document.body.appendChild(productsEl);

    const cartEl = document.createElement("div");
    cartEl.id = "personalization-cart-container";
    cartEl.textContent = "original cart";
    document.body.appendChild(cartEl);

    return () => {
      [
        "pageWideScope",
        "personalization-products-container",
        "personalization-cart-container",
      ].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.parentNode.removeChild(el);
      });
    };
  });

  test("page load renders page-wide and view offers, sends display notification", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(spaPersonalizationHandler);
    await alloy("configure", alloyConfig);

    const resultingObject = await alloy("sendEvent", {
      renderDecisions: true,
      xdm: {
        web: { webPageDetails: { viewName: "products" } },
      },
    });

    const pageWideEl = document.getElementById("pageWideScope");
    expect(pageWideEl.textContent).toBe("test for a page wide scope");
    const productsEl = document.getElementById(
      "personalization-products-container",
    );
    expect(productsEl.textContent).toBe("This is product view");

    const calls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 30,
      delayMs: 100,
      minCalls: 2,
    });
    expect(calls).toHaveLength(2);

    const sendEventCall = calls[0];
    const personalizationQuery =
      sendEventCall.request.body.events[0].query.personalization;
    expect(personalizationQuery.decisionScopes).toEqual([PAGE_WIDE_SCOPE]);
    expect(personalizationQuery.schemas).toEqual(
      expect.arrayContaining(PERSONALIZATION_SCHEMAS),
    );

    const personalizationPayload = getPersonalizationPayload(sendEventCall);
    expect(personalizationPayload).toHaveLength(3);

    const displayXdm = calls[1].request.body.events[0].xdm;
    expect(displayXdm.eventType).toBe("decisioning.propositionDisplay");
    expect(displayXdm._experience.decisioning).toEqual({
      propositions: personalizationPayload
        .filter(({ scope }) => [PAGE_WIDE_SCOPE, "products"].includes(scope))
        .map(getPropositionMeta),
      propositionEventType: { display: 1 },
    });
    expect(resultingObject.propositions).toHaveLength(2);
    expect(
      resultingObject.propositions.every(({ renderAttempted }) =>
        Boolean(renderAttempted),
      ),
    ).toBe(true);
  });

  test("view change uses cached proposals, sends display notification, no personalization query", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(spaPersonalizationHandler);
    await alloy("configure", alloyConfig);

    await alloy("sendEvent", {
      renderDecisions: true,
      xdm: { web: { webPageDetails: { viewName: "products" } } },
    });

    const pageLoadCalls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 30,
      delayMs: 100,
      minCalls: 2,
    });
    const personalizationPayload = getPersonalizationPayload(pageLoadCalls[0]);

    const viewChangeResult = await alloy("sendEvent", {
      renderDecisions: true,
      decisionScopes: [],
      xdm: { web: { webPageDetails: { viewName: "cart" } } },
    });

    const allCalls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 30,
      delayMs: 100,
      minCalls: 3,
    });

    expect(allCalls).toHaveLength(3);
    const viewChangeCall = allCalls[2];
    expect(
      viewChangeCall.request.body.events[0].xdm.web.webPageDetails.viewName,
    ).toBe("cart");
    expect(viewChangeCall.request.body.events[0].query).toBeUndefined();
    expect(
      viewChangeCall.request.body.events[0].xdm._experience.decisioning,
    ).toEqual({
      propositions: personalizationPayload
        .filter(({ scope }) => scope === "cart")
        .map(getPropositionMeta),
      propositionEventType: { display: 1 },
    });
    expect(
      viewChangeResult.propositions.every(({ renderAttempted }) =>
        Boolean(renderAttempted),
      ),
    ).toBe(true);
    expect(
      document.getElementById("personalization-cart-container").textContent,
    ).toBe("This is cart view");
  });

  test("view change for non-existing view sends notification with empty propositions marker", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(spaPersonalizationHandler);
    await alloy("configure", alloyConfig);

    await alloy("sendEvent", {
      renderDecisions: true,
      xdm: { web: { webPageDetails: { viewName: "products" } } },
    });

    await networkRecorder.findCalls(/v1\/interact/, {
      retries: 30,
      delayMs: 100,
      minCalls: 2,
    });

    await alloy("sendEvent", {
      renderDecisions: true,
      decisionScopes: [],
      xdm: {
        eventType: "noviewoffers",
        web: { webPageDetails: { viewName: "noView" } },
      },
    });

    const allCalls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 30,
      delayMs: 100,
      minCalls: 3,
    });

    expect(allCalls).toHaveLength(3);
    const noViewCall = allCalls[2];
    expect(noViewCall.request.body.events[0].query).toBeUndefined();
    const noViewXdm = noViewCall.request.body.events[0].xdm;
    expect(noViewXdm.eventType).toBe("noviewoffers");
    expect(noViewXdm.web.webPageDetails.viewName).toBe("noView");
    expect(noViewXdm._experience.decisioning).toEqual({
      propositions: [
        {
          scope: "noView",
          scopeDetails: { characteristics: { scopeType: "view" } },
        },
      ],
      propositionEventType: { display: 1 },
    });
  });
});

// ---------------------------------------------------------------------------
// C782719 — SPA support with auto-rendering disabled
// ---------------------------------------------------------------------------

describe("C782719: SPA support with auto-rendering disabled", () => {
  beforeEach(() => {
    const pageWideEl = document.createElement("div");
    pageWideEl.id = "pageWideScope";
    document.body.appendChild(pageWideEl);

    const productsEl = document.createElement("div");
    productsEl.id = "personalization-products-container";
    document.body.appendChild(productsEl);

    const cartEl = document.createElement("div");
    cartEl.id = "personalization-cart-container";
    document.body.appendChild(cartEl);

    return () => {
      [
        "pageWideScope",
        "personalization-products-container",
        "personalization-cart-container",
      ].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.parentNode.removeChild(el);
      });
    };
  });

  test("page load with renderDecisions=false returns propositions without rendering", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(spaPersonalizationHandler);
    await alloy("configure", alloyConfig);

    const resultingObject = await alloy("sendEvent", {
      renderDecisions: false,
      xdm: { web: { webPageDetails: { viewName: "products" } } },
    });

    const calls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 10,
      delayMs: 100,
      minCalls: 1,
    });
    expect(calls).toHaveLength(1);

    const personalizationQuery =
      calls[0].request.body.events[0].query.personalization;
    expect(personalizationQuery.decisionScopes).toEqual([PAGE_WIDE_SCOPE]);
    expect(personalizationQuery.schemas).toEqual(
      expect.arrayContaining(PERSONALIZATION_SCHEMAS),
    );
    expect(getPersonalizationPayload(calls[0])).toHaveLength(3);
    expect(resultingObject.propositions).toHaveLength(2);
    expect(
      resultingObject.propositions.every(({ scope }) =>
        [PAGE_WIDE_SCOPE, "products"].includes(scope),
      ),
    ).toBe(true);
    expect(
      resultingObject.propositions.every(
        ({ renderAttempted }) => !renderAttempted,
      ),
    ).toBe(true);
  });

  test("view change with renderDecisions=false returns unrendered propositions", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(spaPersonalizationHandler);
    await alloy("configure", alloyConfig);

    await alloy("sendEvent", {
      renderDecisions: false,
      xdm: { web: { webPageDetails: { viewName: "products" } } },
    });

    const viewChangeResult = await alloy("sendEvent", {
      renderDecisions: false,
      xdm: { web: { webPageDetails: { viewName: "cart" } } },
    });

    const calls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 10,
      delayMs: 100,
      minCalls: 2,
    });
    expect(calls).toHaveLength(2);
    const cartCall = calls[1];
    expect(
      cartCall.request.body.events[0].xdm.web.webPageDetails.viewName,
    ).toBe("cart");
    expect(cartCall.request.body.events[0].query).toBeUndefined();
    expect(
      viewChangeResult.propositions.every(
        ({ renderAttempted }) => !renderAttempted,
      ),
    ).toBe(true);
  });

  test("view change for non-existing view returns empty propositions array", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(spaPersonalizationHandler);
    await alloy("configure", alloyConfig);

    await alloy("sendEvent", {
      renderDecisions: false,
      xdm: { web: { webPageDetails: { viewName: "products" } } },
    });

    const noViewResult = await alloy("sendEvent", {
      renderDecisions: true,
      xdm: { web: { webPageDetails: { viewName: "noView" } } },
    });

    expect(noViewResult.propositions).toEqual([]);
    const calls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 10,
      delayMs: 100,
      minCalls: 2,
    });
    expect(calls).toHaveLength(2);
    expect(calls[1].request.body.events[0].query).toBeUndefined();
    expect(
      calls[1].request.body.events[0].xdm.web.webPageDetails.viewName,
    ).toBe("noView");
  });
});

// ---------------------------------------------------------------------------
// C14286730 — Target SPA click interaction includes viewName in notification
// ---------------------------------------------------------------------------

describe("C14286730: Target SPA click interaction includes viewName", () => {
  beforeEach(() => {
    [
      ["pageWideScope", "Page wide"],
      ["personalization-products-container", "Products"],
      ["personalization-cart-container", "Cart"],
    ].forEach(([id, textContent]) => {
      const element = document.createElement("div");
      element.id = id;
      element.textContent = textContent;
      document.body.appendChild(element);
    });

    return () => {
      [
        "pageWideScope",
        "personalization-products-container",
        "personalization-cart-container",
      ].forEach((id) => document.getElementById(id)?.remove());
    };
  });

  test("click interaction includes the originating viewName", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(spaPersonalizationHandler);
    await alloy("configure", {
      ...alloyConfig,
      clickCollection: { eventGroupingEnabled: false },
      autoCollectPropositionInteractions: { TGT: "always" },
    });

    await alloy("sendEvent", {
      renderDecisions: true,
      xdm: { web: { webPageDetails: { viewName: "products" } } },
    });

    const initialCalls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 30,
      delayMs: 100,
      minCalls: 2,
    });
    expect(initialCalls).toHaveLength(2);

    const clickTarget = document.querySelector(".clickme");
    expect(clickTarget).not.toBeNull();
    clickTarget.click();

    const displayCall = initialCalls[1];
    expect(displayCall.request.body.events[0].xdm.eventType).toBe(
      "decisioning.propositionDisplay",
    );
    expect(
      displayCall.request.body.events[0].xdm.web.webPageDetails.viewName,
    ).toBe("products");

    const calls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 30,
      delayMs: 100,
      minCalls: 3,
    });
    expect(calls).toHaveLength(3);

    const interactXdm = calls[2].request.body.events[0].xdm;
    expect(interactXdm.eventType).toBe("decisioning.propositionInteract");
    expect(interactXdm.web.webPageDetails.viewName).toBe("products");
    expect(interactXdm._experience.decisioning).toEqual({
      propositions: [
        {
          ...getPropositionMeta(getPersonalizationPayload(calls[0])[1]),
          items: [{ id: "200001-products-item" }],
        },
      ],
      propositionEventType: { interact: 1 },
    });
  });
});
