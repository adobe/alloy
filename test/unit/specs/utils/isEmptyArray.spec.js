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

import isEmptyArray from "../../../../src/utils/isEmptyArray";

describe("isEmptyArray", () => {
  it("returns false when array with values", () => {
    expect(isEmptyArray([1, 2, 3])).toBe(false);
  });

  it("returns true when array is empty", () => {
    expect(isEmptyArray([])).toBe(true);
  });

  it("returns false when undefined or null", () => {
    expect(isEmptyArray(undefined)).toBe(false);
    expect(isEmptyArray(null)).toBe(false);
  });

  it("returns false when non array", () => {
    expect(isEmptyArray("123")).toBe(false);
  });
});
