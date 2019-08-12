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

import isInteger from "../../../../src/utils/isInteger";
import isNumber from "../../../../src/utils/isNumber";

describe("isInteger", () => {
  it("tests", () => {
    expect(isInteger(null)).toBe(false);
    expect(isInteger(undefined)).toBe(false);
    expect(isInteger("abc")).toBe(false);
    expect(isNumber(parseInt("abc", 10))).toBe(false);
    expect(isInteger("123")).toBe(false);
    expect(isInteger(123)).toBe(true);
    expect(isInteger(123.45)).toBe(false);
    expect(isInteger(-123)).toBe(true);
    expect(isInteger(-123.45)).toBe(false);
  });
});
