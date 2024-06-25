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

import toArray from "../../../../src/utils/toArray.js";

describe("toArray", () => {
  it("does not convert value if already an array", () => {
    const value = [];
    expect(toArray(value)).toBe(value);
  });

  it("converts undefined to empty array", () => {
    expect(toArray()).toEqual([]);
  });

  it("converts null to empty array", () => {
    expect(toArray(null)).toEqual([]);
  });

  it("converts array-like value to array", () => {
    const result = toArray(document.querySelectorAll("body"));
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(document.body);
  });
});
