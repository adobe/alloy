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
import toError from "../../../../src/utils/toError.js";

describe("toError", () => {
  it("returns an error if value is not an error", () => {
    const message = "Conundrum encountered.";
    const result = toError(message);
    expect(result).toEqual(expect.any(Error));
    expect(result.message).toBe("Conundrum encountered.");
  });
  it("returns the value unmodified if value is an error", () => {
    const error = new Error("Conundrum encountered.");
    const result = toError(error);
    expect(result).toBe(error);
  });
});
