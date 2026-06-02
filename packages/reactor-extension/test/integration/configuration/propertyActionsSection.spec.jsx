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

import { describe, it, beforeEach, afterEach, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { render } from "vitest-browser-react";
import { Provider, lightTheme } from "@adobe/react-spectrum";

import { worker } from "../helpers/mocks/browser";
import field from "../helpers/field";
import ErrorBoundary from "../../../src/view/components/errorBoundary";
import PropertyActionsSection from "../../../src/view/configuration/propertyActionsSection";

const INIT_INFO = {
  company: { orgId: "1234@AdobeOrg" },
  tokens: { imsAccess: "IMS_ACCESS" },
  propertySettings: { id: "PR1234" },
};

// Source code references `__EXTENSION_NAME__::...` as a build-time placeholder
// that the parcel transformer replaces at package time. The unit/integration
// tests run against the untransformed source, so mocks use the placeholder
// literally — same convention as the existing data-element tests.
const VARIABLE_DELEGATE = "__EXTENSION_NAME__::dataElements::variable";
const UPDATE_VARIABLE_DELEGATE = "__EXTENSION_NAME__::actions::update-variable";

const variableDataElement = (id, name) => ({
  id,
  type: "data_elements",
  attributes: {
    name,
    delegate_descriptor_id: VARIABLE_DELEGATE,
    settings: JSON.stringify({ solutions: ["analytics"] }),
  },
});

const dataElementsPageHandler = (dataElements) =>
  http.get("https://reactor.adobe.io/properties/PR1234/data_elements", () =>
    HttpResponse.json({
      data: dataElements,
      meta: {
        pagination: {
          current_page: 1,
          next_page: null,
          total_pages: 1,
          total_count: dataElements.length,
        },
      },
    }),
  );

// Each rule descriptor is
// `{ id, name, components: [{ id, name, settings, delegateDescriptorId? }] }`.
// `propertyHandlers(rules)` returns the MSW handlers for:
//   - GET /properties/PR1234/rules (just the list of rules)
//   - GET /rules/{ruleId}/rule_components (per-rule components)
// This matches `fetchExtensionActionRuleComponents`'s actual request pattern.
const buildRulesListBody = (rules) => ({
  data: rules.map((r) => ({
    id: r.id,
    type: "rules",
    attributes: { name: r.name },
  })),
  meta: {
    pagination: {
      current_page: 1,
      next_page: null,
      total_pages: 1,
      total_count: rules.length,
    },
  },
});

const buildComponentsBody = (components) => ({
  data: (components ?? []).map((c) => ({
    id: c.id,
    type: "rule_components",
    attributes: {
      name: c.name ?? "",
      delegate_descriptor_id:
        c.delegateDescriptorId ?? UPDATE_VARIABLE_DELEGATE,
      settings: JSON.stringify(c.settings ?? {}),
    },
  })),
  meta: {
    pagination: {
      current_page: 1,
      next_page: null,
      total_pages: 1,
      total_count: (components ?? []).length,
    },
  },
});

const propertyHandlers = (rules) => [
  http.get("https://reactor.adobe.io/properties/PR1234/rules", () =>
    HttpResponse.json(buildRulesListBody(rules)),
  ),
  http.get(
    "https://reactor.adobe.io/rules/:ruleId/rule_components",
    ({ params }) => {
      const rule = rules.find((r) => r.id === params.ruleId);
      return HttpResponse.json(buildComponentsBody(rule?.components ?? []));
    },
  ),
];

const patchedIds = [];
const failingPatchIds = new Set();

// MSW handler for `GET /data_elements/{id}` (Reactor's global by-ID lookup,
// used by the orchestrator's stale-ID recovery path). Pass a `sourceById`
// map of stale-id → { id, name } to resolve known IDs; everything else
// returns 404.
const dataElementByIdHandler = (sourceById = {}) =>
  http.get("https://reactor.adobe.io/data_elements/:id", ({ params }) => {
    const source = sourceById[params.id];
    if (!source) {
      return HttpResponse.json(
        { errors: [{ status: "404", detail: "Not found" }] },
        { status: 404 },
      );
    }
    return HttpResponse.json({
      data: {
        id: source.id,
        type: "data_elements",
        attributes: {
          name: source.name,
          delegate_descriptor_id: VARIABLE_DELEGATE,
          settings: JSON.stringify({}),
        },
      },
    });
  });

const ruleComponentPatchHandler = () =>
  http.patch(
    "https://reactor.adobe.io/rule_components/:id",
    async ({ params, request }) => {
      const body = await request.json();
      if (failingPatchIds.has(params.id)) {
        return HttpResponse.json(
          { errors: [{ detail: "Forbidden" }] },
          { status: 403 },
        );
      }
      patchedIds.push({ id: params.id, body });
      return HttpResponse.json({
        data: {
          id: params.id,
          type: "rule_components",
          attributes: { settings: body.data.attributes.settings },
        },
      });
    },
  );

const renderSection = async (initInfo = INIT_INFO) =>
  render(
    <Provider
      theme={lightTheme}
      colorScheme="light"
      UNSAFE_className="react-spectrum-provider spectrum spectrum--medium spectrum--light spectrum-accessibility-overrides"
    >
      <ErrorBoundary>
        <PropertyActionsSection initInfo={initInfo} />
      </ErrorBoundary>
    </Provider>,
  );

let view;

describe("Property actions — repair stale data element references", () => {
  beforeEach(() => {
    patchedIds.length = 0;
    failingPatchIds.clear();
  });

  afterEach(() => {
    if (view && typeof view.unmount === "function") {
      view.unmount();
    }
    view = undefined;
    worker.resetHandlers();
  });

  it("renders the section with the repair button in idle state", async () => {
    view = await renderSection();
    await field(
      view.getByTestId("repairStaleDataElementsButton"),
    ).expectVisible();
  });

  it("runs end-to-end: confirms, repairs unique-name match, reports summary with skipped and failed", async () => {
    worker.use(
      dataElementsPageHandler([variableDataElement("DE_NEW", "MyVar")]),
      // The RC_NONAME scenario triggers the orchestrator's stale-ID recovery
      // path. Returning 404 for DE_OLD keeps the legacy MISSING_NAME outcome
      // for that case so the assertion below still holds.
      dataElementByIdHandler({}),
      ...propertyHandlers([
        {
          id: "R1",
          name: "Page View",
          components: [
            // Valid: dataElementId resolves on the property → not modified.
            {
              id: "RC_VALID",
              name: "Valid action",
              settings: { dataElementId: "DE_NEW", dataElementName: "MyVar" },
            },
            // Stale + unique-name → REPAIRED.
            {
              id: "RC_REPAIR",
              name: "Repairable action",
              settings: { dataElementId: "DE_OLD", dataElementName: "MyVar" },
            },
          ],
        },
        {
          id: "R2",
          name: "Click",
          components: [
            // Stale + no name match → SKIPPED.
            {
              id: "RC_NOMATCH",
              name: "Unmatched action",
              settings: {
                dataElementId: "DE_OLD",
                dataElementName: "Nonexistent",
              },
            },
            // Stale + missing name → SKIPPED.
            {
              id: "RC_NONAME",
              name: "Nameless action",
              settings: { dataElementId: "DE_OLD" },
            },
          ],
        },
        {
          id: "R3",
          name: "Submit",
          components: [
            // Stale + unique-name but PATCH fails → FAILED.
            {
              id: "RC_FAIL",
              name: "Failing action",
              settings: { dataElementId: "DE_OLD", dataElementName: "MyVar" },
            },
          ],
        },
      ]),
      ruleComponentPatchHandler(),
    );
    failingPatchIds.add("RC_FAIL");

    view = await renderSection();

    await field(view.getByTestId("repairStaleDataElementsButton")).click();
    await field(view.getByTestId("repairConfirmStartButton")).click();
    await field(view.getByTestId("repairSummaryDialog")).expectVisible();

    // Only the unique-name-match action should have been PATCHed.
    expect(patchedIds.map((p) => p.id).sort()).toEqual(["RC_REPAIR"]);
    expect(patchedIds[0].body.data.attributes.settings).toBe(
      JSON.stringify({ dataElementId: "DE_NEW", dataElementName: "MyVar" }),
    );

    await field(
      view.getByTestId("repairSummarySkippedAccordion"),
    ).expectVisible();
    await field(
      view.getByTestId("repairSummaryFailedAccordion"),
    ).expectVisible();
  });

  it("recovers a stale action that has no saved dataElementName by looking up the source DE via /data_elements/:id", async () => {
    worker.use(
      dataElementsPageHandler([
        variableDataElement("DE_NEW", "Recovered Variable"),
      ]),
      // The stale ID resolves cross-property (Reactor IDs are global). The
      // returned name lets the orchestrator find the matching DE on this
      // property and repair the action.
      dataElementByIdHandler({
        DE_OLD: { id: "DE_OLD", name: "Recovered Variable" },
      }),
      ...propertyHandlers([
        {
          id: "R1",
          name: "Page View",
          components: [
            {
              id: "RC_RECOVER",
              name: "Stale action with no saved name",
              settings: { dataElementId: "DE_OLD" },
            },
          ],
        },
      ]),
      ruleComponentPatchHandler(),
    );

    view = await renderSection();

    await field(view.getByTestId("repairStaleDataElementsButton")).click();
    await field(view.getByTestId("repairConfirmStartButton")).click();
    await field(view.getByTestId("repairSummaryDialog")).expectVisible();

    expect(patchedIds.map((p) => p.id)).toEqual(["RC_RECOVER"]);
    // The repair writes both the new ID and the recovered name so the action
    // is self-recoverable for future stale-ID scenarios.
    expect(patchedIds[0].body.data.attributes.settings).toBe(
      JSON.stringify({
        dataElementId: "DE_NEW",
        dataElementName: "Recovered Variable",
      }),
    );
  });

  it("Run again is idempotent: a second run after a repair finds zero stale references", async () => {
    const dataElements = [variableDataElement("DE_NEW", "MyVar")];
    // The component's settings live in this closure so the patch handler can
    // mutate them and the per-rule components handler can re-emit the updated
    // state.
    let componentSettings = {
      dataElementId: "DE_OLD",
      dataElementName: "MyVar",
    };

    worker.use(
      http.get("https://reactor.adobe.io/properties/PR1234/data_elements", () =>
        HttpResponse.json({
          data: dataElements,
          meta: {
            pagination: {
              next_page: null,
              total_count: dataElements.length,
            },
          },
        }),
      ),
      http.get("https://reactor.adobe.io/properties/PR1234/rules", () =>
        HttpResponse.json(
          buildRulesListBody([{ id: "R1", name: "Page View" }]),
        ),
      ),
      http.get(
        "https://reactor.adobe.io/rules/:ruleId/rule_components",
        ({ params }) => {
          if (params.ruleId !== "R1") {
            return HttpResponse.json(buildComponentsBody([]));
          }
          return HttpResponse.json(
            buildComponentsBody([
              {
                id: "RC_REPAIR",
                name: "Repairable action",
                settings: componentSettings,
              },
            ]),
          );
        },
      ),
      http.patch(
        "https://reactor.adobe.io/rule_components/:id",
        async ({ params, request }) => {
          const body = await request.json();
          patchedIds.push({ id: params.id, body });
          componentSettings = JSON.parse(body.data.attributes.settings);
          return HttpResponse.json({
            data: {
              id: params.id,
              attributes: { settings: body.data.attributes.settings },
            },
          });
        },
      ),
    );

    view = await renderSection();

    // First run
    await field(view.getByTestId("repairStaleDataElementsButton")).click();
    await field(view.getByTestId("repairConfirmStartButton")).click();
    await field(view.getByTestId("repairSummaryDialog")).expectVisible();
    expect(patchedIds).toHaveLength(1);

    // Run again
    await field(view.getByTestId("repairSummaryRunAgainButton")).click();
    await field(view.getByTestId("repairConfirmStartButton")).click();
    await field(view.getByTestId("repairSummaryDialog")).expectVisible();

    // Second run should have issued no additional PATCH.
    expect(patchedIds).toHaveLength(1);
  });

  it("Hide preserves the operation: dialog closes, section shows progress, reopen via Show progress", async () => {
    // Gate the per-rule components fetch so we can observe the running state
    // before the operation completes.
    let releaseComponents;
    const componentsGate = new Promise((resolve) => {
      releaseComponents = resolve;
    });

    worker.use(
      dataElementsPageHandler([variableDataElement("DE_NEW", "MyVar")]),
      http.get("https://reactor.adobe.io/properties/PR1234/rules", () =>
        HttpResponse.json(buildRulesListBody([{ id: "R1", name: "Rule One" }])),
      ),
      http.get(
        "https://reactor.adobe.io/rules/:ruleId/rule_components",
        async () => {
          await componentsGate;
          return HttpResponse.json(
            buildComponentsBody([
              {
                id: "RC1",
                name: "An action",
                settings: {
                  dataElementId: "DE_OLD",
                  dataElementName: "MyVar",
                },
              },
            ]),
          );
        },
      ),
      ruleComponentPatchHandler(),
    );

    view = await renderSection();

    await field(view.getByTestId("repairStaleDataElementsButton")).click();
    await field(view.getByTestId("repairConfirmStartButton")).click();

    // We're in the running state with the dialog visible (rules fetch is
    // still gated). Click Hide.
    await field(view.getByTestId("repairHideButton")).click();

    // Section panel should now show the running tally and reopen button.
    await field(view.getByTestId("repairRunningHiddenTally")).expectVisible();
    await field(view.getByTestId("repairShowProgressButton")).expectVisible();

    // Re-open the dialog via Show progress.
    await field(view.getByTestId("repairShowProgressButton")).click();
    await field(view.getByTestId("repairRunningDialog")).expectVisible();

    // Let the run complete and confirm the operation continued.
    releaseComponents();
    await field(view.getByTestId("repairSummaryDialog")).expectVisible();
    expect(patchedIds.map((p) => p.id)).toEqual(["RC1"]);
  });

  it("Cancel from section panel after Hide aborts the operation", async () => {
    // Gate the per-rule components fetch so we can cancel before it returns.
    let releaseComponents;
    let componentsRequestSignal;
    const componentsGate = new Promise((resolve) => {
      releaseComponents = resolve;
    });

    worker.use(
      dataElementsPageHandler([variableDataElement("DE_NEW", "MyVar")]),
      http.get("https://reactor.adobe.io/properties/PR1234/rules", () =>
        HttpResponse.json(buildRulesListBody([{ id: "R1", name: "Rule" }])),
      ),
      http.get(
        "https://reactor.adobe.io/rules/:ruleId/rule_components",
        async ({ request }) => {
          componentsRequestSignal = request.signal;
          await componentsGate;
          if (componentsRequestSignal.aborted) {
            throw new Error("aborted");
          }
          return HttpResponse.json(buildComponentsBody([]));
        },
      ),
      ruleComponentPatchHandler(),
    );

    view = await renderSection();

    await field(view.getByTestId("repairStaleDataElementsButton")).click();
    await field(view.getByTestId("repairConfirmStartButton")).click();

    // Hide the dialog while the fetch is pending.
    await field(view.getByTestId("repairHideButton")).click();
    await field(
      view.getByTestId("repairCancelFromPanelButton"),
    ).expectVisible();

    // Cancel from the section panel.
    await field(view.getByTestId("repairCancelFromPanelButton")).click();
    releaseComponents();

    // Section should transition to summaryHidden showing "Last run cancelled".
    await field(view.getByTestId("repairLastRunSummary")).expectVisible();
    await field(view.getByTestId("repairShowDetailsButton")).expectVisible();
    expect(patchedIds).toHaveLength(0);
  });

  it("dialog cannot be dismissed via Escape while the operation is running", async () => {
    let releaseRules;
    const rulesGate = new Promise((resolve) => {
      releaseRules = resolve;
    });

    worker.use(
      dataElementsPageHandler([]),
      http.get("https://reactor.adobe.io/properties/PR1234/rules", async () => {
        await rulesGate;
        return HttpResponse.json(buildRulesListBody([]));
      }),
    );

    view = await renderSection();

    await field(view.getByTestId("repairStaleDataElementsButton")).click();
    await field(view.getByTestId("repairConfirmStartButton")).click();
    await field(view.getByTestId("repairRunningDialog")).expectVisible();

    // Press Escape — the running dialog should NOT close.
    document.activeElement?.blur?.();
    const evt = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(evt);

    // Dialog still visible.
    await field(view.getByTestId("repairRunningDialog")).expectVisible();

    // Now let the run finish so afterEach cleanup is graceful.
    releaseRules();
    await field(view.getByTestId("repairSummaryDialog")).expectVisible();
  });
});
