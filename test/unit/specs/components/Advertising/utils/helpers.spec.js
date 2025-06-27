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
import {
  getUrlParams,
  shouldThrottle,
} from "../../../../../../src/components/Advertising/utils/helpers.js";

describe("Advertising::helpers", () => {
  describe("getUrlParams", () => {
    let originalURLSearchParams;

    beforeEach(() => {
      originalURLSearchParams = window.URLSearchParams;
    });

    afterEach(() => {
      window.URLSearchParams = originalURLSearchParams;
    });

    it("extracts skwcid and efid parameters from URL", () => {
      const mockURLSearchParams = vi.fn().mockImplementation(() => ({
        get: vi.fn().mockImplementation((key) => {
          const params = {
            skwcid: "test-skwcid",
            ef_id: "test-efid",
          };
          return params[key] || null;
        }),
      }));
      window.URLSearchParams = mockURLSearchParams;

      const result = getUrlParams();

      expect(result).toEqual({
        skwcid: "test-skwcid",
        efid: "test-efid",
      });
    });

    it("returns null values when parameters are not present", () => {
      const mockURLSearchParams = vi.fn().mockImplementation(() => ({
        get: vi.fn().mockReturnValue(null),
      }));
      window.URLSearchParams = mockURLSearchParams;

      const result = getUrlParams();

      expect(result).toEqual({
        skwcid: null,
        efid: null,
      });
    });

    it("returns null values when URL has no search parameters", () => {
      const mockURLSearchParams = vi.fn().mockImplementation(() => ({
        get: vi.fn().mockReturnValue(null),
      }));
      window.URLSearchParams = mockURLSearchParams;

      const result = getUrlParams();

      expect(result).toEqual({
        skwcid: null,
        efid: null,
      });
    });

    it("handles URL with only skwcid parameter", () => {
      const mockURLSearchParams = vi.fn().mockImplementation(() => ({
        get: vi.fn().mockImplementation((key) => {
          const params = {
            skwcid: "test-skwcid",
          };
          return params[key] || null;
        }),
      }));
      window.URLSearchParams = mockURLSearchParams;

      const result = getUrlParams();

      expect(result).toEqual({
        skwcid: "test-skwcid",
        efid: null,
      });
    });

    it("handles URL with only ef_id parameter", () => {
      const mockURLSearchParams = vi.fn().mockImplementation(() => ({
        get: vi.fn().mockImplementation((key) => {
          const params = {
            ef_id: "test-efid",
          };
          return params[key] || null;
        }),
      }));
      window.URLSearchParams = mockURLSearchParams;

      const result = getUrlParams();

      expect(result).toEqual({
        skwcid: null,
        efid: "test-efid",
      });
    });

    it("handles encoded URL parameters", () => {
      const mockURLSearchParams = vi.fn().mockImplementation(() => ({
        get: vi.fn().mockImplementation((key) => {
          const params = {
            skwcid: "test-skwcid",
            ef_id: "test-defid",
          };
          return params[key] || null;
        }),
      }));
      window.URLSearchParams = mockURLSearchParams;

      const result = getUrlParams();

      expect(result).toEqual({
        skwcid: "test-skwcid",
        efid: "test-defid",
      });
    });
  });

  describe("shouldThrottle", () => {
    let originalDateNow;

    beforeEach(() => {
      originalDateNow = Date.now;
    });

    afterEach(() => {
      Date.now = originalDateNow;
    });

    it("returns false when lastTime is null", () => {
      Date.now = vi.fn().mockReturnValue(1000000);

      const result = shouldThrottle(null, 30);

      expect(result).toBe(false);
    });

    it("returns false when lastTime is undefined", () => {
      Date.now = vi.fn().mockReturnValue(1000000);

      const result = shouldThrottle(undefined, 30);

      expect(result).toBe(false);
    });

    it("returns false when lastTime is 0", () => {
      Date.now = vi.fn().mockReturnValue(1000000);

      const result = shouldThrottle(0, 30);

      expect(result).toBe(false);
    });

    it("returns true when elapsed time is less than throttle minutes", () => {
      const now = 1000000;
      const lastTime = now - 15 * 60 * 1000; // 15 minutes ago
      Date.now = vi.fn().mockReturnValue(now);

      const result = shouldThrottle(lastTime, 30);

      expect(result).toBe(true);
    });

    it("returns false when elapsed time equals throttle minutes", () => {
      const now = 1000000;
      const lastTime = now - 30 * 60 * 1000; // Exactly 30 minutes ago
      Date.now = vi.fn().mockReturnValue(now);

      const result = shouldThrottle(lastTime, 30);

      expect(result).toBe(false);
    });

    it("returns false when elapsed time is greater than throttle minutes", () => {
      const now = 1000000;
      const lastTime = now - 45 * 60 * 1000; // 45 minutes ago
      Date.now = vi.fn().mockReturnValue(now);

      const result = shouldThrottle(lastTime, 30);

      expect(result).toBe(false);
    });

    it("handles fractional throttle minutes", () => {
      const now = 1000000;
      const lastTime = now - 2.5 * 60 * 1000; // 2.5 minutes ago
      Date.now = vi.fn().mockReturnValue(now);

      const result = shouldThrottle(lastTime, 5.5);

      expect(result).toBe(true);
    });

    it("returns true for very small elapsed time", () => {
      const now = 1000000;
      const lastTime = now - 1000; // 1 second ago
      Date.now = vi.fn().mockReturnValue(now);

      const result = shouldThrottle(lastTime, 30);

      expect(result).toBe(true);
    });

    it("handles zero throttle minutes", () => {
      const now = 1000000;
      const lastTime = now - 1000; // 1 second ago
      Date.now = vi.fn().mockReturnValue(now);

      const result = shouldThrottle(lastTime, 0);

      expect(result).toBe(false);
    });

    it("handles negative throttle minutes", () => {
      const now = 1000000;
      const lastTime = now - 10 * 60 * 1000; // 10 minutes ago
      Date.now = vi.fn().mockReturnValue(now);

      const result = shouldThrottle(lastTime, -5);

      expect(result).toBe(false);
    });
  });
});
