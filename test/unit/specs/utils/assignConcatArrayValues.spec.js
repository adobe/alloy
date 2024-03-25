/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import assignConcatArrayValues from "../../../../src/utils/assignConcatArrayValues";

describe("assignConcatArrayValues", () => {
  it("throws an error if no arguments are passed", () => {
    expect(() => assignConcatArrayValues()).toThrowError();
  });

  it("returns an empty array if an empty array is passed", () => {
    const obj = [];
    expect(assignConcatArrayValues(obj)).toBe(obj);
  });

  it("returns the first object if only one argument is passed", () => {
    const obj = {};
    expect(assignConcatArrayValues(obj)).toBe(obj);
  });

  it("works with two objects with different properties", () => {
    const obj1 = { a: 1 };
    const obj2 = { b: 2 };
    const result = assignConcatArrayValues(obj1, obj2);
    expect(result).toEqual({ a: 1, b: 2 });
    expect(result).toBe(obj1);
  });

  it("works with two objects with the same property", () => {
    expect(assignConcatArrayValues({ a: 1 }, { a: 2 })).toEqual({ a: 2 });
  });

  it("works with two objects with the same property that is an array", () => {
    expect(assignConcatArrayValues({ a: [1] }, { a: [2] })).toEqual({
      a: [1, 2]
    });
  });

  it("works with three objects with the same property that is an array", () => {
    expect(assignConcatArrayValues({ a: [1] }, { a: [] }, { a: [3] })).toEqual({
      a: [1, 3]
    });
  });

  it("works with three objects with the same property that is an array and different properties", () => {
    expect(
      assignConcatArrayValues(
        { a: [1] },
        { a: [], c: true, d: false },
        { a: [3], b: "2", e: null }
      )
    ).toEqual({
      a: [1, 3],
      b: "2",
      c: true,
      d: false,
      e: null
    });
  });

  it("skips non-objects", () => {
    expect(
      assignConcatArrayValues({ a: [1] }, null, { a: [3] }, false, [], 5)
    ).toEqual({
      a: [1, 3]
    });
  });
});
