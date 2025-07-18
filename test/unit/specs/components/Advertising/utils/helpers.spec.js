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
  normalizeAdvertiser,
  loadScript,
  createManagedAsyncOperation,
  appendAdvertisingIdQueryToEvent,
  isAnyIdUnused,
  markIdsAsConverted,
  isThrottled,
  shouldThrottle,
} from "../../../../../../src/components/Advertising/utils/helpers.js";

import {
  createNode,
  appendNode,
} from "../../../../../../src/utils/dom/index.js";

// Mock DOM utilities
vi.mock("../../../../../../src/utils/dom/index.js", () => ({
  createNode: vi.fn(),
  appendNode: vi.fn(),
}));

describe("Advertising::helpers", () => {
  let mockCreateNode;
  let mockAppendNode;
  let mockDocument;
  let mockEvent;
  let mockCookieManager;
  let mockLogger;
  let originalDocument;
  let originalWindow;
  let mockReadyState;

  beforeEach(() => {
    // Mock DOM utilities
    mockCreateNode = createNode;
    mockAppendNode = appendNode;

    // Mock specific methods on existing global objects instead of replacing them
    if (typeof globalThis.document !== "undefined") {
      // Save original methods and descriptor
      originalDocument = {
        querySelector: globalThis.document.querySelector,
        addEventListener: globalThis.document.addEventListener,
        readyStateDescriptor:
          Object.getOwnPropertyDescriptor(globalThis.document, "readyState") ||
          Object.getOwnPropertyDescriptor(
            Object.getPrototypeOf(globalThis.document),
            "readyState",
          ),
        headAppendChild: globalThis.document.head?.appendChild,
        bodyAppendChild: globalThis.document.body?.appendChild,
      };

      // Create shared mock querySelector function
      const mockQuerySelector = vi.fn();

      // Mock document methods on both document and globalThis.document
      globalThis.document.querySelector = mockQuerySelector;
      globalThis.document.addEventListener = vi.fn();
      if (typeof document !== "undefined") {
        document.querySelector = mockQuerySelector;
      }

      // Mock readyState with a configurable getter/setter
      mockReadyState = "complete";
      Object.defineProperty(globalThis.document, "readyState", {
        get: () => mockReadyState,
        set: (value) => {
          mockReadyState = value;
        },
        configurable: true,
      });

      if (globalThis.document.head) {
        globalThis.document.head.appendChild = vi.fn();
      }
      if (globalThis.document.body) {
        globalThis.document.body.appendChild = vi.fn();
      }
    }

    if (typeof globalThis.window !== "undefined") {
      // Save original location
      originalWindow = {
        location: globalThis.window.location,
      };

      // Create mock location object
      const mockLocation = {
        search: "",
      };

      // Mock both window and globalThis.window to ensure consistency
      globalThis.window.location = mockLocation;
      if (typeof window !== "undefined") {
        window.location = mockLocation;
      }
    }

    // Create references to the global objects for tests
    mockDocument = globalThis.document;

    // Mock event object
    mockEvent = {
      mergeQuery: vi.fn(),
    };

    // Mock cookie manager
    mockCookieManager = {
      getValue: vi.fn(),
      setValue: vi.fn(),
    };

    // Mock logger
    mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Restore original methods
    if (originalDocument && typeof globalThis.document !== "undefined") {
      globalThis.document.querySelector = originalDocument.querySelector;
      globalThis.document.addEventListener = originalDocument.addEventListener;
      if (typeof document !== "undefined") {
        document.querySelector = originalDocument.querySelector;
      }

      // Restore readyState descriptor
      if (originalDocument.readyStateDescriptor) {
        Object.defineProperty(
          globalThis.document,
          "readyState",
          originalDocument.readyStateDescriptor,
        );
      }

      if (globalThis.document.head && originalDocument.headAppendChild) {
        globalThis.document.head.appendChild = originalDocument.headAppendChild;
      }
      if (globalThis.document.body && originalDocument.bodyAppendChild) {
        globalThis.document.body.appendChild = originalDocument.bodyAppendChild;
      }
    }
    if (originalWindow && typeof globalThis.window !== "undefined") {
      globalThis.window.location = originalWindow.location;
      if (typeof window !== "undefined") {
        window.location = originalWindow.location;
      }
    }
  });

  describe("getUrlParams", () => {
    it("should return URL parameters when present", () => {
      // Mock URLSearchParams directly for this specific test
      const mockGet = vi
        .fn()
        .mockReturnValueOnce("test_kwcid") // for s_kwcid
        .mockReturnValueOnce("test_efid"); // for ef_id

      const mockURLSearchParams = vi.fn().mockImplementation(() => ({
        get: mockGet,
      }));

      const originalURLSearchParams = globalThis.URLSearchParams;
      globalThis.URLSearchParams = mockURLSearchParams;

      const result = getUrlParams();

      expect(result).toEqual({
        skwcid: "test_kwcid",
        efid: "test_efid",
      });

      // Restore
      globalThis.URLSearchParams = originalURLSearchParams;
    });

    it("should return null values when parameters are not present", () => {
      // Mock URLSearchParams to return null for both parameters
      const mockGet = vi.fn().mockReturnValue(null);

      const mockURLSearchParams = vi.fn().mockImplementation(() => ({
        get: mockGet,
      }));

      const originalURLSearchParams = globalThis.URLSearchParams;
      globalThis.URLSearchParams = mockURLSearchParams;

      const result = getUrlParams();

      expect(result).toEqual({
        skwcid: null,
        efid: null,
      });

      // Restore
      globalThis.URLSearchParams = originalURLSearchParams;
    });

    it("should handle empty search string", () => {
      // Mock URLSearchParams to return null for both parameters
      const mockGet = vi.fn().mockReturnValue(null);

      const mockURLSearchParams = vi.fn().mockImplementation(() => ({
        get: mockGet,
      }));

      const originalURLSearchParams = globalThis.URLSearchParams;
      globalThis.URLSearchParams = mockURLSearchParams;

      const result = getUrlParams();

      expect(result).toEqual({
        skwcid: null,
        efid: null,
      });

      // Restore
      globalThis.URLSearchParams = originalURLSearchParams;
    });
  });

  describe("normalizeAdvertiser", () => {
    it("should return UNKNOWN_ADVERTISER for null input", () => {
      const result = normalizeAdvertiser(null);
      expect(result).toBe("UNKNOWN");
    });

    it("should return UNKNOWN_ADVERTISER for undefined input", () => {
      const result = normalizeAdvertiser(undefined);
      expect(result).toBe("UNKNOWN");
    });

    it("should return UNKNOWN_ADVERTISER for empty string", () => {
      const result = normalizeAdvertiser("");
      expect(result).toBe("UNKNOWN");
    });

    it("should return string input as-is", () => {
      const result = normalizeAdvertiser("test-advertiser");
      expect(result).toBe("test-advertiser");
    });

    it("should join array of advertisers with commas", () => {
      const result = normalizeAdvertiser([
        "advertiser1",
        "advertiser2",
        "advertiser3",
      ]);
      expect(result).toBe("advertiser1, advertiser2, advertiser3");
    });

    it("should filter out falsy values from array", () => {
      const result = normalizeAdvertiser([
        "advertiser1",
        "",
        null,
        "advertiser2",
        undefined,
      ]);
      expect(result).toBe("advertiser1, advertiser2");
    });

    it("should handle empty array", () => {
      const result = normalizeAdvertiser([]);
      expect(result).toBe("");
    });
  });

  describe("loadScript", () => {
    let mockScript;

    beforeEach(() => {
      mockScript = {
        addEventListener: vi.fn(),
      };
      mockCreateNode.mockReturnValue(mockScript);
    });

    it("should include nonce if available", async () => {
      const testUrl = "https://example.com/script.js";
      const testNonce = "test-nonce-123";

      // Reset the querySelector mock and set it up for this specific test
      mockDocument.querySelector.mockReset();
      mockDocument.querySelector
        .mockReturnValueOnce(null) // No existing script
        .mockReturnValueOnce({
          nonce: testNonce,
          getAttribute: vi.fn().mockReturnValue(testNonce),
        }); // Nonce element

      mockCreateNode.mockImplementation((tag, attrs, listeners) => {
        const script = { ...attrs, ...listeners };
        setTimeout(() => script.onload(), 0);
        return script;
      });

      await loadScript(testUrl);

      expect(mockCreateNode).toHaveBeenCalledWith(
        "script",
        expect.objectContaining({
          nonce: testNonce,
        }),
        expect.any(Object),
      );
    });

    it("should resolve immediately if script already exists", async () => {
      const testUrl = "https://example.com/script.js";
      mockDocument.querySelector.mockReturnValue({ src: testUrl });

      const onLoad = vi.fn();
      const result = loadScript(testUrl, { onLoad });

      await expect(result).resolves.toBeUndefined();
      expect(onLoad).toHaveBeenCalled();
      expect(mockCreateNode).not.toHaveBeenCalled();
    });

    it("should create and load script successfully", async () => {
      const testUrl = "https://example.com/script.js";
      mockDocument.querySelector.mockReturnValue(null);

      // Mock successful script load
      mockCreateNode.mockImplementation((tag, attrs, listeners) => {
        const script = { ...attrs, ...listeners };
        // Simulate successful load
        setTimeout(() => script.onload(), 0);
        return script;
      });

      const onLoad = vi.fn();
      const result = loadScript(testUrl, { onLoad });

      await expect(result).resolves.toBeUndefined();
      expect(mockCreateNode).toHaveBeenCalledWith(
        "script",
        expect.objectContaining({
          type: "text/javascript",
          src: testUrl,
          async: true,
        }),
        expect.objectContaining({
          onload: expect.any(Function),
          onerror: expect.any(Function),
        }),
      );
      expect(onLoad).toHaveBeenCalled();
      expect(mockAppendNode).toHaveBeenCalled();
    });

    it("should reject on script load error", async () => {
      const testUrl = "https://example.com/script.js";
      mockDocument.querySelector.mockReturnValue(null);

      // Mock script load error
      mockCreateNode.mockImplementation((tag, attrs, listeners) => {
        const script = { ...attrs, ...listeners };
        // Simulate load error
        setTimeout(() => script.onerror(), 0);
        return script;
      });

      const onError = vi.fn();
      const result = loadScript(testUrl, { onError });

      await expect(result).rejects.toThrow(`Failed to load script: ${testUrl}`);
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle DOM loading state", async () => {
      const testUrl = "https://example.com/script.js";
      mockDocument.querySelector.mockReturnValue(null);
      mockDocument.readyState = "loading";

      mockCreateNode.mockImplementation((tag, attrs, listeners) => {
        const script = { ...attrs, ...listeners };
        setTimeout(() => script.onload(), 0);
        return script;
      });

      const loadPromise = loadScript(testUrl);

      // Simulate DOMContentLoaded
      const addEventListenerCall =
        mockDocument.addEventListener.mock.calls.find(
          (call) => call[0] === "DOMContentLoaded",
        );
      expect(addEventListenerCall).toBeDefined();

      // Trigger the DOMContentLoaded callback
      addEventListenerCall[1]();

      await expect(loadPromise).resolves.toBeUndefined();
    });

    it("should reject if no head or body available", async () => {
      const testUrl = "https://example.com/script.js";
      mockDocument.querySelector.mockReturnValue(null);

      // Save original descriptors
      const originalHeadDescriptor =
        Object.getOwnPropertyDescriptor(mockDocument, "head") ||
        Object.getOwnPropertyDescriptor(
          Object.getPrototypeOf(mockDocument),
          "head",
        );
      const originalBodyDescriptor =
        Object.getOwnPropertyDescriptor(mockDocument, "body") ||
        Object.getOwnPropertyDescriptor(
          Object.getPrototypeOf(mockDocument),
          "body",
        );

      // Mock head and body as null
      Object.defineProperty(mockDocument, "head", {
        get: () => null,
        configurable: true,
      });
      Object.defineProperty(mockDocument, "body", {
        get: () => null,
        configurable: true,
      });

      mockCreateNode.mockReturnValue(mockScript);

      const onError = vi.fn();
      const result = loadScript(testUrl, { onError });

      await expect(result).rejects.toThrow(
        "Neither <head> nor <body> available for script insertion.",
      );
      expect(onError).toHaveBeenCalledWith(expect.any(Error));

      // Restore original descriptors
      if (originalHeadDescriptor) {
        Object.defineProperty(mockDocument, "head", originalHeadDescriptor);
      }
      if (originalBodyDescriptor) {
        Object.defineProperty(mockDocument, "body", originalBodyDescriptor);
      }
    });
  });

  describe("createManagedAsyncOperation", () => {
    it("should execute worker function on first call", async () => {
      const workerFn = vi.fn().mockResolvedValue("result");
      const managedOperation = createManagedAsyncOperation(
        "test-operation",
        workerFn,
      );

      const result = await managedOperation("arg1", "arg2");

      expect(result).toBe("result");
      expect(workerFn).toHaveBeenCalledTimes(1);
      expect(workerFn).toHaveBeenCalledWith("arg1", "arg2");
    });

    it("should return same promise for concurrent calls", async () => {
      const workerFn = vi.fn().mockResolvedValue("result");
      const managedOperation = createManagedAsyncOperation(
        "test-operation",
        workerFn,
      );

      const promise1 = managedOperation();
      const promise2 = managedOperation();

      expect(promise1).toBe(promise2);
      expect(workerFn).toHaveBeenCalledTimes(1);

      const [result1, result2] = await Promise.all([promise1, promise2]);
      expect(result1).toBe("result");
      expect(result2).toBe("result");
    });

    it("should allow new operation after previous one completes", async () => {
      const workerFn = vi
        .fn()
        .mockResolvedValueOnce("result1")
        .mockResolvedValueOnce("result2");
      const managedOperation = createManagedAsyncOperation(
        "test-operation",
        workerFn,
      );

      const result1 = await managedOperation("first");
      const result2 = await managedOperation("second");

      expect(result1).toBe("result1");
      expect(result2).toBe("result2");
      expect(workerFn).toHaveBeenCalledTimes(2);
      expect(workerFn).toHaveBeenNthCalledWith(1, "first");
      expect(workerFn).toHaveBeenNthCalledWith(2, "second");
    });

    it("should allow new operation after previous one rejects", async () => {
      const workerFn = vi
        .fn()
        .mockRejectedValueOnce(new Error("first error"))
        .mockResolvedValueOnce("success");
      const managedOperation = createManagedAsyncOperation(
        "test-operation",
        workerFn,
      );

      await expect(managedOperation()).rejects.toThrow("first error");
      const result = await managedOperation();

      expect(result).toBe("success");
      expect(workerFn).toHaveBeenCalledTimes(2);
    });
  });

  describe("appendAdvertisingIdQueryToEvent", () => {
    let componentConfig;
    let idsToInclude;

    beforeEach(() => {
      componentConfig = {
        advertiserIds: "test-advertiser",
      };
      idsToInclude = {
        surferId: "surfer123",
        id5Id: "id5_123",
        rampId: "ramp123",
      };
    });

    it("should append advertising query with all data", () => {
      const searchClickData = { click_time: 1234567890 };
      const displayClickData = { value: 9876543210 };

      mockCookieManager.getValue
        .mockReturnValueOnce(searchClickData) // LAST_CLICK_COOKIE_KEY
        .mockReturnValueOnce(displayClickData); // DISPLAY_CLICK_COOKIE_KEY

      const result = appendAdvertisingIdQueryToEvent(
        idsToInclude,
        mockEvent,
        mockCookieManager,
        componentConfig,
      );

      expect(mockEvent.mergeQuery).toHaveBeenCalledWith({
        advertising: {
          conversion: {
            lastSearchClick: 1234567890,
            lastDisplayClick: 9876543210,
            stitchIds: {
              surferId: "surfer123",
              id5: "id5_123",
              rampIDEnv: "ramp123",
            },
            advIds: "test-advertiser",
          },
        },
      });
      expect(result).toBe(mockEvent);
    });

    it("should handle missing cookie data", () => {
      mockCookieManager.getValue.mockReturnValue(null);

      appendAdvertisingIdQueryToEvent(
        idsToInclude,
        mockEvent,
        mockCookieManager,
        componentConfig,
      );

      expect(mockEvent.mergeQuery).toHaveBeenCalledWith({
        advertising: {
          conversion: {
            stitchIds: {
              surferId: "surfer123",
              id5: "id5_123",
              rampIDEnv: "ramp123",
            },
            advIds: "test-advertiser",
          },
        },
      });
    });

    it("should handle partial IDs", () => {
      const partialIds = {
        surferId: "surfer123",
      };
      mockCookieManager.getValue.mockReturnValue(null);

      appendAdvertisingIdQueryToEvent(
        partialIds,
        mockEvent,
        mockCookieManager,
        componentConfig,
      );

      expect(mockEvent.mergeQuery).toHaveBeenCalledWith({
        advertising: {
          conversion: {
            stitchIds: {
              surferId: "surfer123",
            },
            advIds: "test-advertiser",
          },
        },
      });
    });

    it("should normalize advertiser IDs", () => {
      componentConfig.advertiserIds = ["adv1", "adv2"];
      mockCookieManager.getValue.mockReturnValue(null);

      appendAdvertisingIdQueryToEvent(
        {},
        mockEvent,
        mockCookieManager,
        componentConfig,
      );

      expect(mockEvent.mergeQuery).toHaveBeenCalledWith({
        advertising: {
          conversion: {
            stitchIds: {},
            advIds: "adv1, adv2",
          },
        },
      });
    });
  });

  describe("isAnyIdUnused", () => {
    it("should return true when no IDs have been converted", () => {
      const availableIds = { surferId: "test", id5Id: "test" };
      const conversionCalled = {};

      const result = isAnyIdUnused(availableIds, conversionCalled);

      expect(result).toBe(true);
    });

    it("should return true when some IDs have not been converted", () => {
      const availableIds = { surferId: "test", id5Id: "test", rampId: "test" };
      const conversionCalled = { surferId: true };

      const result = isAnyIdUnused(availableIds, conversionCalled);

      expect(result).toBe(true);
    });

    it("should return false when all IDs have been converted", () => {
      const availableIds = { surferId: "test", id5Id: "test" };
      const conversionCalled = { surferId: true, id5Id: true };

      const result = isAnyIdUnused(availableIds, conversionCalled);

      expect(result).toBe(false);
    });

    it("should handle empty available IDs", () => {
      const availableIds = {};
      const conversionCalled = {};

      const result = isAnyIdUnused(availableIds, conversionCalled);

      expect(result).toBe(false);
    });
  });

  describe("markIdsAsConverted", () => {
    beforeEach(() => {
      vi.spyOn(Date, "now").mockReturnValue(1234567890);
    });

    it("should mark IDs as converted and update cookies", () => {
      const idTypes = ["surferId", "id5Id"];
      const conversionCalled = {};

      markIdsAsConverted(
        idTypes,
        conversionCalled,
        mockCookieManager,
        mockLogger,
      );

      expect(conversionCalled.surferId).toBe(true);
      expect(conversionCalled.id5Id).toBe(true);
      expect(mockCookieManager.setValue).toHaveBeenCalledWith(
        "surferId_last_conversion",
        1234567890,
      );
      expect(mockCookieManager.setValue).toHaveBeenCalledWith(
        "id5Id_last_conversion",
        1234567890,
      );
      expect(mockCookieManager.setValue).toHaveBeenCalledWith(
        "lastConversionTime",
        1234567890,
      );
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it("should handle empty ID types array", () => {
      const idTypes = [];
      const conversionCalled = {};

      markIdsAsConverted(
        idTypes,
        conversionCalled,
        mockCookieManager,
        mockLogger,
      );

      expect(mockLogger.info).not.toHaveBeenCalled();
      expect(mockCookieManager.setValue).toHaveBeenCalledWith(
        "lastConversionTime",
        1234567890,
      );
    });
  });

  describe("isThrottled", () => {
    beforeEach(() => {
      vi.spyOn(Date, "now").mockReturnValue(1234567890);
    });

    it("should return false when no previous conversion", () => {
      mockCookieManager.getValue.mockReturnValue(null);

      const result = isThrottled("surferId", mockCookieManager);

      expect(result).toBe(false);
      expect(mockCookieManager.getValue).toHaveBeenCalledWith(
        "surferId_last_conversion",
      );
    });

    it("should return true when within throttle window", () => {
      const recentTime = 1234567890 - 15 * 60 * 1000; // 15 minutes ago
      mockCookieManager.getValue.mockReturnValue(recentTime);

      const result = isThrottled("surferId", mockCookieManager);

      expect(result).toBe(true);
    });

    it("should return false when outside throttle window", () => {
      const oldTime = 1234567890 - 45 * 60 * 1000; // 45 minutes ago
      mockCookieManager.getValue.mockReturnValue(oldTime);

      const result = isThrottled("surferId", mockCookieManager);

      expect(result).toBe(false);
    });

    it("should return false when exactly at throttle boundary", () => {
      const boundaryTime = 1234567890 - 30 * 60 * 1000; // exactly 30 minutes ago
      mockCookieManager.getValue.mockReturnValue(boundaryTime);

      const result = isThrottled("surferId", mockCookieManager);

      expect(result).toBe(false);
    });
  });

  describe("shouldThrottle", () => {
    beforeEach(() => {
      vi.spyOn(Date, "now").mockReturnValue(1234567890);
    });

    it("should return same result as isThrottled", () => {
      mockCookieManager.getValue.mockReturnValue(null);

      const result = shouldThrottle("surferId", mockCookieManager);

      expect(result).toBe(false);
    });

    it("should handle throttled case", () => {
      const recentTime = 1234567890 - 15 * 60 * 1000;
      mockCookieManager.getValue.mockReturnValue(recentTime);

      const result = shouldThrottle("surferId", mockCookieManager);

      expect(result).toBe(true);
    });
  });
});
