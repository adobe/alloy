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
import createAdvertisingSessionManager from "../../../../../../src/components/Advertising/utils/createAdvertisingSessionManager.js";

// Mock network operations to prevent real network calls
vi.mock("fetch", () => vi.fn());
Object.defineProperty(globalThis, "fetch", {
  value: vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    }),
  ),
  writable: true,
});

// Mock createLoggingCookieJar
vi.mock("../../../../../../src/utils/createLoggingCookieJar.js", () => ({
  default: vi.fn(),
}));

describe("Advertising::createAdvertisingSessionManager", () => {
  let cookieJar;
  let logger;
  let sessionManager;
  let mockCreateLoggingCookieJar;

  beforeEach(async () => {
    cookieJar = {
      get: vi.fn(),
      set: vi.fn(),
    };

    logger = {
      info: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
    };

    // Mock createLoggingCookieJar to return a jar with get/set methods
    const createLoggingCookieJarModule = await import(
      "../../../../../../src/utils/createLoggingCookieJar.js"
    );
    mockCreateLoggingCookieJar = vi.mocked(
      createLoggingCookieJarModule.default,
    );
    mockCreateLoggingCookieJar.mockReturnValue({
      get: cookieJar.get,
      set: cookieJar.set,
    });
  });

  describe("session manager creation", () => {
    it("should create session manager with orgId", () => {
      sessionManager = createAdvertisingSessionManager({
        orgId: "test-org-id",
        logger,
      });

      expect(sessionManager).toBeDefined();
      expect(typeof sessionManager.getValue).toBe("function");
      expect(typeof sessionManager.setValue).toBe("function");
      expect(typeof sessionManager.getValueWithLastUpdated).toBe("function");
      expect(typeof sessionManager.readClickData).toBe("function");
      expect(typeof sessionManager.writeClickData).toBe("function");
      expect(typeof sessionManager.isIdThrottled).toBe("function");
    });

    it("should use default orgId when not provided", () => {
      sessionManager = createAdvertisingSessionManager({
        logger,
      });

      expect(sessionManager).toBeDefined();
    });
  });

  describe("getValue", () => {
    beforeEach(() => {
      sessionManager = createAdvertisingSessionManager({
        orgId: "test-org-id",
        logger,
      });
    });

    it("should return stored value", () => {
      const testData = {
        testKey: "testValue",
        anotherKey: "anotherValue",
      };
      cookieJar.get.mockReturnValue(testData);

      const result = sessionManager.getValue("testKey");

      expect(result).toBe("testValue");
      expect(cookieJar.get).toHaveBeenCalledWith(
        "kndctr_test-org-id_advertising",
      );
    });

    it("should return undefined for non-existent key", () => {
      cookieJar.get.mockReturnValue({});

      const result = sessionManager.getValue("nonExistentKey");

      expect(result).toBeUndefined();
    });

    it("should handle null cookie data", () => {
      cookieJar.get.mockReturnValue(null);

      const result = sessionManager.getValue("testKey");

      expect(result).toBeUndefined();
    });
  });

  describe("setValue", () => {
    beforeEach(() => {
      sessionManager = createAdvertisingSessionManager({
        orgId: "test-org-id",
        logger,
      });
    });

    it("should store value in cookie", () => {
      const existingData = { existingKey: "existingValue" };
      cookieJar.get.mockReturnValue(existingData);
      cookieJar.set.mockReturnValue(true);

      const result = sessionManager.setValue("newKey", "newValue");

      expect(cookieJar.set).toHaveBeenCalledWith(
        "kndctr_test-org-id_advertising",
        expect.stringContaining("existingKey"),
        expect.objectContaining({
          expires: expect.any(Date),
        }),
      );
      expect(result).toBe(true);
    });

    it("should merge with existing data", () => {
      const existingData = {
        key1: "value1",
        key2: "value2",
      };
      cookieJar.get.mockReturnValue(existingData);
      cookieJar.set.mockReturnValue(true);

      sessionManager.setValue("key2", "updatedValue2");

      expect(cookieJar.set).toHaveBeenCalledWith(
        "kndctr_test-org-id_advertising",
        expect.stringContaining("key1"),
        expect.objectContaining({
          expires: expect.any(Date),
        }),
      );
    });

    it("should handle empty existing data", () => {
      cookieJar.get.mockReturnValue(null);
      cookieJar.set.mockReturnValue(true);

      sessionManager.setValue("testKey", "testValue");

      expect(cookieJar.set).toHaveBeenCalledWith(
        "kndctr_test-org-id_advertising",
        expect.stringContaining("testKey"),
        expect.objectContaining({
          expires: expect.any(Date),
        }),
      );
    });

    it("should pass through options", () => {
      cookieJar.get.mockReturnValue({});
      cookieJar.set.mockReturnValue(true);

      const options = { secure: true, sameSite: "lax" };
      sessionManager.setValue("testKey", "testValue", options);

      expect(cookieJar.set).toHaveBeenCalledWith(
        "kndctr_test-org-id_advertising",
        expect.stringContaining("testKey"),
        expect.objectContaining({
          expires: expect.any(Date),
          secure: true,
          sameSite: "lax",
        }),
      );
    });
  });

  describe("getValueWithLastUpdated", () => {
    beforeEach(() => {
      sessionManager = createAdvertisingSessionManager({
        orgId: "test-org-id",
        logger,
      });
    });

    it("should return value from nested structure", () => {
      const testData = {
        testKey: {
          value: "testValue",
          lastUpdated: 1234567890,
        },
      };
      cookieJar.get.mockReturnValue(testData);

      const result = sessionManager.getValueWithLastUpdated("testKey");

      expect(result).toBe("testValue");
    });

    it("should return undefined for non-existent key", () => {
      cookieJar.get.mockReturnValue({});

      const result = sessionManager.getValueWithLastUpdated("nonExistentKey");

      expect(result).toBeUndefined();
    });

    it("should handle null cookie data", () => {
      cookieJar.get.mockReturnValue(null);

      const result = sessionManager.getValueWithLastUpdated("testKey");

      expect(result).toBeUndefined();
    });
  });

  describe("readClickData", () => {
    beforeEach(() => {
      sessionManager = createAdvertisingSessionManager({
        orgId: "test-org-id",
        logger,
      });
    });

    it("should read click data from cookie", () => {
      const clickData = { clickTime: 1234567890, advertiser: "test" };
      cookieJar.get.mockReturnValue({ ev_cc: clickData });

      const result = sessionManager.readClickData();

      expect(result).toEqual({ clickTime: 1234567890, advertiser: "test" });
    });

    it("should return empty object when no click data exists", () => {
      cookieJar.get.mockReturnValue({});

      const result = sessionManager.readClickData();

      expect(result).toEqual({});
    });

    it("should handle null cookie data", () => {
      cookieJar.get.mockReturnValue(null);

      const result = sessionManager.readClickData();

      expect(result).toEqual({});
    });
  });

  describe("writeClickData", () => {
    beforeEach(() => {
      sessionManager = createAdvertisingSessionManager({
        orgId: "test-org-id",
        logger,
      });
    });

    it("should write click data to cookie", () => {
      cookieJar.get.mockReturnValue({});
      cookieJar.set.mockReturnValue(true);

      const clickData = { clickTime: 1234567890, advertiser: "test" };
      const result = sessionManager.writeClickData(clickData);

      expect(cookieJar.set).toHaveBeenCalledWith(
        "kndctr_test-org-id_advertising",
        expect.stringContaining("ev_cc"),
        expect.objectContaining({
          expires: expect.any(Date),
        }),
      );
      expect(result).toBe(true);
    });

    it("should set 1440 minute (24 hour) expiration for click data", () => {
      cookieJar.get.mockReturnValue({});
      cookieJar.set.mockReturnValue(true);

      const clickData = { clickTime: 1234567890 };
      sessionManager.writeClickData(clickData);

      expect(cookieJar.set).toHaveBeenCalledWith(
        "kndctr_test-org-id_advertising",
        expect.any(String),
        expect.objectContaining({
          expires: expect.any(Date),
        }),
      );

      // Check that expires is approximately 24 hours from now
      const call = cookieJar.set.mock.calls[0];
      const expires = call[2].expires;
      const dayFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const timeDiff = Math.abs(expires.getTime() - dayFromNow.getTime());
      expect(timeDiff).toBeLessThan(60000); // Within 1 minute
    });
  });

  describe("isIdThrottled", () => {
    beforeEach(() => {
      sessionManager = createAdvertisingSessionManager({
        orgId: "test-org-id",
        logger,
      });
    });

    it("should return false when no last conversion time", () => {
      cookieJar.get.mockReturnValue({});

      const result = sessionManager.isIdThrottled("id5", 30);

      expect(result).toBe(false);
    });

    it("should return true when within throttle window", () => {
      const now = Date.now();
      const lastConversion = now - 15 * 60 * 1000; // 15 minutes ago
      cookieJar.get.mockReturnValue({ id5_last_conversion: lastConversion });

      vi.spyOn(Date, "now").mockReturnValue(now);

      const result = sessionManager.isIdThrottled("id5", 30);

      expect(result).toBe(true);
    });

    it("should return false when outside throttle window", () => {
      const now = Date.now();
      const lastConversion = now - 45 * 60 * 1000; // 45 minutes ago
      cookieJar.get.mockReturnValue({ id5_last_conversion: lastConversion });

      vi.spyOn(Date, "now").mockReturnValue(now);

      const result = sessionManager.isIdThrottled("id5", 30);

      expect(result).toBe(false);
    });

    it("should return false when exactly at throttle boundary", () => {
      const now = Date.now();
      const lastConversion = now - 30 * 60 * 1000; // Exactly 30 minutes ago
      cookieJar.get.mockReturnValue({ id5_last_conversion: lastConversion });

      vi.spyOn(Date, "now").mockReturnValue(now);

      const result = sessionManager.isIdThrottled("id5", 30);

      expect(result).toBe(false);
    });
  });

  describe("error handling", () => {
    beforeEach(() => {
      sessionManager = createAdvertisingSessionManager({
        orgId: "test-org-id",
        logger,
      });
    });

    it("should handle cookie read errors gracefully", () => {
      cookieJar.get.mockImplementation(() => {
        throw new Error("Cookie read error");
      });

      expect(() => sessionManager.getValue("testKey")).toThrow(
        "Cookie read error",
      );
    });

    it("should handle cookie write errors gracefully", () => {
      cookieJar.get.mockReturnValue({});
      cookieJar.set.mockImplementation(() => {
        throw new Error("Cookie write error");
      });

      expect(() =>
        sessionManager.setValue("testKey", "testValue"),
      ).not.toThrow();
    });
  });

  describe("cookie naming", () => {
    it("should use correct cookie name format", () => {
      sessionManager = createAdvertisingSessionManager({
        orgId: "my-org-123",
        logger,
      });

      cookieJar.get.mockReturnValue({});
      sessionManager.getValue("testKey");

      expect(cookieJar.get).toHaveBeenCalledWith(
        "kndctr_my-org-123_advertising",
      );
    });

    it("should handle orgId with special characters", () => {
      sessionManager = createAdvertisingSessionManager({
        orgId: "org@adobe.com",
        logger,
      });

      cookieJar.get.mockReturnValue({});
      sessionManager.getValue("testKey");

      expect(cookieJar.get).toHaveBeenCalledWith(
        "kndctr_org_adobe.com_advertising",
      );
    });
  });
});
