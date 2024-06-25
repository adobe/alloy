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

import isNonEmptyArray from "../../../../src/utils/isNonEmptyArray.js";

describe("isNonEmptyArray", () => {
  it("returns true when array with values", () => {
    expect(isNonEmptyArray([1, 2, 3])).toBe(true);
  });

  it("returns false when array is empty", () => {
    expect(isNonEmptyArray([])).toBe(false);
  });

  it("returns false when undefined or null", () => {
    expect(isNonEmptyArray(undefined)).toBe(false);
    expect(isNonEmptyArray(null)).toBe(false);
  });

  it("returns false when non array", () => {
    expect(isNonEmptyArray("123")).toBe(false);
  });
});
