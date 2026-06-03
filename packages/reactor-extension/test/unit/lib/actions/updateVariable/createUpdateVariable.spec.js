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
import deepAssign from "../../../helpers/deepAssign";
import createUpdateVariable from "../../../../../src/lib/actions/updateVariable/createUpdateVariable";
import createVariableStore from "../../../../../src/lib/createVariableStore";

describe("Update variable", () => {
  let variableStore;
  let updateVariable;

  beforeEach(() => {
    variableStore = createVariableStore();
    updateVariable = createUpdateVariable({ variableStore, deepAssign });
  });

  it("handles an empty update", () => {
    updateVariable({ data: {}, dataElementId: "a", transforms: {} });
    expect(variableStore.get("a")).toEqual({});
  });

  it("updates a variable", () => {
    variableStore.set("var1", { a: 1, b: 2 });
    updateVariable({
      data: { a: 3, d: 4 },
      dataElementId: "var1",
      transforms: {},
    });
    expect(variableStore.get("var1")).toEqual({ a: 3, b: 2, d: 4 });
  });

  it("leaves other variables alone", () => {
    variableStore.set("var1", { a: 1 });
    updateVariable({
      data: { b: 2 },
      dataElementId: "var2",
      transforms: {},
    });
    expect(variableStore.get("var1")).toEqual({ a: 1 });
    expect(variableStore.get("var2")).toEqual({ b: 2 });
  });

  it("applies a clear transform", () => {
    variableStore.set("var1", { a: { b: { c: 3 } } });
    updateVariable({
      data: {},
      dataElementId: "var1",
      transforms: { "a.b": { clear: true } },
    });
    expect(variableStore.get("var1")).toEqual({ a: {} });
  });

  it("clears before setting values", () => {
    variableStore.set("var1", { a: { b: { c: 3 } }, e: 5 });
    updateVariable({
      data: { a: { b: { d: 4 } } },
      dataElementId: "var1",
      transforms: { "a.b": { clear: true } },
    });
    expect(variableStore.get("var1")).toEqual({ a: { b: { d: 4 } }, e: 5 });
  });

  it("applies multiple clear transforms", () => {
    variableStore.set("var1", { a: 1, b: 2, c: 3, d: [1, 2, 3] });
    updateVariable({
      data: {},
      dataElementId: "var1",
      transforms: {
        a: { clear: true },
        c: { clear: true },
        "d.1": { clear: true },
      },
    });
    expect(variableStore.get("var1")).toEqual({ b: 2, d: [1, 3] });
  });

  it("clears the entire variable", () => {
    variableStore.set("var1", { a: 1 });
    updateVariable({
      data: {},
      dataElementId: "var1",
      transforms: { "": { clear: true } },
    });
    expect(variableStore.get("var1")).toEqual({});
  });

  it("updates a variable after clearing the entire variable", () => {
    variableStore.set("var1", { a: 1 });
    updateVariable({
      data: { b: 2 },
      dataElementId: "var1",
      transforms: { "": { clear: true } },
    });
    expect(variableStore.get("var1")).toEqual({ b: 2 });
  });

  it("uses dataElementId as the store key when both id and name are provided", () => {
    updateVariable({
      data: { a: 1 },
      dataElementName: "myVariable",
      dataElementId: "DE123",
      transforms: {},
    });
    expect(variableStore.get("DE123")).toEqual({ a: 1 });
    expect(variableStore.get("myVariable")).toBeUndefined();
  });

  it("falls back to dataElementName as the store key when no id is provided", () => {
    updateVariable({
      data: { a: 1 },
      dataElementName: "myVariable",
      transforms: {},
    });
    expect(variableStore.get("myVariable")).toEqual({ a: 1 });
  });

  describe("store key consistency across rule configurations", () => {
    it("Case 1+2: old rules (id-only) and new rules (id+name) with the same id merge into the same entry", () => {
      updateVariable({
        data: { a: 1, b: 2 },
        dataElementId: "DE123",
        transforms: {},
      });
      updateVariable({
        data: { c: 3 },
        dataElementName: "myVariable",
        dataElementId: "DE123",
        transforms: {},
      });
      expect(variableStore.get("DE123")).toEqual({ a: 1, b: 2, c: 3 });
      expect(variableStore.get("myVariable")).toBeUndefined();
    });

    it("Case 3: all rules on a copied property share the same (outdated) id — data remains consistent", () => {
      // After a property copy, all rules still have the original id until re-saved.
      updateVariable({
        data: { page: "home" },
        dataElementName: "MyVar",
        dataElementId: "DE-original",
        transforms: {},
      });
      updateVariable({
        data: { user: "guest" },
        dataElementName: "MyVar",
        dataElementId: "DE-original",
        transforms: {},
      });
      expect(variableStore.get("DE-original")).toEqual({
        page: "home",
        user: "guest",
      });
      expect(variableStore.get("MyVar")).toBeUndefined();
    });

    it("edge case: partially re-saved rules on a copied property write to separate entries when ids differ", () => {
      // Known limitation: data splits until all rules are re-saved on the copied property.
      updateVariable({
        data: { a: 1 },
        dataElementName: "MyVar",
        dataElementId: "DE-original",
        transforms: {},
      });
      updateVariable({
        data: { b: 2 },
        dataElementName: "MyVar",
        dataElementId: "DE-copy",
        transforms: {},
      });
      expect(variableStore.get("DE-original")).toEqual({ a: 1 });
      expect(variableStore.get("DE-copy")).toEqual({ b: 2 });
    });

    it("name-only fallback reuses an existing id-keyed entry if the name was previously registered", () => {
      updateVariable({
        data: { a: 1 },
        dataElementName: "myVariable",
        dataElementId: "DE123",
        transforms: {},
      });
      // No id — should find the existing id-keyed entry via the name index, not create a separate name-keyed one.
      updateVariable({
        data: { b: 2 },
        dataElementName: "myVariable",
        transforms: {},
      });
      expect(variableStore.get("DE123")).toEqual({ a: 1, b: 2 });
      expect(variableStore.get("myVariable")).toBeUndefined();
    });

    it("name-only write before id+name write: earlier data is migrated and not orphaned", () => {
      // Name-only rule fires first — no id available yet.
      updateVariable({
        data: { a: 1 },
        dataElementName: "myVariable",
        transforms: {},
      });
      // Id+name rule fires second — registerName migrates the name-keyed entry to the id key.
      updateVariable({
        data: { b: 2 },
        dataElementName: "myVariable",
        dataElementId: "DE123",
        transforms: {},
      });
      expect(variableStore.get("DE123")).toEqual({ a: 1, b: 2 });
      expect(variableStore.get("myVariable")).toBeUndefined();
    });
  });

  describe("updates existing variable using dataElementId when both id and name provided", () => {
    it("merges into the id-keyed entry", () => {
      variableStore.set("DE123", { a: 1, b: 2 });
      updateVariable({
        data: { a: 3, c: 4 },
        dataElementName: "myVariable",
        dataElementId: "DE123",
        transforms: {},
      });
      expect(variableStore.get("DE123")).toEqual({ a: 3, b: 2, c: 4 });
    });

    it("applies clear transform to the id-keyed entry", () => {
      variableStore.set("DE123", { a: { b: { c: 3 } } });
      updateVariable({
        data: {},
        dataElementName: "myVariable",
        dataElementId: "DE123",
        transforms: { "a.b": { clear: true } },
      });
      expect(variableStore.get("DE123")).toEqual({ a: {} });
    });
  });

  describe("sequential updates should merge analytics events", () => {
    it("merges events from sequential rules", () => {
      updateVariable({
        data: { __adobe: { analytics: { events: "event99" } } },
        dataElementId: "v",
        transforms: {},
      });
      updateVariable({
        data: { __adobe: { analytics: { events: "event9" } } },
        dataElementId: "v",
        transforms: {},
      });

      expect(variableStore.get("v").__adobe.analytics.events).toBe(
        "event99,event9",
      );
    });

    it("merges events while preserving other analytics properties", () => {
      updateVariable({
        data: { __adobe: { analytics: { events: "event99", eVar1: "value" } } },
        dataElementId: "v",
        transforms: {},
      });
      updateVariable({
        data: { __adobe: { analytics: { events: "event1" } } },
        dataElementId: "v",
        transforms: {},
      });

      expect(variableStore.get("v").__adobe.analytics.events).toBe(
        "event99,event1",
      );
      expect(variableStore.get("v").__adobe.analytics.eVar1).toBe("value");
    });

    it("preserves serialized event syntax when merging", () => {
      updateVariable({
        data: {
          __adobe: { analytics: { events: "event1:abc123=5" } },
        },
        dataElementId: "v",
        transforms: {},
      });
      updateVariable({
        data: { __adobe: { analytics: { events: "event9" } } },
        dataElementId: "v",
        transforms: {},
      });

      expect(variableStore.get("v").__adobe.analytics.events).toBe(
        "event1:abc123=5,event9",
      );
    });

    it("merges events across three sequential rules", () => {
      updateVariable({
        data: { __adobe: { analytics: { events: "event99" } } },
        dataElementId: "v",
        transforms: {},
      });
      updateVariable({
        data: { __adobe: { analytics: { events: "event4" } } },
        dataElementId: "v",
        transforms: {},
      });
      updateVariable({
        data: { __adobe: { analytics: { events: "event9" } } },
        dataElementId: "v",
        transforms: {},
      });

      expect(variableStore.get("v").__adobe.analytics.events).toBe(
        "event99,event4,event9",
      );
    });

    it("does not merge events when events path is cleared", () => {
      updateVariable({
        data: { __adobe: { analytics: { events: "event99" } } },
        dataElementId: "v",
        transforms: {},
      });
      updateVariable({
        data: { __adobe: { analytics: { events: "event1" } } },
        dataElementId: "v",
        transforms: { "__adobe.analytics.events": { clear: true } },
      });

      expect(variableStore.get("v").__adobe.analytics.events).toBe("event1");
    });
  });
});
