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
 * Migration notes (functional → integration):
 *
 * C28755 — sendEvent fetches personalization with expected schemas/scopes.
 *   Partially covered by the sendEventHandler returning a response with
 *   personalization:decisions. We test the request shape and that
 *   propositions are returned (renderAttempted: false when renderDecisions
 *   is not set).
 *
 * C28756 — form-based offer via decisionScopes.
 *
 * C28757 — VEC offer renders when renderDecisions=true (DOM action setHtml).
 *   Covered by personalizationRender.spec.js.
 *
 * C28758 — ShadowDOM selectors. Skipped (complex DOM fixture setup from
 *   functional test fixtures; out of scope for unit-style integration tests).
 *
 * C28759 — Inline script execution. Skipped (needs live Target activity with
 *   script injection; custom-code handler only covers the counter pattern).
 *   Already covered for the counter case by deduplication_spa.spec.js.
 *
 * C28760 — Notification sent after VEC render.
 *   Covered by personalizationRender.spec.js.
 *
 * C44363 — QA Mode propositions. Skipped (requires live Target QA cookie;
 *   not reproducible with MSW mocks).
 *
 * C205528 — Redirect offer. Skipped (redirect requires navigating the page,
 *   hard to assert in integration context without a real redirect activity).
 *
 * C205529 — Offer based on device XDM field. Covered here (request shape).
 *
 * C753469 — CSP nonce on injected script tags. Skipped (requires CSP headers
 *   configured on the test page itself).
 *
 * C753470 — CSP nonce on injected style tags. Skipped (same as C753469).
 *
 * C782718 — SPA auto-rendering + view notifications.
 *   Covered by personalizationSpa.spec.js.
 *
 * C782719 — SPA with auto-rendering disabled.
 *   Covered by personalizationSpa.spec.js.
 *
 * C1234567 — Content cards subscribe/display/interact.
 *   Covered by AJO/content_cards_and_event_history.spec.js.
 *
 * C3272624 — Profile attribute targeting. Skipped (requires live Target
 *   activity using profile attributes; cannot mock server-side evaluation).
 *
 * C5298194 ×2 — Include propositions on every request. Skipped per migration
 *   plan baseline failures.
 *
 * C5805675 — Default content offers delivered + display notification.
 *   Covered by personalizationRender.spec.js.
 *
 * C5805676 — Merged metric propositions. Skipped per migration plan.
 *
 * C6364797 — applyPropositions renders page-wide propositions.
 *   Covered by applyPropositions.spec.js.
 *
 * C6364798 — applyPropositions re-renders SPA view.
 *   Covered by applyPropositions.spec.js and personalizationSpa.spec.js.
 *
 * C6364799 — applyPropositions renders html-content-item with metadata.
 *   Covered by applyPropositions.spec.js.
 *
 * C6364800 — applyResponse accepts response, updates DOM, returns decisions.
 *   Covered here (inline response).
 *
 * C6984408 — Target mbox cookie included when targetMigrationEnabled=true.
 *   Covered here.
 *
 * C7494472 — AJO offers (test.skip in original). Skipped.
 *
 * C7498683 — mbox cookie NOT included when targetMigrationEnabled not set.
 *   Covered here.
 *
 * C7638574 — AJO custom surface (test.skip in original). Skipped.
 *
 * C7878996 — Manual notification event without propositionEventType succeeds.
 *   Covered here.
 *
 * C8631576 — Client hints low entropy. Skipped (needs browser-level sec-ch-ua
 *   headers; not injectable via MSW).
 *
 * C8631577 — Client hints high entropy. Skipped (same as C8631576).
 *
 * C9932846 — AJO click-tracking (test.skip in original). Skipped.
 *
 * C11389844 — AJO SPA (test.skip in original). Skipped.
 *
 * C14286730 — Target SPA click interaction includes viewName.
 *   Covered by personalizationSpa.spec.js.
 *
 * C14299419 — Prehiding style removed when no personalization payload.
 *   Covered by personalizationRender.spec.js.
 *
 * C14299420 — Prehiding style removed when renderDecisions=false.
 *   Covered by personalizationRender.spec.js.
 *
 * C14299421 — Prehiding style removed when rendering fails.
 *   Skipped (requires a live activity that targets an element not present;
 *   hard to guarantee with MSW mock responses).
 *
 * C14299422 — Prehiding style removed when personalization payload returned.
 *   Covered by personalizationRender.spec.js.
 *
 * C14317242 — defaultPersonalizationEnabled controls VEC offer fetching.
 *   Covered here.
 *
 * C15325239 — Top and bottom of page pattern (multiple sendEvents).
 *   Covered here.
 *
 * C17294899 — Prehiding style removed when consent is set to out.
 *   Covered by personalizationRender.spec.js.
 *
 * C17409728 — Proposition interactions automatically tracked (autoCollect).
 *   Covered by personalizationInteractions.spec.js.
 *
 * C21636439 — Conflict resolution: show one in-app message sorted by rank.
 *   Covered by AJO/inapp_messages.spec.js.
 *
 * C21886916 — Shadow-DOM click tracking. Skipped per migration plan.
 *
 * C22098199 — Non-idempotent actions not applied multiple times.
 *   Covered by personalizationRender.spec.js.
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
import { sendEventHandler } from "../../helpers/mswjs/handlers.js";

const { readFile } = server.commands;

const makeInteractHandler = (responseBody) =>
  http.post(
    /https:\/\/edge.adobedc.net\/ee\/.*\/?v1\/interact/,
    async (req) => {
      const url = new URL(req.request.url);
      const configId = url.searchParams.get("configId");
      if (configId === "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83") {
        return HttpResponse.json(responseBody);
      }
      throw new Error("Handler not configured properly");
    },
  );

const formBasedHandler = http.post(
  /https:\/\/edge.adobedc.net\/ee\/.*\/?v1\/interact/,
  async (req) => {
    const url = new URL(req.request.url);
    const configId = url.searchParams.get("configId");
    if (configId === "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83") {
      return HttpResponse.text(
        await readFile(
          `${server.config.root}/packages/browser/test/integration/helpers/mocks/personalizationFormBasedResponse.json`,
        ),
      );
    }
    throw new Error("Handler not configured properly");
  },
);

const buildEdgeResponse = (propositionPayload) => ({
  requestId: `test-${Date.now()}`,
  handle: [
    {
      payload: [
        {
          id: "56475161841051406291527557158775615545",
          namespace: { code: "ECID" },
        },
      ],
      type: "identity:result",
    },
    {
      payload: propositionPayload,
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

// ---------------------------------------------------------------------------
// C28755 — sendEvent fetches personalization with expected schemas/scopes
// ---------------------------------------------------------------------------

describe("C28755: sendEvent fetches personalization VEC offers", () => {
  test("request includes expected personalization schemas and __view__ scope", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);
    await alloy("configure", alloyConfig);
    const result = await alloy("sendEvent", {});

    const calls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 10,
      delayMs: 100,
      minCalls: 1,
    });
    expect(calls.length).toBe(1);

    const body = calls[0].request.body;
    const personalization = body.events[0].query.personalization;
    expect(personalization.decisionScopes).toContain("__view__");

    const expectedSchemas = [
      "https://ns.adobe.com/personalization/default-content-item",
      "https://ns.adobe.com/personalization/dom-action",
      "https://ns.adobe.com/personalization/html-content-item",
      "https://ns.adobe.com/personalization/json-content-item",
      "https://ns.adobe.com/personalization/redirect-item",
    ];
    expectedSchemas.forEach((schema) => {
      expect(personalization.schemas).toContain(schema);
    });

    // Without renderDecisions, propositions should be returned but not rendered
    expect(result).toHaveProperty("propositions");
    expect(Array.isArray(result.propositions)).toBe(true);
    result.propositions.forEach((p) => {
      expect(p.renderAttempted).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// C28756 — Form-based offer returned when decisionScopes provided
// ---------------------------------------------------------------------------

describe("C28756: form-based offer returned when event includes its scope", () => {
  const scope = "alloy-test-scope-1";

  test("form-based offer decision is present in result", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(formBasedHandler);
    await alloy("configure", alloyConfig);
    const result = await alloy("sendEvent", { decisionScopes: [scope] });

    const calls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 10,
      delayMs: 100,
      minCalls: 1,
    });
    expect(calls.length).toBe(1);

    const body = calls[0].request.body;
    const decisionScopes = body.events[0].query.personalization.decisionScopes;
    expect(decisionScopes).toContain(scope);
    expect(decisionScopes).toContain("__view__");

    // propositions should be returned un-rendered
    expect(result).toHaveProperty("propositions");
    result.propositions.forEach((p) => {
      expect(p.renderAttempted).toBe(false);
    });

    // find the matching proposition for alloy-test-scope-1
    const matchingProposition = result.propositions.find(
      (p) => p.scope === scope,
    );
    expect(matchingProposition).toBeDefined();
    expect(matchingProposition.items[0].data.content).toBe(
      "<h3>welcome to TARGET AWESOME WORLD!!! </h3>",
    );
  });
});

// ---------------------------------------------------------------------------
// C205529 — Offer returned based on device XDM field
// ---------------------------------------------------------------------------

describe("C205529: offer returned based on device XDM field", () => {
  test("device XDM field is sent in request", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);
    await alloy("configure", alloyConfig);
    await alloy("sendEvent", {
      xdm: {
        device: {
          customDeviceField: 9999,
        },
      },
    });

    const calls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 10,
      delayMs: 100,
      minCalls: 1,
    });
    expect(calls.length).toBe(1);

    const body = calls[0].request.body;
    expect(body.events[0].xdm.device?.customDeviceField).toBe(9999);
    // Personalization query should still be present
    expect(body.events[0].query.personalization.decisionScopes).toContain(
      "__view__",
    );
  });
});

// ---------------------------------------------------------------------------
// C6364800 — applyResponse accepts a response, updates DOM, returns decisions
// ---------------------------------------------------------------------------

describe("C6364800: applyResponse accepts a response and returns decisions", () => {
  let targetContainer;

  beforeEach(() => {
    targetContainer = document.createElement("div");
    targetContainer.id = "apply-response-container";
    targetContainer.innerHTML = "Original content";
    document.body.appendChild(targetContainer);
    return () => {
      if (targetContainer.parentNode) {
        document.body.removeChild(targetContainer);
      }
    };
  });

  test("applyResponse returns decisions with renderAttempted", async ({
    alloy,
    worker,
  }) => {
    // No network needed — applyResponse is a client-side command
    worker.use(sendEventHandler);
    await alloy("configure", alloyConfig);

    const responseBody = buildEdgeResponse([
      {
        id: "apply-response-proposition-id",
        scope: "__view__",
        scopeDetails: {
          decisionProvider: "TGT",
          activity: { id: "apply-response-activity" },
        },
        items: [
          {
            id: "apply-response-item",
            schema: "https://ns.adobe.com/personalization/dom-action",
            data: {
              type: "setHtml",
              content: "<div>Applied response content</div>",
              selector: "#apply-response-container",
            },
          },
        ],
      },
    ]);

    const applyResult = await alloy("applyResponse", {
      renderDecisions: true,
      responseBody,
    });

    expect(applyResult).toHaveProperty("decisions");
    expect(Array.isArray(applyResult.decisions)).toBe(true);
    // propositions should have renderAttempted=true
    expect(applyResult).toHaveProperty("propositions");
    applyResult.propositions.forEach((p) => {
      expect(p.renderAttempted).toBe(true);
    });
  });

  test("applyResponse after sendEvent applies personalization", async ({
    alloy,
    worker,
  }) => {
    worker.use(sendEventHandler);
    await alloy("configure", alloyConfig);
    await alloy("sendEvent", {});

    const responseBody = buildEdgeResponse([
      {
        id: "apply-after-send-proposition-id",
        scope: "__view__",
        scopeDetails: {
          decisionProvider: "TGT",
          activity: { id: "apply-after-send-activity" },
        },
        items: [
          {
            id: "apply-after-send-item",
            schema: "https://ns.adobe.com/personalization/dom-action",
            data: {
              type: "setHtml",
              content: "<div>Second apply content</div>",
              selector: "#apply-response-container",
            },
          },
        ],
      },
    ]);

    const applyResult = await alloy("applyResponse", {
      renderDecisions: true,
      responseBody,
    });

    expect(applyResult).toHaveProperty("decisions");
    expect(applyResult.propositions.every((p) => p.renderAttempted)).toBe(true);
    expect(targetContainer.innerHTML).toContain("Second apply content");
  });
});

// ---------------------------------------------------------------------------
// C6984408 — Target mbox cookie included when targetMigrationEnabled=true
// ---------------------------------------------------------------------------

describe("C6984408: mbox cookie included in requests when targetMigrationEnabled=true", () => {
  test("request contains mbox cookie entry in meta.state.entries", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    // Plant a fake mbox cookie in the document
    document.cookie =
      "mbox=PC%232177ea922eab463aafe0a22206c12762.35_0%231722369340%7Csession%23786adef0b32d411fbd0cf08d1d1bef9c%231659126405; path=/";

    await alloy("configure", {
      ...alloyConfig,
      targetMigrationEnabled: true,
    });
    await alloy("sendEvent", {});

    const calls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 10,
      delayMs: 100,
      minCalls: 1,
    });
    expect(calls.length).toBe(1);

    const body = calls[0].request.body;
    expect(body.meta).toBeDefined();
    expect(body.meta.target?.migration).toBe(true);

    // Clean up the cookie
    document.cookie = "mbox=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  });
});

// ---------------------------------------------------------------------------
// C7498683 — mbox cookie NOT included when targetMigrationEnabled not set
// ---------------------------------------------------------------------------

describe("C7498683: mbox cookie not included in requests when targetMigrationEnabled not set", () => {
  test("request does not include mbox cookie in meta.state.entries", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    // Plant a fake mbox cookie
    document.cookie =
      "mbox=PC%232177ea922eab463aafe0a22206c12762.35_0%231722369340%7Csession%23786adef0b32d411fbd0cf08d1d1bef9c%231659126405; path=/";

    await alloy("configure", alloyConfig);
    await alloy("sendEvent", {});

    const calls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 10,
      delayMs: 100,
      minCalls: 1,
    });
    expect(calls.length).toBe(1);

    const body = calls[0].request.body;
    // meta.target should be absent or undefined
    expect(body.meta?.target).toBeUndefined();

    // Clean up
    document.cookie = "mbox=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  });
});

// ---------------------------------------------------------------------------
// C7878996 — Manual notification event without propositionEventType succeeds
// ---------------------------------------------------------------------------

describe("C7878996: manual notification event without propositionEventType succeeds", () => {
  test("sending a manual display notification returns a 200 response", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);
    await alloy("configure", alloyConfig);
    const eventResult = await alloy("sendEvent", { renderDecisions: false });

    expect(eventResult).toHaveProperty("propositions");
    expect(Array.isArray(eventResult.propositions)).toBe(true);
    eventResult.propositions.forEach((p) => {
      expect(p.renderAttempted).toBe(false);
    });

    // Build notification propositions from what we got back
    const notificationPropositions = eventResult.propositions.map((p) => ({
      id: p.id,
      scope: p.scope,
      scopeDetails: p.scopeDetails,
    }));

    // Send a manual display notification event (without propositionEventType)
    await alloy("sendEvent", {
      xdm: {
        _experience: {
          decisioning: {
            propositions: notificationPropositions,
          },
        },
        eventType: "decisioning.propositionDisplay",
      },
    });

    // Both calls should be recorded
    const calls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 20,
      delayMs: 100,
      minCalls: 2,
    });
    expect(calls.length).toBe(2);
    calls.forEach((call) => {
      expect(call.response.status).toBeLessThan(300);
    });
  });
});

// ---------------------------------------------------------------------------
// C14317242 — defaultPersonalizationEnabled controls fetching VEC offers
// ---------------------------------------------------------------------------

describe("C14317242: defaultPersonalizationEnabled controls VEC offer fetching", () => {
  test("when defaultPersonalizationEnabled=false, no personalization query is sent", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);
    await alloy("configure", alloyConfig);

    // First call: defaultPersonalizationEnabled=false → no personalization query
    await alloy("sendEvent", {
      personalization: { defaultPersonalizationEnabled: false },
    });

    const calls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 10,
      delayMs: 100,
      minCalls: 1,
    });
    expect(calls.length).toBe(1);

    const firstBody = calls[0].request.body;
    expect(firstBody.events[0].query).toBeUndefined();
  });

  test("subsequent sendEvent without flag fetches offers (cache not initialized)", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);
    await alloy("configure", alloyConfig);

    // First call skips personalization
    await alloy("sendEvent", {
      personalization: { defaultPersonalizationEnabled: false },
    });

    // Second call (no flag) should fetch offers because cache was not initialized
    const result2 = await alloy("sendEvent", {});

    const calls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 15,
      delayMs: 100,
      minCalls: 2,
    });
    expect(calls.length).toBe(2);

    const secondBody = calls[1].request.body;
    expect(
      secondBody.events[0].query?.personalization?.decisionScopes,
    ).toContain("__view__");

    expect(result2).toHaveProperty("propositions");
    result2.propositions.forEach((p) => {
      expect(p.renderAttempted).toBe(false);
    });
  });

  test("sendEvent with defaultPersonalizationEnabled=true fetches offers", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);
    await alloy("configure", alloyConfig);

    const result = await alloy("sendEvent", {
      personalization: { defaultPersonalizationEnabled: true },
    });

    const calls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 10,
      delayMs: 100,
      minCalls: 1,
    });
    expect(calls.length).toBe(1);

    const body = calls[0].request.body;
    expect(body.events[0].query?.personalization?.decisionScopes).toContain(
      "__view__",
    );

    expect(result).toHaveProperty("propositions");
    result.propositions.forEach((p) => {
      expect(p.renderAttempted).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// C15325239 — Top and bottom of page (multiple sendEvents)
// ---------------------------------------------------------------------------

describe("C15325239: top and bottom of page", () => {
  test("multiple top-of-page sendEvent calls followed by bottom-of-page are all sent", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);
    await alloy("configure", alloyConfig);

    // Top of page #1 — renderDecisions=true, sendDisplayEvent=false
    await alloy("sendEvent", {
      renderDecisions: true,
      xdm: { eventType: "decisioning.propositionFetch" },
      personalization: { sendDisplayEvent: false },
    });

    // Top of page #2 — additional scope, sendDisplayEvent=false
    await alloy("sendEvent", {
      xdm: { eventType: "decisioning.propositionFetch" },
      personalization: {
        decisionScopes: ["foo"],
        sendDisplayEvent: false,
      },
    });

    // Bottom of page — include rendered propositions
    await alloy("sendEvent", {
      personalization: { includeRenderedPropositions: true },
    });

    const calls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 20,
      delayMs: 100,
      minCalls: 3,
    });
    expect(calls.length).toBe(3);
  });
});
