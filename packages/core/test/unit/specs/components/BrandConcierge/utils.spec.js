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
import { vi, beforeEach, afterEach, describe, it, expect } from "vitest";
import { getPageSurface, getConciergeSessionCookie } from "../../../../../src/components/BrandConcierge/utils.js";

describe("BrandConcierge utils", () => {
  describe("getConciergeSessionCookie", () => {
    let mockLoggingCookieJar;
    let mockConfig;

    beforeEach(() => {
      mockLoggingCookieJar = {
        get: vi.fn()
      };
      mockConfig = {
        orgId: "test-org-id"
      };
    });

    it("retrieves the concierge session cookie with correct name", () => {
      const expectedCookieValue = "session-123";
      mockLoggingCookieJar.get.mockReturnValue(expectedCookieValue);

      const result = getConciergeSessionCookie({
        loggingCookieJar: mockLoggingCookieJar,
        config: mockConfig
      });

      expect(mockLoggingCookieJar.get).toHaveBeenCalledWith(
        "kndctr_test-org-id_bc_session_id"
      );
      expect(result).toBe(expectedCookieValue);
    });

    it("handles different org IDs", () => {
      mockConfig.orgId = "different-org";

      getConciergeSessionCookie({
        loggingCookieJar: mockLoggingCookieJar,
        config: mockConfig
      });

      expect(mockLoggingCookieJar.get).toHaveBeenCalledWith(
        "kndctr_different-org_bc_session_id"
      );
    });
  });
});