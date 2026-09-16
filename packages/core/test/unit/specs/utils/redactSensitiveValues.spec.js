/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { describe, it, expect } from "vitest";
import redactSensitiveValues from "../../../../src/utils/redactSensitiveValues.js";

describe("redactSensitiveValues", () => {
  it("redacts a top-level key matching the default pattern", () => {
    const result = redactSensitiveValues({ clientSecret: "shh" });
    expect(result).toEqual({ clientSecret: "[REDACTED]" });
  });

  it("redacts a nested key matching the default pattern", () => {
    const result = redactSensitiveValues({
      edgeCredentials: { clientId: "abc", clientSecret: "shh" },
    });
    expect(result).toEqual({
      edgeCredentials: { clientId: "abc", clientSecret: "[REDACTED]" },
    });
  });

  it("redacts a matching key inside an array of objects", () => {
    const result = redactSensitiveValues({
      accounts: [{ password: "shh1" }, { password: "shh2" }],
    });
    expect(result).toEqual({
      accounts: [{ password: "[REDACTED]" }, { password: "[REDACTED]" }],
    });
  });

  it("matches case-insensitively and by substring", () => {
    const result = redactSensitiveValues({ CLIENT_SECRET: "shh" });
    expect(result).toEqual({ CLIENT_SECRET: "[REDACTED]" });
  });

  it("leaves non-matching keys untouched", () => {
    const input = { orgId: "abc@AdobeOrg", datastreamId: "def" };
    expect(redactSensitiveValues(input)).toEqual(input);
  });

  it("accepts a custom sensitive-key pattern", () => {
    const result = redactSensitiveValues({ apiKey: "shh" }, /apiKey/i);
    expect(result).toEqual({ apiKey: "[REDACTED]" });
  });

  it("does not mutate the input", () => {
    const input = { edgeCredentials: { clientSecret: "shh" } };
    redactSensitiveValues(input);
    expect(input).toEqual({ edgeCredentials: { clientSecret: "shh" } });
  });

  it("returns undefined unchanged instead of throwing", () => {
    expect(redactSensitiveValues(undefined)).toBeUndefined();
  });

  it("returns other primitives unchanged", () => {
    expect(redactSensitiveValues(null)).toBeNull();
    expect(redactSensitiveValues("hello")).toBe("hello");
    expect(redactSensitiveValues(42)).toBe(42);
  });
});
