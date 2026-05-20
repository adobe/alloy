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

vi.mock("../../../../src/view/utils/fetchDataElements");
vi.mock("../../../../src/view/utils/fetchDataElement");
vi.mock("../../../../src/view/utils/fetchExtensionActionRuleComponents");
vi.mock("../../../../src/view/utils/updateRuleComponent");

import repairStaleDataElementReferences, {
  SKIP_REASON,
  PHASE,
} from "../../../../src/view/utils/repairStaleDataElementReferences";

import fetchDataElements from "../../../../src/view/utils/fetchDataElements";
import fetchDataElement from "../../../../src/view/utils/fetchDataElement";
import fetchExtensionActionRuleComponents from "../../../../src/view/utils/fetchExtensionActionRuleComponents";
import updateRuleComponent from "../../../../src/view/utils/updateRuleComponent";

const ARGS = {
  orgId: "ORG",
  imsAccess: "TOKEN",
  propertyId: "PR1",
};

const de = (id, name) => ({ id, name, settings: {} });

const action = (
  id,
  {
    dataElementId,
    dataElementName,
    name = "An action",
    ruleName = "A rule",
  } = {},
) => ({
  id,
  name,
  delegateDescriptorId: "adobe-alloy::actions::update-variable",
  ruleId: "R1",
  ruleName,
  settings: {
    ...(dataElementId !== undefined ? { dataElementId } : {}),
    ...(dataElementName !== undefined ? { dataElementName } : {}),
  },
});

const stubDataElements = (dataElements) => {
  fetchDataElements.mockResolvedValue({
    results: dataElements,
    nextPage: null,
  });
};

const stubRuleComponentPages = (pages) => {
  fetchExtensionActionRuleComponents.mockImplementation(({ page }) =>
    Promise.resolve(
      pages[page - 1] || { results: [], nextPage: null, totalCount: 0 },
    ),
  );
};

describe("repairStaleDataElementReferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateRuleComponent.mockResolvedValue({});
    // Default: the stale-ID recovery lookup fails (e.g. source DE deleted).
    // Tests that exercise the recovery path override this.
    fetchDataElement.mockRejectedValue(new Error("not found"));
  });

  it("returns zeros for an empty property", async () => {
    stubDataElements([]);
    stubRuleComponentPages([{ results: [], nextPage: null, totalCount: 0 }]);

    const result = await repairStaleDataElementReferences(ARGS);

    expect(result).toMatchObject({
      scanned: 0,
      repaired: [],
      skipped: [],
      failed: [],
      cancelled: false,
    });
    expect(updateRuleComponent).not.toHaveBeenCalled();
  });

  it("leaves valid references untouched", async () => {
    stubDataElements([de("DE1", "My Variable")]);
    stubRuleComponentPages([
      {
        results: [
          action("RC1", {
            dataElementId: "DE1",
            dataElementName: "My Variable",
          }),
        ],
        nextPage: null,
        totalCount: 1,
      },
    ]);

    const result = await repairStaleDataElementReferences(ARGS);

    expect(result.scanned).toBe(1);
    expect(result.repaired).toHaveLength(0);
    expect(result.skipped).toHaveLength(0);
    expect(updateRuleComponent).not.toHaveBeenCalled();
  });

  it("ignores actions that don't reference a data element", async () => {
    stubDataElements([de("DE1", "My Variable")]);
    stubRuleComponentPages([
      {
        results: [action("RC1", { name: "Send event" })],
        nextPage: null,
        totalCount: 1,
      },
    ]);

    const result = await repairStaleDataElementReferences(ARGS);

    expect(result.scanned).toBe(1);
    expect(result.repaired).toHaveLength(0);
    expect(result.skipped).toHaveLength(0);
    expect(result.failed).toHaveLength(0);
  });

  it("repairs a stale reference when exactly one name match exists on the property", async () => {
    stubDataElements([de("DE_NEW", "My Variable")]);
    stubRuleComponentPages([
      {
        results: [
          action("RC1", {
            dataElementId: "DE_OLD",
            dataElementName: "My Variable",
            name: "Update variable",
            ruleName: "Page View",
          }),
        ],
        nextPage: null,
        totalCount: 1,
      },
    ]);

    const result = await repairStaleDataElementReferences(ARGS);

    expect(result.repaired).toHaveLength(1);
    expect(result.repaired[0]).toEqual({
      ruleComponentId: "RC1",
      ruleName: "Page View",
      actionName: "Update variable",
      dataElementName: "My Variable",
      oldDataElementId: "DE_OLD",
      newDataElementId: "DE_NEW",
    });
    expect(result.skipped).toHaveLength(0);
    expect(updateRuleComponent).toHaveBeenCalledTimes(1);
    const call = updateRuleComponent.mock.calls[0][0];
    expect(call.ruleComponentId).toBe("RC1");
    expect(call.settings).toEqual({
      dataElementId: "DE_NEW",
      dataElementName: "My Variable",
    });
  });

  it("skips a stale action when no dataElementName is saved and the stale-ID lookup also fails", async () => {
    stubDataElements([de("DE1", "Some Variable")]);
    stubRuleComponentPages([
      {
        results: [
          action("RC1", {
            dataElementId: "DE_OLD",
            name: "Update variable",
            ruleName: "Page View",
          }),
        ],
        nextPage: null,
        totalCount: 1,
      },
    ]);
    // beforeEach already rejects fetchDataElement; this asserts that path.

    const result = await repairStaleDataElementReferences(ARGS);

    expect(result.repaired).toHaveLength(0);
    expect(result.skipped).toEqual([
      {
        ruleComponentId: "RC1",
        ruleName: "Page View",
        actionName: "Update variable",
        reason: SKIP_REASON.MISSING_NAME,
      },
    ]);
    expect(fetchDataElement).toHaveBeenCalledTimes(1);
    expect(updateRuleComponent).not.toHaveBeenCalled();
  });

  it("recovers a stale action missing dataElementName by looking up the source DE's name and repairing on a property match", async () => {
    stubDataElements([de("DE_NEW", "Recovered Variable")]);
    stubRuleComponentPages([
      {
        results: [
          action("RC1", {
            dataElementId: "DE_OLD",
            name: "Update variable",
            ruleName: "Page View",
          }),
        ],
        nextPage: null,
        totalCount: 1,
      },
    ]);
    fetchDataElement.mockResolvedValueOnce({
      id: "DE_OLD",
      name: "Recovered Variable",
      settings: {},
    });

    const result = await repairStaleDataElementReferences(ARGS);

    expect(result.repaired).toHaveLength(1);
    expect(result.skipped).toHaveLength(0);
    expect(fetchDataElement).toHaveBeenCalledWith(
      expect.objectContaining({ dataElementId: "DE_OLD" }),
    );
    const patch = updateRuleComponent.mock.calls[0][0];
    // Repair also writes dataElementName so the action is self-recoverable
    // for future stale-ID scenarios.
    expect(patch.settings).toEqual({
      dataElementId: "DE_NEW",
      dataElementName: "Recovered Variable",
    });
  });

  it("recovery: stale-ID lookup resolves but no DE on the property matches that name → no-name-match skip", async () => {
    stubDataElements([de("DE_OTHER", "Other")]);
    stubRuleComponentPages([
      {
        results: [
          action("RC1", {
            dataElementId: "DE_OLD",
            name: "Update variable",
            ruleName: "Page View",
          }),
        ],
        nextPage: null,
        totalCount: 1,
      },
    ]);
    fetchDataElement.mockResolvedValueOnce({
      id: "DE_OLD",
      name: "Recovered Variable",
      settings: {},
    });

    const result = await repairStaleDataElementReferences(ARGS);

    expect(result.skipped[0]).toMatchObject({
      ruleComponentId: "RC1",
      reason: SKIP_REASON.NO_NAME_MATCH,
    });
    expect(updateRuleComponent).not.toHaveBeenCalled();
  });

  it("recovery: caches the stale-ID lookup so identical stale IDs cause only one fetch", async () => {
    stubDataElements([de("DE_NEW", "Shared")]);
    stubRuleComponentPages([
      {
        results: [
          action("RC1", { dataElementId: "DE_OLD", name: "A1" }),
          action("RC2", { dataElementId: "DE_OLD", name: "A2" }),
          action("RC3", { dataElementId: "DE_OLD", name: "A3" }),
        ],
        nextPage: null,
        totalCount: 1,
      },
    ]);
    fetchDataElement.mockResolvedValue({
      id: "DE_OLD",
      name: "Shared",
      settings: {},
    });

    const result = await repairStaleDataElementReferences(ARGS);

    expect(result.repaired).toHaveLength(3);
    expect(fetchDataElement).toHaveBeenCalledTimes(1);
  });

  it("fresh-name fallback: saved dataElementName is stale, ID lookup yields current name, local match → repaired", async () => {
    // Scenario: the user renamed a DE on the source property without
    // re-opening this action, then copied the property. The action still
    // carries the old name, but the source DE (resolvable by ID) carries
    // the new name. Looking it up should yield a match on the destination.
    stubDataElements([de("DE_NEW", "Renamed Variable")]);
    stubRuleComponentPages([
      {
        results: [
          action("RC1", {
            dataElementId: "DE_OLD",
            dataElementName: "Old Name",
            name: "Update variable",
            ruleName: "Page View",
          }),
        ],
        nextPage: null,
        totalCount: 1,
      },
    ]);
    fetchDataElement.mockResolvedValueOnce({
      id: "DE_OLD",
      name: "Renamed Variable",
      settings: {},
    });

    const result = await repairStaleDataElementReferences(ARGS);

    expect(result.repaired).toHaveLength(1);
    expect(result.repaired[0]).toMatchObject({
      ruleComponentId: "RC1",
      dataElementName: "Renamed Variable",
      oldDataElementId: "DE_OLD",
      newDataElementId: "DE_NEW",
    });
    expect(fetchDataElement).toHaveBeenCalledTimes(1);
  });

  it("fresh-name fallback: saved name has no match and ID lookup returns the same name → no-name-match skip", async () => {
    stubDataElements([de("DE1", "Other")]);
    stubRuleComponentPages([
      {
        results: [
          action("RC1", {
            dataElementId: "DE_OLD",
            dataElementName: "My Variable",
          }),
        ],
        nextPage: null,
        totalCount: 1,
      },
    ]);
    fetchDataElement.mockResolvedValueOnce({
      id: "DE_OLD",
      name: "My Variable",
      settings: {},
    });

    const result = await repairStaleDataElementReferences(ARGS);

    expect(result.skipped[0]).toMatchObject({
      reason: SKIP_REASON.NO_NAME_MATCH,
      dataElementName: "My Variable",
    });
  });

  it("recovery: rethrows AbortError from the stale-ID lookup as a clean cancellation", async () => {
    stubDataElements([de("DE_NEW", "Anything")]);
    stubRuleComponentPages([
      {
        results: [action("RC1", { dataElementId: "DE_OLD" })],
        nextPage: null,
        totalCount: 1,
      },
    ]);
    const abortError = Object.assign(new Error("aborted"), {
      name: "AbortError",
    });
    fetchDataElement.mockRejectedValueOnce(abortError);

    const result = await repairStaleDataElementReferences(ARGS);

    expect(result.cancelled).toBe(true);
  });

  it("skips a stale action when no DE on the property matches the saved name", async () => {
    stubDataElements([de("DE1", "Other")]);
    stubRuleComponentPages([
      {
        results: [
          action("RC1", {
            dataElementId: "DE_OLD",
            dataElementName: "My Variable",
          }),
        ],
        nextPage: null,
        totalCount: 1,
      },
    ]);

    const result = await repairStaleDataElementReferences(ARGS);

    expect(result.skipped[0]).toMatchObject({
      ruleComponentId: "RC1",
      reason: SKIP_REASON.NO_NAME_MATCH,
    });
  });

  it("skips a stale action when more than one DE matches the saved name", async () => {
    stubDataElements([de("DE_A", "Dup"), de("DE_B", "Dup")]);
    stubRuleComponentPages([
      {
        results: [
          action("RC1", {
            dataElementId: "DE_OLD",
            dataElementName: "Dup",
          }),
        ],
        nextPage: null,
        totalCount: 1,
      },
    ]);

    const result = await repairStaleDataElementReferences(ARGS);

    expect(result.skipped[0]).toMatchObject({
      ruleComponentId: "RC1",
      reason: SKIP_REASON.AMBIGUOUS_NAME,
      candidates: ["DE_A", "DE_B"],
    });
    expect(updateRuleComponent).not.toHaveBeenCalled();
  });

  it("isolates per-action PATCH failures and continues with remaining actions", async () => {
    stubDataElements([de("DE_NEW", "Var1"), de("DE_NEW2", "Var2")]);
    stubRuleComponentPages([
      {
        results: [
          action("RC1", {
            dataElementId: "DE_OLD",
            dataElementName: "Var1",
            name: "A1",
          }),
          action("RC2", {
            dataElementId: "DE_OLD2",
            dataElementName: "Var2",
            name: "A2",
          }),
        ],
        nextPage: null,
        totalCount: 2,
      },
    ]);
    updateRuleComponent
      .mockRejectedValueOnce(new Error("403"))
      .mockResolvedValueOnce({});

    const result = await repairStaleDataElementReferences(ARGS);

    expect(result.repaired).toHaveLength(1);
    expect(result.failed).toEqual([
      expect.objectContaining({
        ruleComponentId: "RC1",
        actionName: "A1",
        error: "403",
      }),
    ]);
    expect(updateRuleComponent).toHaveBeenCalledTimes(2);
  });

  it("emits indexing then scanning progress events with a live tally", async () => {
    stubDataElements([de("DE_NEW", "V1")]);
    stubRuleComponentPages([
      {
        results: [
          action("RC1", { dataElementId: "DE_OLD", dataElementName: "V1" }),
        ],
        nextPage: null,
        totalCount: 1,
      },
    ]);

    const events = [];
    await repairStaleDataElementReferences({
      ...ARGS,
      onProgress: (e) => events.push(e),
    });

    expect(events[0]).toMatchObject({ phase: PHASE.INDEXING });
    const scanning = events.filter((e) => e.phase === PHASE.SCANNING);
    expect(scanning.length).toBeGreaterThan(0);
    const last = scanning[scanning.length - 1];
    expect(last).toMatchObject({
      scanned: 1,
      repaired: 1,
      skipped: 0,
      failed: 0,
      totalCount: 1,
    });
  });

  it("aborts cleanly when the signal is fired between actions", async () => {
    const controller = new AbortController();
    stubDataElements([de("DE_NEW", "Var")]);
    stubRuleComponentPages([
      {
        results: [
          action("RC1", {
            dataElementId: "DE_OLD",
            dataElementName: "Var",
            name: "A1",
          }),
          action("RC2", {
            dataElementId: "DE_OLD",
            dataElementName: "Var",
            name: "A2",
          }),
        ],
        nextPage: null,
        totalCount: 2,
      },
    ]);
    updateRuleComponent.mockImplementation(async () => {
      // After the first action gets repaired, abort before the second runs.
      controller.abort();
    });

    const result = await repairStaleDataElementReferences({
      ...ARGS,
      signal: controller.signal,
    });

    expect(result.cancelled).toBe(true);
    expect(result.scanned).toBe(1);
    expect(result.repaired).toHaveLength(1);
    expect(updateRuleComponent).toHaveBeenCalledTimes(1);
  });

  it("captures AbortError raised by a fetch as a clean cancellation", async () => {
    const controller = new AbortController();
    stubDataElements([]);
    const abortError = Object.assign(new Error("aborted"), {
      name: "AbortError",
    });
    fetchExtensionActionRuleComponents.mockRejectedValueOnce(abortError);

    const result = await repairStaleDataElementReferences({
      ...ARGS,
      signal: controller.signal,
    });

    expect(result.cancelled).toBe(true);
  });

  it("captures a fatal error from the initial data-element fetch as result.fatalError", async () => {
    fetchDataElements.mockRejectedValueOnce(new Error("401 Unauthorized"));

    const result = await repairStaleDataElementReferences(ARGS);

    expect(result.fatalError).toBe("401 Unauthorized");
    expect(result.cancelled).toBe(false);
    expect(result.scanned).toBe(0);
    expect(fetchExtensionActionRuleComponents).not.toHaveBeenCalled();
    expect(updateRuleComponent).not.toHaveBeenCalled();
  });

  it("captures a fatal error from a rule-components page fetch as result.fatalError", async () => {
    stubDataElements([]);
    fetchExtensionActionRuleComponents.mockRejectedValueOnce(
      new Error("500 Server Error"),
    );

    const result = await repairStaleDataElementReferences(ARGS);

    expect(result.fatalError).toBe("500 Server Error");
    expect(result.cancelled).toBe(false);
  });

  it("walks multiple pages of rule_components", async () => {
    stubDataElements([de("DE_NEW", "V")]);
    stubRuleComponentPages([
      {
        results: [
          action("RC1", { dataElementId: "DE_OLD", dataElementName: "V" }),
        ],
        nextPage: 2,
        totalCount: 2,
      },
      {
        results: [
          action("RC2", { dataElementId: "DE_OLD", dataElementName: "V" }),
        ],
        nextPage: null,
        totalCount: 2,
      },
    ]);

    const result = await repairStaleDataElementReferences(ARGS);

    expect(result.scanned).toBe(2);
    expect(result.repaired).toHaveLength(2);
    expect(fetchExtensionActionRuleComponents).toHaveBeenCalledTimes(2);
  });
});
