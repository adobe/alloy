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

import { describe, it, expect } from "vitest";
import trimValue from "../../../../src/view/utils/trimValues";

describe("trimValues", () => {
  [
    ["  test  ", "test"],
    [{ test: "  test  " }, { test: "test" }, "nested object values"],
    [["  test  "], ["test"], "arrays"],
    [{ test: ["  test  "] }, { test: ["test"] }, "nested arrays"],
    [1, 1, "numbers"],
    [true, true, "booleans"],
    [null, null, "null"],
    [undefined, undefined, "undefined"],
    [NaN, NaN, "NaN"],
    ["", undefined, "empty string"],
    [{ test: "" }, undefined, "empty string in object"],
    [["", "test"], ["test"], "empty string in array"],
    [
      { test: ["", "test"] },
      { test: ["test"] },
      "empty string in nested array",
    ],
    [{}, undefined, "empty object"],
    [[], undefined, "empty array"],
    [{ test: {} }, undefined, "empty object in object"],
    [{ test: [] }, undefined, "empty array in object"],
    [{ test: [""] }, undefined, "empty string in array in object"],
    [
      { test: ["", "test"] },
      { test: ["test"] },
      "empty string in array in object",
    ],
    [
      { test: { a: true, b: {} } },
      { test: { a: true } },
      "empty object in object",
    ],
    [
      { test: { a: true, b: [] } },
      { test: { a: true } },
      "empty array in object",
    ],
    [
      { test: { a: true, b: [""] } },
      { test: { a: true } },
      "empty string in array in object",
    ],
    [
      { test: { a: true, b: ["", "test"] } },
      { test: { a: true, b: ["test"] } },
      "empty string in array in object",
    ],
    [
      { test: { a: true, b: {} } },
      { test: { a: true } },
      "empty object in object",
    ],
    [
      { test: { a: true, b: [] } },
      { test: { a: true } },
      "empty array in object",
    ],
    [
      { test: { a: true, b: [""] } },
      { test: { a: true } },
      "empty string in array in object",
    ],
  ].forEach(([value, expected, description]) => {
    let testTitle = "should trim";
    if (description) {
      testTitle += ` ${description}`;
    } else {
      testTitle += ` "${value}" to "${expected}"`;
    }
    it(testTitle, () => {
      expect(trimValue(value)).toEqual(expected);
    });
  });
});
