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

import { describe, it, expect } from "vitest";
import isNumber from "../../../../src/utils/isNumber.js";

describe("isNumber", () => {
  it("returns true if the value is a number", () => {
    [123, 123.45, -123, -123.45].forEach((value) =>
      expect(isNumber(value)).toBe(true),
    );
  });

  it("returns false if the value is not a number", () => {
    [null, undefined, NaN, "abc", "123"].forEach((value) =>
      expect(isNumber(value)).toBe(false),
    );
  });
});
