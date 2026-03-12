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
import { vi, beforeEach, describe, it, expect } from "vitest";
import { getConciergeSessionCookie } from "../../../../../src/components/BrandConcierge/utils.js";

describe("BrandConcierge utils", () => {
  describe("getConciergeSessionCookie", () => {
    let mockLoggingCookieJar;
    let mockConfig;

    beforeEach(() => {
      mockLoggingCookieJar = {
        get: vi.fn(),
      };
      mockConfig = {
        orgId: "test-org-id",
        conversation: {
          stickyConversationSession: true,
        },
      };
    });

    it("retrieves the concierge session cookie with correct name when sticky is true", () => {
      const expectedCookieValue = "session-123";
      mockLoggingCookieJar.get.mockReturnValue(expectedCookieValue);

      const result = getConciergeSessionCookie({
        loggingCookieJar: mockLoggingCookieJar,
        config: mockConfig,
      });

      expect(mockLoggingCookieJar.get).toHaveBeenCalledWith(
        "kndctr_test-org-id_bc_session_id",
      );
      expect(result).toBe(expectedCookieValue);
    });

    it("returns a new uuid when sticky is true but no cookie exists", () => {
      mockLoggingCookieJar.get.mockReturnValue(undefined);

      const result = getConciergeSessionCookie({
        loggingCookieJar: mockLoggingCookieJar,
        config: mockConfig,
      });

      expect(mockLoggingCookieJar.get).toHaveBeenCalledWith(
        "kndctr_test-org-id_bc_session_id",
      );
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("returns a new uuid without reading cookie when sticky is false", () => {
      mockConfig.conversation.stickyConversationSession = false;

      const result = getConciergeSessionCookie({
        loggingCookieJar: mockLoggingCookieJar,
        config: mockConfig,
      });

      expect(mockLoggingCookieJar.get).not.toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("handles different org IDs", () => {
      mockConfig.orgId = "different-org";

      getConciergeSessionCookie({
        loggingCookieJar: mockLoggingCookieJar,
        config: mockConfig,
      });

      expect(mockLoggingCookieJar.get).toHaveBeenCalledWith(
        "kndctr_different-org_bc_session_id",
      );
    });
  });
});
