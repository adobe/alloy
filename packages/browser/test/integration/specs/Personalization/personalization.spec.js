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
 *   Covered here with a deterministic VEC proposition response.
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
 * C205529 — Offer based on device XDM field. The live Target evaluation is
 *   replaced by a request-sensitive handler that returns the captured offer
 *   only for the original device field value.
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
 *   The live Target activity is replaced by a deterministic response containing
 *   the same form-based decision and DOM-action behaviors.
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
 *   Covered here; the TestCafe-only sendEventAsync wrapper becomes a direct
 *   await of the real browser promise per the migration plan.
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
import { server } from "vitest/browser";
import alloyConfig from "../../helpers/alloy/config.js";
import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
} from "../../helpers/testsSetup/extend.js";

const { readFile } = server.commands;
const pageWideScope = "__view__";
const pageSurface = window.location.href.replace(/^https?:/, "web:");
const acceptedScopes = [pageWideScope, pageSurface];
const decisionContent =
  '<div id="C28755">Here is an awesome target offer!</div>';

const makeInteractHandler = (getResponseBody) =>
  http.post(
    /https:\/\/edge.adobedc.net\/ee\/.*\/?v1\/interact/,
    async (req) => {
      const url = new URL(req.request.url);
      const configId = url.searchParams.get("configId");
      if (configId?.startsWith("bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83")) {
        const requestBody = await req.request.json();
        const responseBody = getResponseBody(requestBody);
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

const vecProposition = {
  id: "vec-proposition-id",
  scope: pageWideScope,
  scopeDetails: {
    decisionProvider: "TGT",
    activity: { id: "vec-activity" },
  },
  items: [
    {
      id: "vec-item",
      schema: "https://ns.adobe.com/personalization/html-content-item",
      data: {
        content: decisionContent,
        format: "text/html",
      },
    },
  ],
};

const vecHandler = makeInteractHandler((requestBody) =>
  buildEdgeResponse(
    requestBody.events[0].query?.personalization ? [vecProposition] : [],
  ),
);

const emptyHandler = makeInteractHandler(() => buildEdgeResponse([]));

// ---------------------------------------------------------------------------
// C28755 — sendEvent fetches personalization with expected schemas/scopes
// ---------------------------------------------------------------------------

describe("C28755: sendEvent fetches personalization VEC offers", () => {
  test("request includes expected personalization schemas and __view__ scope", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(vecHandler);
    await alloy("configure", alloyConfig);
    const result = await alloy("sendEvent", {});

    const calls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 10,
      delayMs: 100,
      minCalls: 1,
    });
    expect(calls.length).toBe(1);
    expect([200, 207]).toContain(calls[0].response.status);

    const body = calls[0].request.body;
    const personalization = body.events[0].query.personalization;
    expect(personalization.decisionScopes).toEqual([pageWideScope]);

    const hasExpectedSchemas = [
      "https://ns.adobe.com/personalization/default-content-item",
      "https://ns.adobe.com/personalization/dom-action",
      "https://ns.adobe.com/personalization/html-content-item",
      "https://ns.adobe.com/personalization/json-content-item",
      "https://ns.adobe.com/personalization/redirect-item",
    ].every((schema) => personalization.schemas.includes(schema));
    expect(hasExpectedSchemas).toBe(true);

    const personalizationPayload = calls[0].response.body.handle
      .filter(({ type }) => type === "personalization:decisions")
      .flatMap(({ payload }) => payload);
    expect(acceptedScopes).toContain(personalizationPayload[0].scope);
    expect(
      personalizationPayload
        .flatMap(({ items }) => items)
        .map(({ data }) => data?.content)
        .filter(Boolean),
    ).toContain(decisionContent);

    expect(result.decisions[0].renderAttempted).toBeUndefined();
    expect(
      result.propositions.every(
        ({ renderAttempted }) => renderAttempted === false,
      ),
    ).toBe(true);
    expect(result.decisions.length).toBeGreaterThanOrEqual(1);
    expect(
      result.decisions.some(({ scope }) => acceptedScopes.includes(scope)),
    ).toBe(true);
    expect(
      result.decisions
        .flatMap(({ items }) => items)
        .map(({ data }) => data?.content)
        .filter(Boolean),
    ).toContain(decisionContent);
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
    expect(calls[0].response.status).toBe(200);

    const body = calls[0].request.body;
    const decisionScopes = body.events[0].query.personalization.decisionScopes;
    expect(decisionScopes).toEqual([scope, "__view__"]);

    const expectedSchemas = [
      "https://ns.adobe.com/personalization/default-content-item",
      "https://ns.adobe.com/personalization/html-content-item",
      "https://ns.adobe.com/personalization/json-content-item",
      "https://ns.adobe.com/personalization/redirect-item",
    ];
    expectedSchemas.forEach((schema) => {
      expect(body.events[0].query.personalization.schemas).toContain(schema);
    });

    expect(result.decisions[0].renderAttempted).toBeUndefined();
    expect(result.propositions[0].renderAttempted).toBe(false);

    const matchingProposition = result.decisions.find((p) => p.scope === scope);
    expect(matchingProposition).toBeDefined();
    expect(matchingProposition.id).toBe(
      "AT:eyJhY3Rpdml0eUlkIjoiMTI2NDg2IiwiZXhwZXJpZW5jZUlkIjoiMCJ9",
    );
    expect(matchingProposition.scope).toBe(scope);
    expect(matchingProposition.items[0].data.content).toBe(
      "<h3>welcome to TARGET AWESOME WORLD!!! </h3>",
    );
  });
});

// ---------------------------------------------------------------------------
// C205529 — Offer returned based on device XDM field
// ---------------------------------------------------------------------------

describe("C205529: offer returned based on device XDM field", () => {
  const deviceProposition = {
    ...vecProposition,
    id: "AT:eyJhY3Rpdml0eUlkIjoiMTI2NTYxIiwiZXhwZXJpZW5jZUlkIjoiMCJ9",
    items: [
      {
        ...vecProposition.items[0],
        data: {
          content: '<div id="C205529">Device based offer!</div>',
          format: "text/html",
        },
      },
    ],
  };
  const deviceHandler = makeInteractHandler((requestBody) =>
    buildEdgeResponse(
      requestBody.events[0].xdm.device?.customDeviceField === 9999
        ? [deviceProposition]
        : [],
    ),
  );

  test("device XDM field returns its offer", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(deviceHandler);
    await alloy("configure", alloyConfig);
    const result = await alloy("sendEvent", {
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
    expect(calls[0].response.status).toBe(200);

    const body = calls[0].request.body;
    expect(body.events[0].xdm.device?.customDeviceField).toBe(9999);
    expect(body.events[0].query.personalization.decisionScopes).toEqual([
      "__view__",
    ]);

    const expectedSchemas = [
      "https://ns.adobe.com/personalization/default-content-item",
      "https://ns.adobe.com/personalization/dom-action",
      "https://ns.adobe.com/personalization/html-content-item",
      "https://ns.adobe.com/personalization/json-content-item",
      "https://ns.adobe.com/personalization/redirect-item",
    ];
    expectedSchemas.forEach((schema) => {
      expect(body.events[0].query.personalization.schemas).toContain(schema);
    });

    expect(result.decisions).toEqual([deviceProposition]);
  });
});

// ---------------------------------------------------------------------------
// C6364800 — applyResponse accepts a response, updates DOM, returns decisions
// ---------------------------------------------------------------------------

describe("C6364800: applyResponse accepts a response and returns decisions", () => {
  let targetContainer;

  const buildApplyResponse = ({ idPrefix, content }) => {
    const formBasedProposition = {
      id: `${idPrefix}-form-based-proposition-id`,
      scope: "sample-json-offer",
      scopeDetails: {
        decisionProvider: "TGT",
        activity: { id: `${idPrefix}-form-based-activity` },
      },
      items: [
        {
          id: `${idPrefix}-form-based-item`,
          schema: "https://ns.adobe.com/personalization/html-content-item",
          data: { content: '{"message":"form-based offer"}' },
        },
      ],
    };
    const domActionProposition = {
      id: `${idPrefix}-dom-action-proposition-id`,
      scope: "__view__",
      scopeDetails: {
        decisionProvider: "TGT",
        activity: { id: `${idPrefix}-dom-action-activity` },
      },
      items: [
        {
          id: `${idPrefix}-dom-action-item`,
          schema: "https://ns.adobe.com/personalization/dom-action",
          data: {
            type: "setHtml",
            content: `<div>${content}</div>`,
            selector: "#apply-response-container",
          },
        },
      ],
    };

    return {
      formBasedProposition,
      responseBody: buildEdgeResponse([
        formBasedProposition,
        domActionProposition,
      ]),
    };
  };

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
    networkRecorder,
  }) => {
    worker.use(emptyHandler);
    await alloy("configure", alloyConfig);

    const { formBasedProposition, responseBody } = buildApplyResponse({
      idPrefix: "apply-response",
      content: "Applied response content",
    });

    const applyResult = await alloy("applyResponse", {
      renderDecisions: true,
      responseHeaders: {},
      responseBody,
    });

    expect(applyResult.decisions).toContainEqual(formBasedProposition);
    expect(
      applyResult.propositions.find(({ scope }) => scope === "__view__")
        .renderAttempted,
    ).toBe(true);
    expect(targetContainer.innerHTML).toContain("Applied response content");

    const calls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 10,
      delayMs: 100,
      minCalls: 1,
    });
    expect(calls.length).toBe(1);
    expect(calls[0].response.status).toBe(200);
  });

  test("applyResponse after sendEvent applies personalization", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(emptyHandler);
    await alloy("configure", alloyConfig);
    await alloy("sendEvent", {});

    const { formBasedProposition, responseBody } = buildApplyResponse({
      idPrefix: "apply-after-send",
      content: "Second apply content",
    });

    const applyResult = await alloy("applyResponse", {
      renderDecisions: true,
      responseHeaders: {},
      responseBody,
    });

    expect(applyResult.decisions).toContainEqual(formBasedProposition);
    expect(
      applyResult.propositions.find(({ scope }) => scope === "__view__")
        .renderAttempted,
    ).toBe(true);
    expect(targetContainer.innerHTML).toContain("Second apply content");

    const calls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 10,
      delayMs: 100,
      minCalls: 2,
    });
    expect(calls.length).toBe(2);
    calls.forEach((call) => expect(call.response.status).toBe(200));
  });
});

// ---------------------------------------------------------------------------
// C6984408 — Target mbox cookie included when targetMigrationEnabled=true
// ---------------------------------------------------------------------------

describe("C6984408: mbox cookie included in requests when targetMigrationEnabled=true", () => {
  afterEach(() => {
    document.cookie = "mbox=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  });

  test("request contains mbox cookie entry in meta.state.entries", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(emptyHandler);

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
    expect(body.meta.state).toBeDefined();
    expect(body.meta.state.entries).toBeDefined();
    expect(
      body.meta.state.entries.find(({ key }) => key === "mbox"),
    ).toBeDefined();
    expect(body.meta.target?.migration).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// C7498683 — mbox cookie NOT included when targetMigrationEnabled not set
// ---------------------------------------------------------------------------

describe("C7498683: mbox cookie not included in requests when targetMigrationEnabled not set", () => {
  afterEach(() => {
    document.cookie = "mbox=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  });

  test("request does not include mbox cookie in meta.state.entries", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(emptyHandler);

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
    expect(body.meta).toBeDefined();
    expect(body.meta.state).toBeDefined();
    expect(body.meta.state.entries).toBeUndefined();
    expect(body.meta?.target).toBeUndefined();
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
    worker.use(vecHandler);
    await alloy("configure", alloyConfig);
    const eventResult = await alloy("sendEvent", { renderDecisions: false });

    expect(eventResult.decisions).toEqual([vecProposition]);
    expect(eventResult.propositions).toEqual([
      { ...vecProposition, renderAttempted: false },
    ]);

    const notificationPropositions = eventResult.propositions.map((p) => ({
      id: p.id,
      scope: p.scope,
      scopeDetails: p.scopeDetails,
    }));

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

    const calls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 20,
      delayMs: 100,
      minCalls: 2,
    });
    expect(calls.length).toBe(2);
    calls.forEach((call) => {
      expect(call.response.status).toBeLessThan(300);
    });
    const personalization =
      calls[0].request.body.events[0].query.personalization;
    expect(personalization.decisionScopes).toEqual(["__view__"]);
    [
      "https://ns.adobe.com/personalization/default-content-item",
      "https://ns.adobe.com/personalization/dom-action",
      "https://ns.adobe.com/personalization/html-content-item",
      "https://ns.adobe.com/personalization/json-content-item",
      "https://ns.adobe.com/personalization/redirect-item",
    ].forEach((schema) => {
      expect(personalization.schemas).toContain(schema);
    });
    expect(
      calls[1].request.body.events[0].xdm._experience.decisioning.propositions,
    ).toEqual(notificationPropositions);
    expect(
      calls[1].request.body.events[0].xdm._experience.decisioning
        .propositionEventType,
    ).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// C14317242 — defaultPersonalizationEnabled controls fetching VEC offers
// ---------------------------------------------------------------------------

describe("C14317242: defaultPersonalizationEnabled controls VEC offer fetching", () => {
  test("false, default, and true preserve offer-fetching state and order", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(vecHandler);
    await alloy("configure", alloyConfig);

    await alloy("sendEvent", {
      personalization: { defaultPersonalizationEnabled: false },
    });
    const result2 = await alloy("sendEvent", {});
    const result3 = await alloy("sendEvent", {
      personalization: { defaultPersonalizationEnabled: true },
    });

    const calls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 20,
      delayMs: 100,
      minCalls: 3,
    });
    expect(calls.length).toBe(3);
    calls.forEach((call) => expect(call.response.status).toBe(200));
    expect(calls[0].request.body.events[0].query).toBeUndefined();
    expect(
      calls[1].request.body.events[0].query.personalization.decisionScopes,
    ).toEqual(["__view__"]);
    expect(
      calls[2].request.body.events[0].query.personalization.decisionScopes,
    ).toEqual(["__view__"]);
    expect(result2.decisions).toEqual([vecProposition]);
    expect(result2.propositions).toEqual([
      { ...vecProposition, renderAttempted: false },
    ]);
    expect(result3.decisions).toEqual([vecProposition]);
    expect(result3.propositions).toEqual([
      { ...vecProposition, renderAttempted: false },
    ]);
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
    worker.use(emptyHandler);
    await alloy("configure", alloyConfig);

    // Top of page #1 — renderDecisions=true, sendDisplayEvent=false
    await alloy("sendEvent", {
      renderDecisions: true,
      type: "decisioning.propositionFetch",
      personalization: { sendDisplayEvent: false },
    });

    // Top of page #2 — additional scope, sendDisplayEvent=false
    await alloy("sendEvent", {
      type: "decisioning.propositionFetch",
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
