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

describe("Update variable", () => {
  let variableStore;
  let updateVariable;

  beforeEach(() => {
    variableStore = {};
    updateVariable = createUpdateVariable({ variableStore, deepAssign });
  });

  it("handles an empty update", () => {
    updateVariable({ data: {}, dataElementId: "a", transforms: {} });
    expect(variableStore).toEqual({ a: {} });
  });

  it("updates a variable", () => {
    variableStore.var1 = { a: 1, b: 2 };
    updateVariable({
      data: { a: 3, d: 4 },
      dataElementId: "var1",
      transforms: {},
    });
    expect(variableStore).toEqual({ var1: { a: 3, b: 2, d: 4 } });
  });

  it("leaves other variables alone", () => {
    variableStore.var1 = { a: 1 };
    updateVariable({
      data: { b: 2 },
      dataElementId: "var2",
      transforms: {},
    });
    expect(variableStore).toEqual({ var1: { a: 1 }, var2: { b: 2 } });
  });

  it("applies a clear transform", () => {
    variableStore.var1 = { a: { b: { c: 3 } } };
    updateVariable({
      data: {},
      dataElementId: "var1",
      transforms: { "a.b": { clear: true } },
    });
    expect(variableStore).toEqual({ var1: { a: {} } });
  });

  it("clears before setting values", () => {
    variableStore.var1 = { a: { b: { c: 3 } }, e: 5 };
    updateVariable({
      data: { a: { b: { d: 4 } } },
      dataElementId: "var1",
      transforms: { "a.b": { clear: true } },
    });
    expect(variableStore).toEqual({ var1: { a: { b: { d: 4 } }, e: 5 } });
  });
  it("applies multiple clear transforms", () => {
    variableStore.var1 = { a: 1, b: 2, c: 3, d: [1, 2, 3] };
    updateVariable({
      data: {},
      dataElementId: "var1",
      transforms: {
        a: { clear: true },
        c: { clear: true },
        "d.1": { clear: true },
      },
    });
    expect(variableStore).toEqual({ var1: { b: 2, d: [1, 3] } });
  });

  it("clears the entire variable", () => {
    variableStore.var1 = { a: 1 };
    updateVariable({
      data: {},
      dataElementId: "var1",
      transforms: { "": { clear: true } },
    });
    expect(variableStore).toEqual({ var1: {} });
  });

  it("updates a variable after clearing the entire variable", () => {
    variableStore.var1 = { a: 1 };
    updateVariable({
      data: { b: 2 },
      dataElementId: "var1",
      transforms: { "": { clear: true } },
    });
    expect(variableStore).toEqual({ var1: { b: 2 } });
  });
});
