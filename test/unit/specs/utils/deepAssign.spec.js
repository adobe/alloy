/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import deepAssign from "../../../../src/utils/deepAssign.js";
import assign from "../../../../src/utils/assign.js";

describe("deepAssign", () => {
  it("should throw when target is null or undefined", () => {
    expect(() => {
      deepAssign(null, { a: 1 });
    }).toThrow();

    expect(() => {
      deepAssign(undefined, { a: 1 });
    }).toThrow();
  });

  it("should assign when target is string", () => {
    const result1 = deepAssign("foo", { a: 1 });
    const result2 = assign("foo", { a: 1 });

    expect(result1).toEqual(result2);
  });

  it("should assign when target is number", () => {
    const result1 = deepAssign(1, { a: 1 });
    const result2 = assign(1, { a: 1 });

    expect(result1).toEqual(result2);
  });

  it("should assign when target is array", () => {
    const result1 = deepAssign([1], { a: 1 });
    const result2 = assign([1], { a: 1 });

    expect(result1).toEqual(result2);
  });

  it("should assign when target is object and source is string", () => {
    const result1 = deepAssign({}, "foo");
    const result2 = assign({}, "foo");

    expect(result1).toEqual(result2);
  });

  it("should assign when target is object and source is number", () => {
    const result1 = deepAssign({}, 1);
    const result2 = assign({}, 1);

    expect(result1).toEqual(result2);
  });

  it("should assign when target is object and source is array", () => {
    const result1 = deepAssign({}, [1]);
    const result2 = assign({}, [1]);

    expect(result1).toEqual(result2);
  });

  it("should assign values recursively", () => {
    const result = deepAssign(
      {},
      { a: { c: 1 } },
      { b: 2 },
      { a: { c: 2, d: 3 } },
    );

    expect(result).toEqual({ a: { c: 2, d: 3 }, b: 2 });
  });
});
