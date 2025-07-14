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
      cookieJar.get.mockReturnValue(
        encodeURIComponent(JSON.stringify(testData)),
      );

      const result = sessionManager.getValue("testKey");

      expect(result).toBe("testValue");
      expect(cookieJar.get).toHaveBeenCalledWith(
        "kndctr_test-org-id_advertising",
      );
    });

    it("should return undefined for non-existent key", () => {
      cookieJar.get.mockReturnValue(encodeURIComponent(JSON.stringify({})));

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
      cookieJar.get.mockReturnValue(
        encodeURIComponent(JSON.stringify(existingData)),
      );
      cookieJar.set.mockReturnValue(true);

      const result = sessionManager.setValue("newKey", "newValue");

      expect(cookieJar.set).toHaveBeenCalledWith(
        "kndctr_test-org-id_advertising",
        expect.any(String),
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
      cookieJar.get.mockReturnValue(
        encodeURIComponent(JSON.stringify(existingData)),
      );
      cookieJar.set.mockReturnValue(true);

      sessionManager.setValue("key2", "updatedValue2");

      expect(cookieJar.set).toHaveBeenCalledWith(
        "kndctr_test-org-id_advertising",
        expect.any(String),
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
        expect.any(String),
        expect.objectContaining({
          expires: expect.any(Date),
        }),
      );
    });

    it("should pass through options", () => {
      cookieJar.get.mockReturnValue(encodeURIComponent(JSON.stringify({})));
      cookieJar.set.mockReturnValue(true);

      const options = { secure: true, sameSite: "lax" };
      sessionManager.setValue("testKey", "testValue", options);

      expect(cookieJar.set).toHaveBeenCalledWith(
        "kndctr_test-org-id_advertising",
        expect.any(String),
        expect.objectContaining({
          expires: expect.any(Date),
          secure: true,
          sameSite: "lax",
        }),
      );
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

      const result = sessionManager.getValue("testKey");

      expect(result).toBeUndefined();
      expect(logger.error).toHaveBeenCalledWith(
        "Error reading cookie: advertising",
        expect.any(Error),
      );
    });

    it("should handle cookie write errors gracefully", () => {
      cookieJar.get.mockReturnValue(null);
      cookieJar.set.mockImplementation(() => {
        throw new Error("Cookie write error");
      });

      const result = sessionManager.setValue("testKey", "testValue");

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        "Error writing cookie: advertising",
        expect.any(Error),
      );
    });
  });

  describe("cookie naming", () => {
    it("should use correct cookie name format", () => {
      sessionManager = createAdvertisingSessionManager({
        orgId: "test-org-id",
        logger,
      });

      sessionManager.setValue("testKey", "testValue");

      expect(cookieJar.set).toHaveBeenCalledWith(
        "kndctr_test-org-id_advertising",
        expect.any(String),
        expect.objectContaining({
          expires: expect.any(Date),
        }),
      );
    });

    it("should handle orgId with special characters", () => {
      sessionManager = createAdvertisingSessionManager({
        orgId: "test_org_id",
        logger,
      });

      sessionManager.setValue("testKey", "testValue");

      expect(cookieJar.set).toHaveBeenCalledWith(
        "kndctr_test_org_id_advertising",
        expect.any(String),
        expect.objectContaining({
          expires: expect.any(Date),
        }),
      );
    });
  });
});
