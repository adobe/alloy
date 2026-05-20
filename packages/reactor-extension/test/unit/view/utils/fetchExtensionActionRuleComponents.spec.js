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
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../../src/view/utils/fetchFromReactor");

import fetchExtensionActionRuleComponents from "../../../../src/view/utils/fetchExtensionActionRuleComponents";

import fetchFromReactor from "../../../../src/view/utils/fetchFromReactor";

const EXT_ACTION = "__EXTENSION_NAME__::actions::update-variable";
const EXT_EVENT = "__EXTENSION_NAME__::events::send-event";
const OTHER_ACTION = "other-extension::actions::do-thing";

const ruleResponse = (rules, nextPage = null, totalCount = null) => ({
  parsedBody: {
    data: rules.map((r) => ({
      id: r.id,
      type: "rules",
      attributes: { name: r.name },
    })),
    meta: {
      pagination: {
        next_page: nextPage,
        total_count: totalCount ?? rules.length,
      },
    },
  },
});

const componentEntry = (id, attrs = {}) => ({
  id,
  type: "rule_components",
  attributes: {
    name: "RC " + id,
    delegate_descriptor_id: EXT_ACTION,
    settings: JSON.stringify({ dataElementId: "DE1" }),
    ...attrs,
  },
});

const componentsResponse = (components, nextPage = null) => ({
  parsedBody: {
    data: components,
    meta: { pagination: { next_page: nextPage } },
  },
});

// Route mocked fetchFromReactor calls to handlers keyed by path. A handler
// is either a single response object, an array of response objects (one per
// successive call to that path — useful for paginated endpoints), or a
// function `(call) => response`.
const routeMock = (routes) => {
  const counts = {};
  fetchFromReactor.mockImplementation((call) => {
    const handler = routes[call.path];
    if (handler === undefined) {
      throw new Error(`Unrouted fetchFromReactor path: ${call.path}`);
    }
    if (Array.isArray(handler)) {
      const idx = counts[call.path] ?? 0;
      counts[call.path] = idx + 1;
      return Promise.resolve(handler[Math.min(idx, handler.length - 1)]);
    }
    if (typeof handler === "function") {
      return Promise.resolve(handler(call));
    }
    return Promise.resolve(handler);
  });
};

describe("fetchExtensionActionRuleComponents", () => {
  beforeEach(() => {
    // resetAllMocks clears mock implementations (not just call history) so
    // each test starts with a bare `fetchFromReactor` mock. clearAllMocks
    // would let an earlier test's `mockImplementation` leak forward.
    vi.resetAllMocks();
  });

  it("queries /properties/{id}/rules and then /rules/{rule_id}/rule_components per rule", async () => {
    routeMock({
      "/properties/PR1/rules": ruleResponse(
        [
          { id: "R1", name: "Page View" },
          { id: "R2", name: "Click" },
        ],
        null,
        2,
      ),
      "/rules/R1/rule_components": componentsResponse([componentEntry("RC1")]),
      "/rules/R2/rule_components": componentsResponse([componentEntry("RC2")]),
    });

    const { results, nextPage, totalCount } =
      await fetchExtensionActionRuleComponents({
        orgId: "ORG",
        imsAccess: "TOKEN",
        propertyId: "PR1",
      });

    expect(results.map((r) => r.id)).toEqual(["RC1", "RC2"]);
    expect(results[0]).toMatchObject({ ruleId: "R1", ruleName: "Page View" });
    expect(results[1]).toMatchObject({ ruleId: "R2", ruleName: "Click" });
    expect(nextPage).toBeNull();
    expect(totalCount).toBe(2);
  });

  it("filters out events, conditions, and other extensions' components", async () => {
    routeMock({
      "/properties/PR1/rules": ruleResponse([{ id: "R1", name: "Rule" }]),
      "/rules/R1/rule_components": componentsResponse([
        componentEntry("RC1"), // extension action — kept
        componentEntry("RC2", { delegate_descriptor_id: EXT_EVENT }), // event — dropped
        componentEntry("RC3", { delegate_descriptor_id: OTHER_ACTION }), // other ext — dropped
      ]),
    });

    const { results } = await fetchExtensionActionRuleComponents({
      orgId: "ORG",
      imsAccess: "TOKEN",
      propertyId: "PR1",
    });

    expect(results.map((r) => r.id)).toEqual(["RC1"]);
  });

  it("parses settings as JSON and exposes the parsed object", async () => {
    routeMock({
      "/properties/PR1/rules": ruleResponse([{ id: "R1", name: "Rule" }]),
      "/rules/R1/rule_components": componentsResponse([
        componentEntry("RC1", {
          settings: JSON.stringify({
            dataElementId: "DE9",
            dataElementName: "My Variable",
          }),
        }),
      ]),
    });

    const { results } = await fetchExtensionActionRuleComponents({
      orgId: "ORG",
      imsAccess: "TOKEN",
      propertyId: "PR1",
    });

    expect(results[0].settings).toEqual({
      dataElementId: "DE9",
      dataElementName: "My Variable",
    });
  });

  it("treats invalid settings JSON as an empty object instead of throwing", async () => {
    routeMock({
      "/properties/PR1/rules": ruleResponse([{ id: "R1", name: "Rule" }]),
      "/rules/R1/rule_components": componentsResponse([
        componentEntry("RC1", { settings: "{not json" }),
      ]),
    });

    const { results } = await fetchExtensionActionRuleComponents({
      orgId: "ORG",
      imsAccess: "TOKEN",
      propertyId: "PR1",
    });

    expect(results[0].settings).toEqual({});
  });

  it("pages through all rule_components for a single rule", async () => {
    routeMock({
      "/properties/PR1/rules": ruleResponse([{ id: "R1", name: "Rule" }]),
      "/rules/R1/rule_components": [
        componentsResponse([componentEntry("RC1")], 2),
        componentsResponse([componentEntry("RC2")], 3),
        componentsResponse([componentEntry("RC3")], null),
      ],
    });

    const { results } = await fetchExtensionActionRuleComponents({
      orgId: "ORG",
      imsAccess: "TOKEN",
      propertyId: "PR1",
    });

    expect(results.map((r) => r.id)).toEqual(["RC1", "RC2", "RC3"]);
  });

  it("returns nextPage and totalCount from the rules response", async () => {
    routeMock({
      "/properties/PR1/rules": {
        parsedBody: {
          data: [{ id: "R1", type: "rules", attributes: { name: "Rule" } }],
          meta: { pagination: { next_page: 2, total_count: 250 } },
        },
      },
      "/rules/R1/rule_components": componentsResponse([componentEntry("RC1")]),
    });

    const { nextPage, totalCount } = await fetchExtensionActionRuleComponents({
      orgId: "ORG",
      imsAccess: "TOKEN",
      propertyId: "PR1",
    });

    expect(nextPage).toBe(2);
    expect(totalCount).toBe(250);
  });

  it("passes the page number through to Reactor", async () => {
    routeMock({
      "/properties/PR1/rules": ruleResponse([]),
    });

    await fetchExtensionActionRuleComponents({
      orgId: "ORG",
      imsAccess: "TOKEN",
      propertyId: "PR1",
      page: 3,
    });

    const rulesCall = fetchFromReactor.mock.calls.find(
      ([c]) => c.path === "/properties/PR1/rules",
    );
    expect(rulesCall[0].params.get("page[number]")).toBe("3");
  });

  it("returns an empty result set when no rules exist (no per-rule fetches issued)", async () => {
    routeMock({
      "/properties/PR1/rules": ruleResponse([]),
    });

    const { results } = await fetchExtensionActionRuleComponents({
      orgId: "ORG",
      imsAccess: "TOKEN",
      propertyId: "PR1",
    });

    expect(results).toEqual([]);
    // Only the rules endpoint should have been called.
    expect(fetchFromReactor).toHaveBeenCalledTimes(1);
  });

  it("wraps non-abort errors from the rules fetch in UserReportableError", async () => {
    fetchFromReactor.mockRejectedValueOnce(new Error("boom"));

    await expect(
      fetchExtensionActionRuleComponents({
        orgId: "ORG",
        imsAccess: "TOKEN",
        propertyId: "PR1",
      }),
    ).rejects.toMatchObject({
      message: "Failed to load rules.",
    });
  });

  it("wraps non-abort errors from the per-rule components fetch in UserReportableError", async () => {
    fetchFromReactor.mockImplementation(({ path }) => {
      if (path === "/properties/PR1/rules") {
        return Promise.resolve(ruleResponse([{ id: "R1", name: "Rule" }]));
      }
      return Promise.reject(new Error("boom"));
    });

    await expect(
      fetchExtensionActionRuleComponents({
        orgId: "ORG",
        imsAccess: "TOKEN",
        propertyId: "PR1",
      }),
    ).rejects.toMatchObject({
      message: "Failed to load rule components.",
    });
  });

  it("rethrows AbortError from the rules fetch unwrapped", async () => {
    const abortError = Object.assign(new Error("aborted"), {
      name: "AbortError",
    });
    fetchFromReactor.mockRejectedValueOnce(abortError);

    await expect(
      fetchExtensionActionRuleComponents({
        orgId: "ORG",
        imsAccess: "TOKEN",
        propertyId: "PR1",
      }),
    ).rejects.toBe(abortError);
  });

  it("rethrows AbortError from a per-rule fetch unwrapped", async () => {
    const abortError = Object.assign(new Error("aborted"), {
      name: "AbortError",
    });
    fetchFromReactor.mockImplementation(({ path }) => {
      if (path === "/properties/PR1/rules") {
        return Promise.resolve(ruleResponse([{ id: "R1", name: "Rule" }]));
      }
      return Promise.reject(abortError);
    });

    await expect(
      fetchExtensionActionRuleComponents({
        orgId: "ORG",
        imsAccess: "TOKEN",
        propertyId: "PR1",
      }),
    ).rejects.toBe(abortError);
  });
});
