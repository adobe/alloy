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

describe("Variable data element", () => {
  let variableStore;
  let getVariable;

  beforeEach(() => {
    variableStore = {};
    getVariable = createGetVariable({ variableStore });
  });

  it("returns empty object when variable does not exist", () => {
    const result = getVariable({ dataElementId: "DE123" });
    expect(result).toEqual({});
  });

  it("returns variable by dataElementName when it exists", () => {
    variableStore.myVariable = { a: 1, b: 2 };
    const result = getVariable({
      dataElementName: "myVariable",
      dataElementId: "DE123",
    });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("falls back to dataElementId when dataElementName is not in store", () => {
    variableStore.DE123 = { c: 3, d: 4 };
    const result = getVariable({
      dataElementName: "nonexistent",
      dataElementId: "DE123",
    });
    expect(result).toEqual({ c: 3, d: 4 });
  });

  it("falls back to dataElementId when dataElementName is not provided", () => {
    variableStore.DE123 = { e: 5 };
    const result = getVariable({
      dataElementId: "DE123",
    });
    expect(result).toEqual({ e: 5 });
  });

  it("prefers dataElementName over dataElementId when both exist in store", () => {
    variableStore.myVariable = { fromName: true };
    variableStore.DE123 = { fromId: true };
    const result = getVariable({
      dataElementName: "myVariable",
      dataElementId: "DE123",
    });
    expect(result).toEqual({ fromName: true });
  });

  it("returns empty object when neither name nor id exist in store", () => {
    const result = getVariable({
      dataElementName: "nonexistent",
      dataElementId: "alsoNonexistent",
    });
    expect(result).toEqual({});
  });
});
