/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { describe, it, expect, beforeEach } from "vitest";
import createGetVariable from "../../../../../src/lib/dataElements/variable/createGetVariable";
import createUpdateVariable from "../../../../../src/lib/actions/updateVariable/createUpdateVariable";
import createVariableStore from "../../../../../src/lib/createVariableStore";
import deepAssign from "../../../helpers/deepAssign";

describe("Variable data element", () => {
  let variableStore;
  let getVariable;

  beforeEach(() => {
    variableStore = createVariableStore();
    getVariable = createGetVariable({ variableStore });
  });

  it("returns empty object when variable does not exist", () => {
    const result = getVariable({ dataElementId: "DE123" });
    expect(result).toEqual({});
  });

  it("returns variable by dataElementId when it exists", () => {
    variableStore.set("DE123", { a: 1, b: 2 });
    const result = getVariable({
      dataElementName: "myVariable",
      dataElementId: "DE123",
    });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("returns variable by dataElementId when only id is provided", () => {
    variableStore.set("DE123", { e: 5 });
    const result = getVariable({ dataElementId: "DE123" });
    expect(result).toEqual({ e: 5 });
  });

  it("searches by name index when id is not in the store — does not treat name as a key", () => {
    variableStore.set("DE123", { c: 3, d: 4 });
    variableStore.registerName("DE123", "myVariable");
    const result = getVariable({
      dataElementName: "myVariable",
      dataElementId: "nonexistent",
    });
    expect(result).toEqual({ c: 3, d: 4 });
    // Confirm no name-keyed entry was created.
    expect(variableStore.get("myVariable")).toBeUndefined();
  });

  it("returns empty object when neither id nor registered name exist in store", () => {
    const result = getVariable({
      dataElementName: "nonexistent",
      dataElementId: "alsoNonexistent",
    });
    expect(result).toEqual({});
  });

  describe("round-trip: get reads what update writes", () => {
    let updateVariable;

    beforeEach(() => {
      updateVariable = createUpdateVariable({ variableStore, deepAssign });
    });

    it("Case 1: old rule (id-only) — get with same id retrieves the data", () => {
      updateVariable({
        data: { page: "home" },
        dataElementId: "DE123",
        transforms: {},
      });
      const result = getVariable({ dataElementId: "DE123" });
      expect(result).toEqual({ page: "home" });
    });

    it("Case 2: new rule (id+name) — get with same id+name retrieves the data", () => {
      updateVariable({
        data: { page: "home" },
        dataElementId: "DE123",
        dataElementName: "MyVar",
        transforms: {},
      });
      const result = getVariable({
        dataElementId: "DE123",
        dataElementName: "MyVar",
      });
      expect(result).toEqual({ page: "home" });
    });

    it("Case 1+2 mixed: get retrieves data accumulated by both old (id-only) and new (id+name) rules", () => {
      updateVariable({
        data: { page: "home" },
        dataElementId: "DE123",
        transforms: {},
      });
      updateVariable({
        data: { user: "guest" },
        dataElementId: "DE123",
        dataElementName: "MyVar",
        transforms: {},
      });
      const result = getVariable({
        dataElementId: "DE123",
        dataElementName: "MyVar",
      });
      expect(result).toEqual({ page: "home", user: "guest" });
    });

    it("Case 3: all rules on copied property use same outdated id — get retrieves all accumulated data", () => {
      updateVariable({
        data: { page: "home" },
        dataElementId: "DE-original",
        dataElementName: "MyVar",
        transforms: {},
      });
      updateVariable({
        data: { user: "guest" },
        dataElementId: "DE-original",
        dataElementName: "MyVar",
        transforms: {},
      });
      const result = getVariable({
        dataElementId: "DE-original",
        dataElementName: "MyVar",
      });
      expect(result).toEqual({ page: "home", user: "guest" });
    });

    it("get finds data via name index when its own id is stale but updates registered a name mapping", () => {
      // Update rules re-saved on copied property (new id), but Variable DE not yet re-saved (old id).
      updateVariable({
        data: { page: "home" },
        dataElementId: "DE-copy",
        dataElementName: "MyVar",
        transforms: {},
      });
      const result = getVariable({
        dataElementId: "DE-original",
        dataElementName: "MyVar",
      });
      expect(result).toEqual({ page: "home" });
    });
  });
});
