/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import isBlankString from "../../../../src/utils/isBlankString";

describe("isBlankString", () => {
  it("returns true when null", () => {
    expect(isBlankString(null)).toBe(true);
  });

  it("returns true when not a string", () => {
    expect(isBlankString(42)).toBe(true);
  });

  it("returns true for a blank string", () => {
    expect(isBlankString("")).toBe(true);
  });

  it("returns false for a string", () => {
    expect(isBlankString("hi")).toBe(false);
  });
});
