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
 * Covers proposition interaction tracking tests migrated from functional tests:
 *
 * C17409728 — autoCollectPropositionInteractions: ALWAYS, NEVER, DECORATED_ELEMENTS_ONLY
 *             and applyPropositions with DOM_ACTION_COLLECT_INTERACTIONS.
 *             Also covers "includeRenderedPropositions" in bottom-of-page sendEvent.
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
import { sendEventHandler } from "../../helpers/mswjs/handlers.js";

const { readFile } = server.commands;

// ---------------------------------------------------------------------------
// Constants imported from source (mirrored to avoid import issues in browser)
// ---------------------------------------------------------------------------
const ADOBE_JOURNEY_OPTIMIZER = "AJO";
const ALWAYS = "always";
const NEVER = "never";
const DECORATED_ELEMENTS_ONLY = "decoratedElementsOnly";
const CLICK_LABEL_DATA_ATTRIBUTE = "data-aep-click-label";
const INTERACT_ID_DATA_ATTRIBUTE = "data-aep-interact-id";
const DOM_ACTION_COLLECT_INTERACTIONS = "collectInteractions";
const DISPLAY = "decisioning.propositionDisplay";
const INTERACT = "decisioning.propositionInteract";
const INTERACTION_SETTLE_TIME = 250;

const getEvents = (calls) =>
  calls.flatMap(({ request }) => request.body.events ?? []);

const waitForDisplayNotification = async (networkRecorder) => {
  const calls = await networkRecorder.findCalls(/v1\/interact/, {
    retries: 30,
    delayMs: 100,
    minCalls: 1,
  });
  expect(getEvents(calls).some(({ xdm }) => xdm.eventType === DISPLAY)).toBe(
    true,
  );
};

const getInteractionCalls = async (networkRecorder) => {
  await networkRecorder.findCalls(/v1\/interact/, {
    retries: 30,
    delayMs: 100,
    minCalls: 1,
  });
  await new Promise((resolve) => setTimeout(resolve, INTERACTION_SETTLE_TIME));
  return networkRecorder.calls.filter(({ request }) =>
    /v1\/interact/.test(request?.url ?? ""),
  );
};

const expectInteraction = (calls, propositionId, itemId) => {
  expect(calls).toHaveLength(1);
  expect(calls[0].response.status).toBe(204);

  const interactionEvent = getEvents(calls).find(
    ({ xdm }) => xdm.eventType === INTERACT,
  );
  expect(interactionEvent).toBeDefined();
  expect(interactionEvent.xdm._experience.decisioning.propositions).toEqual([
    expect.objectContaining({
      id: propositionId,
      items: [{ id: itemId }],
    }),
  ]);
};

// ---------------------------------------------------------------------------
// Helper — builds a mock edge response with the given items
// ---------------------------------------------------------------------------
const buildResponseWithItems = (propositionId, activityId, items) => ({
  requestId: `interaction-test-${Date.now()}`,
  handle: [
    {
      payload: [{ id: "ecid-interact", namespace: { code: "ECID" } }],
      type: "identity:result",
    },
    {
      payload: [
        {
          id: propositionId,
          scope: "web://aepdemo.com/",
          scopeDetails: {
            decisionProvider: ADOBE_JOURNEY_OPTIMIZER,
            correlationID: "6dae465b-9553-4fc6-b7d4-6c9979c88f21-0",
            characteristics: {
              eventToken: "interact-event-token",
            },
            activity: { id: activityId },
          },
          items,
        },
      ],
      type: "personalization:decisions",
      eventIndex: 0,
    },
  ],
});

// MSW handler for interaction tests that also handles display notification
// responses (returns 204 for those).
const interactionRequestHandler = http.post(
  /https:\/\/edge.adobedc.net\/ee\/.*\/?v1\/interact/,
  async (req) => {
    const url = new URL(req.request.url);
    const configId = url.searchParams.get("configId");
    if (!configId?.startsWith("bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83")) {
      throw new Error("Handler not configured properly");
    }
    const requestBody = await req.request.json();
    const eventType = requestBody?.events?.[0]?.xdm?.eventType;
    // For display or interact notifications return 204
    if (
      eventType === "decisioning.propositionDisplay" ||
      eventType === "decisioning.propositionInteract"
    ) {
      return new HttpResponse(null, { status: 204 });
    }
    // Otherwise return empty event response
    return HttpResponse.text(
      await readFile(
        `${server.config.root}/packages/browser/test/integration/helpers/mocks/emptyEventResponse.json`,
      ),
    );
  },
);

// ---------------------------------------------------------------------------
// C17409728 — autoCollectPropositionInteractions: ALWAYS
// ---------------------------------------------------------------------------

describe("C17409728: automatically sends interact event when ALWAYS is configured", () => {
  let pageHeader;

  beforeEach(() => {
    pageHeader = document.createElement("h1");
    pageHeader.id = "page-header";
    pageHeader.textContent = "Hello World!";
    document.body.appendChild(pageHeader);
    return () => {
      if (pageHeader.parentNode) pageHeader.parentNode.removeChild(pageHeader);
      const inserted = document.getElementById("something");
      if (inserted) inserted.parentNode.removeChild(inserted);
    };
  });

  test("clicking rendered proposition sends an interact event", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(interactionRequestHandler);

    const propositionId = `prop-always-${Date.now()}`;
    const itemId = `item-always-${Date.now()}`;
    const responseBody = buildResponseWithItems(
      propositionId,
      `activity-always-${Date.now()}`,
      [
        {
          id: itemId,
          schema: "https://ns.adobe.com/personalization/dom-action",
          data: {
            type: "insertBefore",
            content: '<div id="something">This is something</div>',
            selector: "#page-header",
          },
        },
      ],
    );

    await alloy("configure", {
      ...alloyConfig,
      autoCollectPropositionInteractions: {
        [ADOBE_JOURNEY_OPTIMIZER]: ALWAYS,
      },
    });

    await alloy("applyResponse", {
      renderDecisions: true,
      responseBody,
    });

    // Verify the element has the interact-id attribute
    const inserted = document.getElementById("something");
    expect(inserted).not.toBeNull();
    expect(inserted.hasAttribute(INTERACT_ID_DATA_ATTRIBUTE)).toBe(true);

    await waitForDisplayNotification(networkRecorder);
    networkRecorder.reset();

    inserted.click();

    const calls = await getInteractionCalls(networkRecorder);
    expectInteraction(calls, propositionId, itemId);
  });
});

// ---------------------------------------------------------------------------
// C17409728 — autoCollectPropositionInteractions: NEVER
// ---------------------------------------------------------------------------

describe("C17409728: does not send interact event when NEVER is configured", () => {
  let pageHeader;

  beforeEach(() => {
    pageHeader = document.createElement("h1");
    pageHeader.id = "page-header";
    pageHeader.textContent = "Hello World!";
    document.body.appendChild(pageHeader);
    return () => {
      if (pageHeader.parentNode) pageHeader.parentNode.removeChild(pageHeader);
      const el = document.getElementById("something-else");
      if (el) el.parentNode.removeChild(el);
    };
  });

  test("clicking rendered proposition does NOT send an interact event", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(interactionRequestHandler);

    const propositionId = `prop-never-${Date.now()}`;
    const itemId = `item-never-${Date.now()}`;
    const responseBody = buildResponseWithItems(
      propositionId,
      `activity-never-${Date.now()}`,
      [
        {
          id: itemId,
          schema: "https://ns.adobe.com/personalization/dom-action",
          data: {
            type: "insertAfter",
            content: '<div id="something-else">This is something else</div>',
            selector: "#page-header",
          },
        },
      ],
    );

    await alloy("configure", {
      ...alloyConfig,
      autoCollectPropositionInteractions: {
        [ADOBE_JOURNEY_OPTIMIZER]: NEVER,
      },
    });

    await alloy("applyResponse", {
      renderDecisions: true,
      responseBody,
    });

    const inserted = document.getElementById("something-else");
    expect(inserted).not.toBeNull();
    expect(inserted.hasAttribute(INTERACT_ID_DATA_ATTRIBUTE)).toBe(false);

    await waitForDisplayNotification(networkRecorder);
    networkRecorder.reset();

    inserted.click();

    await new Promise((resolve) =>
      setTimeout(resolve, INTERACTION_SETTLE_TIME),
    );
    const calls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 3,
      delayMs: 50,
    });
    expect(calls.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// C17409728 — autoCollectPropositionInteractions: DECORATED_ELEMENTS_ONLY
// ---------------------------------------------------------------------------

describe("C17409728: only decorated elements trigger interact events", () => {
  let pageHeader;

  beforeEach(() => {
    pageHeader = document.createElement("h1");
    pageHeader.id = "page-header";
    pageHeader.textContent = "Hello World!";
    document.body.appendChild(pageHeader);
    return () => {
      if (pageHeader.parentNode) pageHeader.parentNode.removeChild(pageHeader);
      const el = document.getElementById("some-list");
      if (el) el.parentNode.removeChild(el);
    };
  });

  test("clicking non-decorated element does NOT send interact; clicking decorated span DOES", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(interactionRequestHandler);

    const propositionId = `prop-decorated-${Date.now()}`;
    const itemId = `item-decorated-${Date.now()}`;
    const responseBody = buildResponseWithItems(
      propositionId,
      `activity-decorated-${Date.now()}`,
      [
        {
          id: itemId,
          schema: "https://ns.adobe.com/personalization/dom-action",
          data: {
            type: "insertAfter",
            content: `<ul id="some-list">
                        <li id="some-list-item-a">one</li>
                        <li id="some-list-item-b">two</li>
                        <li id="some-list-item-c">three <span id="some-list-item-span" ${CLICK_LABEL_DATA_ATTRIBUTE}="click-me-here">yippie</span></li>
                      </ul>`,
            selector: "#page-header",
          },
        },
      ],
    );

    await alloy("configure", {
      ...alloyConfig,
      autoCollectPropositionInteractions: {
        [ADOBE_JOURNEY_OPTIMIZER]: DECORATED_ELEMENTS_ONLY,
      },
    });

    await alloy("applyResponse", {
      renderDecisions: true,
      responseBody,
    });

    const list = document.getElementById("some-list");
    expect(list).not.toBeNull();
    expect(list.hasAttribute(INTERACT_ID_DATA_ATTRIBUTE)).toBe(true);

    await waitForDisplayNotification(networkRecorder);
    networkRecorder.reset();

    const itemA = document.getElementById("some-list-item-a");
    expect(itemA).not.toBeNull();
    itemA.click();

    await new Promise((resolve) =>
      setTimeout(resolve, INTERACTION_SETTLE_TIME),
    );
    const callsAfterNonDecorated = await networkRecorder.findCalls(
      /v1\/interact/,
      { retries: 3, delayMs: 50 },
    );
    expect(callsAfterNonDecorated.length).toBe(0);

    networkRecorder.reset();
    const span = document.getElementById("some-list-item-span");
    expect(span).not.toBeNull();
    span.click();

    const callsAfterDecorated = await getInteractionCalls(networkRecorder);
    expectInteraction(callsAfterDecorated, propositionId, itemId);
  });
});

// ---------------------------------------------------------------------------
// C17409728 — applyPropositions with DOM_ACTION_COLLECT_INTERACTIONS
// ---------------------------------------------------------------------------

describe("C17409728: applyPropositions with collectInteractions action type", () => {
  let pageHeader;

  beforeEach(() => {
    pageHeader = document.createElement("h1");
    pageHeader.id = "page-header";
    pageHeader.textContent = "Hello World!";
    document.body.appendChild(pageHeader);
    return () => {
      if (pageHeader.parentNode) pageHeader.parentNode.removeChild(pageHeader);
    };
  });

  test("clicking element decorated via applyPropositions sends interact event", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(interactionRequestHandler);

    const propositionId = `prop-collect-${Date.now()}`;
    const itemId = `item-collect-${Date.now()}`;
    const responseBody = buildResponseWithItems(
      propositionId,
      `activity-collect-${Date.now()}`,
      [
        {
          id: itemId,
          schema: "https://ns.adobe.com/personalization/json-content-item",
          data: {
            content: {
              favoriteColor: "orange",
              preferredCrypto: "BTC",
            },
          },
        },
      ],
    );

    await alloy("configure", {
      ...alloyConfig,
      autoCollectPropositionInteractions: {
        [ADOBE_JOURNEY_OPTIMIZER]: ALWAYS,
      },
    });

    const { propositions = [] } = await alloy("applyResponse", {
      renderDecisions: false,
      responseBody,
    });

    await alloy("applyPropositions", {
      propositions,
      metadata: {
        "web://aepdemo.com/": {
          selector: "#page-header",
          actionType: DOM_ACTION_COLLECT_INTERACTIONS,
        },
      },
    });

    expect(pageHeader.hasAttribute(INTERACT_ID_DATA_ATTRIBUTE)).toBe(true);

    networkRecorder.reset();
    pageHeader.click();

    const calls = await getInteractionCalls(networkRecorder);
    expectInteraction(calls, propositionId, itemId);
  });
});

// ---------------------------------------------------------------------------
// C17409728 — includeRenderedPropositions in bottom-of-page sendEvent
// ---------------------------------------------------------------------------

describe("C17409728: includeRenderedPropositions in bottom-of-page sendEvent", () => {
  let homeItem;

  beforeEach(() => {
    homeItem = document.createElement("div");
    homeItem.id = "home-item1";
    homeItem.innerHTML = "Original home item content";
    document.body.appendChild(homeItem);
    return () => {
      if (homeItem.parentNode) homeItem.parentNode.removeChild(homeItem);
    };
  });

  test("bottom-of-page sendEvent contains display notifications for applyPropositions-rendered items", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);
    await alloy("configure", alloyConfig);

    const propositions = [
      {
        id: "AT:eyJhY3Rpdml0eUlkIjoiNDQyMzU4IiwiZXhwZXJpZW5jZUlkIjoiIn1=",
        scope: "alloy-test-scope-1",
        scopeDetails: { decisionProvider: "TGT" },
        items: [
          {
            id: "442359",
            schema: "https://ns.adobe.com/personalization/html-content-item",
            data: {
              content: "<p>Some custom content for the home page</p>",
              format: "text/html",
              id: "1202448",
            },
          },
        ],
      },
    ];

    const applyResult = await alloy("applyPropositions", {
      propositions,
      metadata: {
        "alloy-test-scope-1": {
          selector: "#home-item1",
          actionType: "setHtml",
        },
      },
    });

    const allRendered = applyResult.propositions.every(
      (p) => p.renderAttempted,
    );
    expect(allRendered).toBe(true);
    expect(applyResult.propositions.length).toBe(1);

    await alloy("sendEvent", {
      personalization: { includeRenderedPropositions: true },
    });

    const calls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 20,
      delayMs: 100,
      minCalls: 1,
    });
    expect(calls).toHaveLength(1);

    const sendEventCall = calls[0];
    const hasTargetDisplayNotifications =
      sendEventCall.request.body.events.some(
        ({ xdm }) => xdm.eventType === "decisioning.propositionDisplay",
      );
    const hasPlatformDisplayNotifications =
      sendEventCall.request.body.events.some(
        ({ xdm }) =>
          xdm._experience?.decisioning?.propositionEventType?.display === 1,
      );
    expect(
      hasTargetDisplayNotifications || hasPlatformDisplayNotifications,
    ).toBe(true);
  });
});
