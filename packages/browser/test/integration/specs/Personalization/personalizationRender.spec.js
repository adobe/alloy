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
 * Covers DOM-rendering aspects migrated from functional tests:
 *
 * C28757 — VEC offer renders (setHtml dom-action) when renderDecisions=true.
 * C28760 — Notification sent after VEC dom-action render.
 * C5805675 — Default content offers delivered with display notification.
 * C14299419 — Prehiding style removed when no personalization payload.
 * C14299420 — Prehiding style removed when renderDecisions=false.
 * C14299422 — Prehiding style removed when personalization payload returned.
 * C17294899 — Prehiding style removed when consent is set to out.
 * C22098199 — Non-idempotent proposition actions not applied multiple times.
 */

import { http, HttpResponse } from "msw";
// eslint-disable-next-line import/no-unresolved
import { server } from "vitest/browser";
import alloyConfig from "../../helpers/alloy/config.js";
import {
  describe,
  test,
  expect,
  beforeEach,
} from "../../helpers/testsSetup/extend.js";
import {
  sendEventHandler,
  setConsentHandler,
} from "../../helpers/mswjs/handlers.js";

const { readFile } = server.commands;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeSetHtmlHandler = (selector, content) =>
  http.post(
    /https:\/\/edge.adobedc.net\/ee\/.*\/?v1\/interact/,
    async (req) => {
      const url = new URL(req.request.url);
      const configId = url.searchParams.get("configId");
      if (configId !== "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83") {
        throw new Error("Handler not configured properly");
      }
      const requestBody = await req.request.json();
      const hasSchemas =
        requestBody?.events?.[0]?.query?.personalization?.schemas;

      if (hasSchemas && hasSchemas.length > 0) {
        return HttpResponse.json({
          requestId: `render-test-${Date.now()}`,
          handle: [
            {
              payload: [
                { id: "56475161841051406291527557158775615545", namespace: { code: "ECID" } },
              ],
              type: "identity:result",
            },
            {
              payload: [
                {
                  id: "AT:render-test-proposition",
                  scope: "__view__",
                  scopeDetails: {
                    decisionProvider: "TGT",
                    activity: { id: "render-test-activity" },
                    experience: { id: "0" },
                    characteristics: { eventToken: "render-test-token" },
                    correlationID: "render-test:0:0",
                  },
                  items: [
                    {
                      id: "render-test-item",
                      schema: "https://ns.adobe.com/personalization/dom-action",
                      data: {
                        type: "setHtml",
                        format: "application/vnd.adobe.target.dom-action",
                        content,
                        selector,
                        prehidingSelector: selector,
                      },
                    },
                  ],
                },
              ],
              type: "personalization:decisions",
              eventIndex: 0,
            },
            {
              payload: [
                { key: "kndctr_5BFE274A5F6980A50A495C08_AdobeOrg_cluster", value: "or2", maxAge: 1800 },
              ],
              type: "state:store",
            },
          ],
        });
      }

      return HttpResponse.text(
        await readFile(
          `${server.config.root}/packages/browser/test/integration/helpers/mocks/emptyEventResponse.json`,
        ),
      );
    },
  );

// ---------------------------------------------------------------------------
// C28757 — VEC offer renders when renderDecisions=true
// ---------------------------------------------------------------------------

describe("C28757: VEC offer renders when renderDecisions=true", () => {
  let targetDiv;

  beforeEach(() => {
    targetDiv = document.createElement("div");
    targetDiv.id = "vec-offer-target";
    targetDiv.innerHTML = "Original content";
    document.body.appendChild(targetDiv);
    return () => {
      if (targetDiv.parentNode) document.body.removeChild(targetDiv);
    };
  });

  test("dom-action setHtml updates the target element", async ({
    alloy,
    worker,
  }) => {
    worker.use(makeSetHtmlHandler("#vec-offer-target", "Here is an awesome target offer!"));
    await alloy("configure", alloyConfig);
    const eventResult = await alloy("sendEvent", { renderDecisions: true });

    expect(targetDiv.innerHTML).toContain("Here is an awesome target offer!");

    // VEC propositions that were rendered should not appear in decisions
    const vecSchemas = [
      "https://ns.adobe.com/personalization/dom-action",
      "https://ns.adobe.com/personalization/html-content-item",
    ];
    const remainingVecDecisions = (eventResult.decisions || []).filter((d) =>
      d.items.some((i) => vecSchemas.includes(i.schema)),
    );
    expect(remainingVecDecisions.length).toBe(0);

    // At least one proposition should have renderAttempted=true
    expect(eventResult.propositions.some((p) => p.renderAttempted === true)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// C28760 — Display notification sent after VEC dom-action render
// ---------------------------------------------------------------------------

describe("C28760: display notification sent after VEC render", () => {
  beforeEach(() => {
    const el = document.createElement("div");
    el.id = "notification-target";
    document.body.appendChild(el);
    return () => {
      const existing = document.getElementById("notification-target");
      if (existing) document.body.removeChild(existing);
    };
  });

  test("a second interact call with propositionDisplay is sent after renderDecisions", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(makeSetHtmlHandler("#notification-target", "VEC content"));
    await alloy("configure", alloyConfig);
    await alloy("sendEvent", { renderDecisions: true });

    // Wait for both the sendEvent call AND the display notification
    const calls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 30,
      delayMs: 100,
      minCalls: 2,
    });
    expect(calls.length).toBeGreaterThanOrEqual(2);

    const displayCall = calls.find(
      (c) =>
        c.request.body?.events?.[0]?.xdm?.eventType ===
        "decisioning.propositionDisplay",
    );
    expect(displayCall).toBeDefined();
    expect(
      displayCall.request.body.events[0].xdm._experience.decisioning
        .propositionEventType.display,
    ).toBe(1);
    expect(
      displayCall.request.body.events[0].xdm._experience.decisioning.propositions
        .length,
    ).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// C5805675 — Default content offers delivered with display notification
// ---------------------------------------------------------------------------

describe("C5805675: default content offers delivered and display notification sent", () => {
  test("default-content-item schema is present and display notification is sent", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    // Use a handler that returns a default-content-item offer
    const defaultContentHandler = http.post(
      /https:\/\/edge.adobedc.net\/ee\/.*\/?v1\/interact/,
      async (req) => {
        const url = new URL(req.request.url);
        if (url.searchParams.get("configId") !== "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83") {
          throw new Error("Handler not configured properly");
        }
        const requestBody = await req.request.json();
        const hasSchemas = requestBody?.events?.[0]?.query?.personalization?.schemas;

        if (hasSchemas && hasSchemas.length > 0) {
          return HttpResponse.json({
            requestId: "default-content-test",
            handle: [
              {
                payload: [{ id: "ecid-123", namespace: { code: "ECID" } }],
                type: "identity:result",
              },
              {
                payload: [
                  {
                    id: "AT:default-content-proposition",
                    scope: "__view__",
                    scopeDetails: {
                      decisionProvider: "TGT",
                      activity: { id: "default-content-activity" },
                      experience: { id: "0" },
                      characteristics: { eventToken: "default-content-token" },
                      correlationID: "default-content:0:0",
                    },
                    items: [
                      {
                        id: "0",
                        schema:
                          "https://ns.adobe.com/personalization/default-content-item",
                        meta: {
                          "activity.id": "default-content-activity",
                          "activity.name": "Functional: C5805675 AB",
                          "experience.id": "0",
                          "offer.id": "0",
                          "offer.name": "Default Content",
                        },
                      },
                    ],
                  },
                ],
                type: "personalization:decisions",
                eventIndex: 0,
              },
              {
                payload: [
                  { key: "kndctr_5BFE274A5F6980A50A495C08_AdobeOrg_cluster", value: "or2", maxAge: 1800 },
                ],
                type: "state:store",
              },
            ],
          });
        }

        return HttpResponse.text(
          await readFile(
            `${server.config.root}/packages/browser/test/integration/helpers/mocks/emptyEventResponse.json`,
          ),
        );
      },
    );

    worker.use(defaultContentHandler);
    await alloy("configure", alloyConfig);
    const eventResult = await alloy("sendEvent", { renderDecisions: true });

    // At least one proposition should have renderAttempted=true
    expect(eventResult.propositions.some((p) => p.renderAttempted === true)).toBe(true);

    // Wait for display notification
    const calls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 30,
      delayMs: 100,
      minCalls: 2,
    });
    const displayCall = calls.find(
      (c) =>
        c.request.body?.events?.[0]?.xdm?.eventType ===
        "decisioning.propositionDisplay",
    );
    expect(displayCall).toBeDefined();
    expect(
      displayCall.request.body.events[0].xdm._experience.decisioning
        .propositionEventType.display,
    ).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// C14299419 — Prehiding style removed when no personalization payload
// ---------------------------------------------------------------------------

describe("C14299419: prehiding style removed when no personalization payload", () => {
  beforeEach(() => {
    const style = document.createElement("style");
    style.id = "alloy-prehiding";
    style.textContent = "body { visibility: hidden; }";
    document.head.appendChild(style);
    return () => {
      const existing = document.getElementById("alloy-prehiding");
      if (existing) existing.parentNode.removeChild(existing);
    };
  });

  test("alloy-prehiding style is removed after sendEvent with empty personalization", async ({
    alloy,
    worker,
  }) => {
    // Use sendEventHandler which returns an empty personalization payload
    worker.use(sendEventHandler);
    await alloy("configure", alloyConfig);
    await alloy("sendEvent", { renderDecisions: true });

    expect(document.getElementById("alloy-prehiding")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// C14299420 — Prehiding style removed when renderDecisions=false
// ---------------------------------------------------------------------------

describe("C14299420: prehiding style removed when renderDecisions=false", () => {
  beforeEach(() => {
    const style = document.createElement("style");
    style.id = "alloy-prehiding";
    style.textContent = "body { visibility: hidden; }";
    document.head.appendChild(style);
    return () => {
      const existing = document.getElementById("alloy-prehiding");
      if (existing) existing.parentNode.removeChild(existing);
    };
  });

  test("alloy-prehiding style is removed even when renderDecisions=false", async ({
    alloy,
    worker,
  }) => {
    worker.use(sendEventHandler);
    await alloy("configure", alloyConfig);
    await alloy("sendEvent", { renderDecisions: false });

    expect(document.getElementById("alloy-prehiding")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// C14299422 — Prehiding style removed when personalization payload returned
// ---------------------------------------------------------------------------

describe("C14299422: prehiding style removed when personalization payload returned", () => {
  beforeEach(() => {
    const targetEl = document.createElement("div");
    targetEl.id = "prehiding-with-payload-target";
    document.body.appendChild(targetEl);

    const style = document.createElement("style");
    style.id = "alloy-prehiding";
    style.textContent = "body { visibility: hidden; }";
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById("alloy-prehiding");
      if (existingStyle) existingStyle.parentNode.removeChild(existingStyle);
      const existingEl = document.getElementById("prehiding-with-payload-target");
      if (existingEl) existingEl.parentNode.removeChild(existingEl);
    };
  });

  test("alloy-prehiding style is removed even when personalization offer is returned", async ({
    alloy,
    worker,
  }) => {
    worker.use(
      makeSetHtmlHandler(
        "#prehiding-with-payload-target",
        "Prehiding test content",
      ),
    );
    await alloy("configure", alloyConfig);
    await alloy("sendEvent", { renderDecisions: true });

    expect(document.getElementById("alloy-prehiding")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// C17294899 — Prehiding style removed when consent is set to out
// ---------------------------------------------------------------------------

describe("C17294899: prehiding style removed when consent is out", () => {
  beforeEach(() => {
    const style = document.createElement("style");
    style.id = "alloy-prehiding";
    style.textContent = "body { visibility: hidden; }";
    document.head.appendChild(style);
    return () => {
      const existing = document.getElementById("alloy-prehiding");
      if (existing) existing.parentNode.removeChild(existing);
    };
  });

  test("alloy-prehiding style is removed after consent is set to out", async ({
    alloy,
    worker,
  }) => {
    worker.use(sendEventHandler, setConsentHandler);

    await alloy("configure", {
      ...alloyConfig,
      defaultConsent: "pending",
    });

    // Style should still be present (consent pending)
    expect(document.getElementById("alloy-prehiding")).not.toBeNull();

    // Setting consent to "out" should remove the prehiding style
    await alloy("setConsent", { consent: [{ standard: "Adobe", version: "1.0", value: { general: "out" } }] });

    expect(document.getElementById("alloy-prehiding")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// C22098199 — Non-idempotent proposition actions not applied multiple times
// ---------------------------------------------------------------------------

describe("C22098199: non-idempotent proposition actions not applied multiple times", () => {
  const containerId = "idempotency-test-container";

  const makePropositions = (action, content, itemId) => [
    {
      id: "idempotency-proposition",
      scope: "web://aepdemo.com/#test",
      scopeDetails: {
        decisionProvider: "AJO",
        activity: { id: "idempotency-activity" },
        characteristics: {
          eventToken: "idempotency-token",
          viewName: "test",
          scopeType: "view",
        },
      },
      items: [
        {
          id: itemId,
          schema: "https://ns.adobe.com/personalization/dom-action",
          data: {
            type: action,
            content,
            selector: `#${containerId}`,
          },
        },
      ],
    },
  ];

  ["prependHtml", "appendHtml", "insertBefore", "insertAfter"].forEach(
    (action) => {
      test(`${action} proposition is not applied multiple times`, async ({
        alloy,
        worker,
      }) => {
        // Set up DOM
        const container = document.createElement("div");
        container.id = containerId;
        document.body.appendChild(container);

        const contentId = `idempotency-content-${action}`;

        try {
          worker.use(sendEventHandler);
          await alloy("configure", alloyConfig);

          const itemId = `item-${action}-${Date.now()}`;
          const propositions = makePropositions(
            action,
            `<div id="${contentId}">Content via ${action}</div>`,
            itemId,
          );

          // First application
          await alloy("applyPropositions", { propositions });

          const firstCount = document.querySelectorAll(`#${contentId}`).length;
          expect(firstCount).toBe(1);

          // Second application should be idempotent
          await alloy("applyPropositions", { propositions });

          const secondCount = document.querySelectorAll(`#${contentId}`).length;
          expect(secondCount).toBe(1);
        } finally {
          if (container.parentNode) {
            container.parentNode.removeChild(container);
          }
        }
      });
    },
  );

  test("setHtml propositions can be re-rendered multiple times", async ({
    alloy,
    worker,
  }) => {
    const container = document.createElement("div");
    container.id = containerId;
    container.innerHTML = "<h1>Original Headline</h1>";
    document.body.appendChild(container);

    try {
      worker.use(sendEventHandler);
      await alloy("configure", alloyConfig);

      const propositions = makePropositions(
        "setHtml",
        "<h1>Target Modified Headline</h1>",
        `sethtml-item-${Date.now()}`,
      );

      // First render
      await alloy("applyPropositions", { propositions });
      expect(container.innerHTML).toContain("Target Modified Headline");

      // Simulate SPA navigation away
      container.innerHTML = "<h1>Sports/Politics Content</h1>";
      expect(container.innerHTML).toContain("Sports/Politics Content");

      // Re-render — should work again
      await alloy("applyPropositions", { propositions });
      expect(container.innerHTML).not.toContain("Sports/Politics Content");
      expect(container.innerHTML).toContain("Target Modified Headline");
    } finally {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  });
});
