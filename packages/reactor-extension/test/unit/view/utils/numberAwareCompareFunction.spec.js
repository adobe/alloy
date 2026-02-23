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
import numberAwareCompareFunction from "../../../../src/view/utils/numberAwareCompareFunction";

describe("numberAwareCompareFunction", () => {
  it("compares evar2 and evar10", () => {
    expect(["evar10", "evar2"].sort(numberAwareCompareFunction)).toEqual([
      "evar2",
      "evar10",
    ]);
  });

  it("compares 2 and 10", () => {
    expect(["10", "2"].sort(numberAwareCompareFunction)).toEqual(["2", "10"]);
  });

  it("compares numbers", () => {
    expect(numberAwareCompareFunction("evar2", "evar10")).toBeLessThan(0);
    expect(numberAwareCompareFunction("evar10", "evar2")).toBeGreaterThan(0);
    expect(numberAwareCompareFunction("100", "100")).toEqual(0);
    expect(numberAwareCompareFunction("", "")).toEqual(0);
    expect(numberAwareCompareFunction("a", "")).toBeGreaterThan(0);
    expect(numberAwareCompareFunction("10", "")).toBeGreaterThan(0);
  });

  it("compares with multiple numbers", () => {
    expect(
      ["a10a10", "a10a2", "a2a10", "a2a2"].sort(numberAwareCompareFunction),
    ).toEqual(["a2a2", "a2a10", "a10a2", "a10a10"]);
  });

  it("compares decimals", () => {
    expect(
      ["1.1", "1.02", "1.003", "1.1.2", "1.1.1"].sort(
        numberAwareCompareFunction,
      ),
    ).toEqual(["1.1", "1.1.1", "1.1.2", "1.02", "1.003"]);
  });

  it("compares with periods", () => {
    expect(["a.b", "a.a", "b.a"].sort(numberAwareCompareFunction)).toEqual([
      "a.a",
      "a.b",
      "b.a",
    ]);
  });

  it("handles non-strings", () => {
    const values = [undefined, null, 0, 42, { a: "foo" }, "foo"];
    const result = values.sort(numberAwareCompareFunction);
    expect(result).toBeDefined();
    expect(result).toHaveLength(values.length);
    // Verify the function doesn't throw errors for non-string values
    expect(() => values.sort(numberAwareCompareFunction)).not.toThrow();
  });
});
