/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { beforeEach, describe, expect, it, vi } from "vitest";
import createGetEcidFromCookie from "../../../../../src/components/CookieReader/createGetEcidFromCookie.js";

describe("Identity::createGetEcidFromCookie", () => {
  let cookieValue;
  let cookieJar;
  let getEcidFromCookie;
  beforeEach(() => {
    cookieValue =
      "CiYxNDAxNTI0NjEzODM4MjI2ODk1MTgwNTkyMTYxNjkxNTc0MzEyOFISCIelhf%5FOMRABGAEqA09SMjAA8AHX%5F4DZlzI%3D";
    cookieJar = { get: vi.fn().mockReturnValue(cookieValue) };
    getEcidFromCookie = createGetEcidFromCookie({
      orgId: "TEST_ORG",
      cookieJar,
    });
  });

  it("should return the ecid from the cookie", () => {
    const result = getEcidFromCookie();
    expect(result).toBe("14015246138382268951805921616915743128");
  });
});
