/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { describe, it, expect } from "vitest";
import { setValue, deletePath } from "../../../../src/lib/utils/pathUtils";

describe("pathUtils", () => {
  describe("setValue", () => {
    it("sets an object property", () => {
      expect(setValue({}, "foo", "bar")).toEqual({ foo: "bar" });
    });

    it("overwrites an object property", () => {
      expect(setValue({ a: 1, b: 2 }, "a", 3)).toEqual({ a: 3, b: 2 });
    });

    it("sets a nested property on an empty object", () => {
      expect(setValue({}, "a.b", true)).toEqual({ a: { b: true } });
    });

    it("overwrites a nested object property", () => {
      const obj = { a: { b: 2, c: 3 }, d: 4 };
      const newObj = setValue(obj, "a.c", 5);
      expect(newObj).toEqual({ a: { b: 2, c: 5 }, d: 4 });
    });

    it("sets an array value", () => {
      expect(setValue({}, "a.0", 42)).toEqual({ a: [42] });
    });

    it("sets a property on an array value", () => {
      expect(setValue({}, "a.0.b", 1)).toEqual({ a: [{ b: 1 }] });
    });

    it("sets nested arrays", () => {
      expect(setValue({}, "a.1.0", "crazy!")).toEqual({
        a: [undefined, ["crazy!"]],
      });
    });

    it("sets the whole thing", () => {
      expect(setValue({ a: 1 }, "", { b: 2 })).toEqual({ b: 2 });
    });
  });

  describe("deletePath", () => {
    it("deletes the whole thing", () => {
      expect(deletePath({ a: "b" }, "")).toEqual(undefined);
    });
    it("deletes an element in an object", () => {
      const obj = { a: "b", c: "d" };
      const newObj = deletePath(obj, "a");
      expect(Object.keys(newObj)).toEqual(["c"]);
    });
    it("deletes an element in an array", () => {
      expect(deletePath([1, 2, 3], "1")).toEqual([1, 3]);
    });
    it("deletes an element in a nested array", () => {
      const val1 = setValue({}, "a.b.c", "hello");
      const val2 = deletePath(val1, "a.b.c");
      expect(val2).toEqual({ a: { b: {} } });
    });
    it("deletes an element that isn't there", () => {
      expect(deletePath({}, "a.b.0")).toEqual({ a: { b: [] } });
    });
  });
});
