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
import isValidRegExp from "../../../../src/utils/isValidRegExp.js";

describe("isValidRegExp", () => {
  ["steel|bronze", "/a/", "/^[a-z0-9+]:///i"].forEach((value) => {
    it(`validates ${value}`, () => {
      expect(isValidRegExp(value)).toBe(true);
    });
  });
  ["[", "*"].forEach((value) => {
    it(`rejects ${value}`, () => {
      expect(isValidRegExp(value)).toBe(false);
    });
  });
});
