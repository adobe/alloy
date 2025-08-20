/*
Copyright 2023 Adobe. All rights reserved.
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
  createManagedAsyncOperation,
  appendAdvertisingIdQueryToEvent,
  isAnyIdUnused,
  markIdsAsConverted,
  isThrottled,
  shouldThrottle,
} from "../../../../../../src/components/Advertising/utils/helpers.js";
import {
  LAST_CLICK_COOKIE_KEY,
  DISPLAY_CLICK_COOKIE_KEY,
  LAST_CONVERSION_TIME_KEY_EXPIRES,
  DISPLAY_CLICK_COOKIE_KEY_EXPIRES,
  AD_CONVERSION_VIEW_EVENT_TYPE,
} from "../../../../../../src/components/Advertising/constants/index.js";


// Mock DOM utilities
vi.mock("../../../../../../src/utils/dom/index.js", () => ({
  awaitSelector: vi.fn(),
  loadScript: vi.fn().mockResolvedValue(),
  createNode: vi.fn(),
  appendNode: vi.fn(),
  matchesSelector: vi.fn(),
  querySelectorAll: vi.fn(),
  removeNode: vi.fn(),
  selectNodes: vi.fn(),
  selectNodesWithShadow: vi.fn(),
}));

describe("Advertising::helpers", () => {

  let mockEvent;
  let mockCookieManager;
  let mockLogger;

  beforeEach(() => {
    // Reset modules to clear any cached state
    vi.resetModules();
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
    vi.unstubAllGlobals();
  });

  describe("getUrlParams", () => {
    afterEach(() => {
      window.history.pushState({}, "", "/");
    });

    it("should return URL parameters when present", () => {
      window.history.pushState({}, "", "?s_kwcid=test_kwcid&ef_id=test_efid");

      const result = getUrlParams();

      expect(result).toEqual({
        skwcid: "test_kwcid",
        efid: "test_efid",
      });
    });

    it("should return undefined values when parameters are not present", () => {
      window.history.pushState({}, "", "?foo=bar");

      const result = getUrlParams();

      expect(result.skwcid).toBeUndefined();
      expect(result.efid).toBeUndefined();
    });

    it("should handle empty search string", () => {
      window.history.pushState({}, "", "");

      const result = getUrlParams();

      expect(result.skwcid).toBeUndefined();
      expect(result.efid).toBeUndefined();
    });
  });

  describe("normalizeAdvertiser", () => {
    it("should return empty string for null input", () => {
      const result = normalizeAdvertiser(null);
      expect(result).toBe("");
    });

    it("should return empty string for undefined input", () => {
      const result = normalizeAdvertiser(undefined);
      expect(result).toBe("");
    });

    it("should return empty string for non-array input", () => {
      const result = normalizeAdvertiser("test-advertiser");
      expect(result).toBe("");
    });

    it("should handle advertiserSettings with enabled advertisers only", () => {
      const advertiserSettings = [
        { advertiserId: "167524", enabled: true },
        { advertiserId: "153472", enabled: false },
        { advertiserId: "178901", enabled: true },
      ];
      const result = normalizeAdvertiser(advertiserSettings);
      expect(result).toBe("167524, 178901");
    });

    it("should handle advertiserSettings with all disabled advertisers", () => {
      const advertiserSettings = [
        { advertiserId: "167524", enabled: false },
        { advertiserId: "153472", enabled: false },
      ];
      const result = normalizeAdvertiser(advertiserSettings);
      expect(result).toBe("");
    });

    it("should handle advertiserSettings with all enabled advertisers", () => {
      const advertiserSettings = [
        { advertiserId: "167524", enabled: true },
        { advertiserId: "153472", enabled: true },
      ];
      const result = normalizeAdvertiser(advertiserSettings);
      expect(result).toBe("167524, 153472");
    });

    it("should handle empty advertiserSettings array", () => {
      const result = normalizeAdvertiser([]);
      expect(result).toBe("");
    });

    it("should filter out invalid advertiserSettings objects", () => {
      const advertiserSettings = [
        { advertiserId: "167524", enabled: true },
        { advertiserId: "", enabled: true }, // Empty advertiserId
        { advertiserId: "153472", enabled: false },
        null, // Null object
        { advertiserId: "178901", enabled: true },
        { enabled: true }, // Missing advertiserId
      ];
      const result = normalizeAdvertiser(advertiserSettings);
      expect(result).toBe("167524, 178901");
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
        advertiserSettings: [
          { advertiserId: "test-advertiser", enabled: true },
        ],
      };
      idsToInclude = {
        surferId: "surfer123",
        id5Id: "id5_123",
        rampId: "ramp123",
      };
    });

    it("should append advertising query with all data", () => {
      const searchClickData = { click_time: 1234567890 };
      const displayClickData = 9876543210;

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
          stitchIds: {
            surferId: "surfer123",
            id5: "id5_123",
            rampIdEnv: "ramp123",
            ipAddress: "DUMMY_IP_ADDRESS",
          },
          advIds: "test-advertiser",
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
          stitchIds: {
            surferId: "surfer123",
            id5: "id5_123",
            rampIdEnv: "ramp123",
            ipAddress: "DUMMY_IP_ADDRESS",
          },
          advIds: "test-advertiser",
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
          stitchIds: {
            surferId: "surfer123",
            ipAddress: "DUMMY_IP_ADDRESS",
          },
          advIds: "test-advertiser",
        },
      });
    });

    it("should normalize advertiser settings", () => {
      componentConfig.advertiserSettings = [
        { advertiserId: "adv1", enabled: true },
        { advertiserId: "adv2", enabled: false },
        { advertiserId: "adv3", enabled: true },
      ];
      mockCookieManager.getValue.mockReturnValue(null);

      appendAdvertisingIdQueryToEvent(
        {},
        mockEvent,
        mockCookieManager,
        componentConfig,
      );

      expect(mockEvent.mergeQuery).toHaveBeenCalledWith({
        advertising: {
          stitchIds: {
            ipAddress: "DUMMY_IP_ADDRESS",
          },
          advIds: "adv1, adv3",
        },
      });
    });

    it("should include lastSearchClick only when not expired", () => {
      const now = Date.now();
      vi.spyOn(Date, "now").mockReturnValue(now);

      mockCookieManager.getValue.mockImplementation((key) => {
        if (key === LAST_CONVERSION_TIME_KEY_EXPIRES) return now + 1000;
        if (key === LAST_CLICK_COOKIE_KEY) return { click_time: 1111 };
        return null;
      });

      appendAdvertisingIdQueryToEvent(
        idsToInclude,
        mockEvent,
        mockCookieManager,
        componentConfig,
      );

      expect(mockEvent.mergeQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          advertising: expect.objectContaining({ lastSearchClick: 1111 }),
        }),
      );

      // Expired -> should not include
      mockEvent.mergeQuery.mockClear();
      mockCookieManager.getValue.mockImplementation((key) => {
        if (key === LAST_CONVERSION_TIME_KEY_EXPIRES) return now - 1000;
        if (key === LAST_CLICK_COOKIE_KEY) return { click_time: 2222 };
        return null;
      });

      appendAdvertisingIdQueryToEvent(
        idsToInclude,
        mockEvent,
        mockCookieManager,
        componentConfig,
      );

      expect(mockEvent.mergeQuery).toHaveBeenCalledWith(
        expect.not.objectContaining({
          advertising: expect.objectContaining({ lastSearchClick: 2222 }),
        }),
      );
    });

    it("should include lastDisplayClick only when not expired", () => {
      const now = Date.now();
      vi.spyOn(Date, "now").mockReturnValue(now);

      mockCookieManager.getValue.mockImplementation((key) => {
        if (key === DISPLAY_CLICK_COOKIE_KEY_EXPIRES) return now + 1000;
        if (key === DISPLAY_CLICK_COOKIE_KEY) return 999999;
        return null;
      });

      appendAdvertisingIdQueryToEvent(
        idsToInclude,
        mockEvent,
        mockCookieManager,
        componentConfig,
      );

      expect(mockEvent.mergeQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          advertising: expect.objectContaining({ lastDisplayClick: 999999 }),
        }),
      );

      // Expired -> should not include
      mockEvent.mergeQuery.mockClear();
      mockCookieManager.getValue.mockImplementation((key) => {
        if (key === DISPLAY_CLICK_COOKIE_KEY_EXPIRES) return now - 1000;
        if (key === DISPLAY_CLICK_COOKIE_KEY) return 888888;
        return null;
      });

      appendAdvertisingIdQueryToEvent(
        idsToInclude,
        mockEvent,
        mockCookieManager,
        componentConfig,
      );

      expect(mockEvent.mergeQuery).toHaveBeenCalledWith(
        expect.not.objectContaining({
          advertising: expect.objectContaining({ lastDisplayClick: 888888 }),
        }),
      );
    });

    it("should include eventType when addEventType flag is true", () => {
      mockCookieManager.getValue.mockReturnValue(null);

      appendAdvertisingIdQueryToEvent(
        idsToInclude,
        mockEvent,
        mockCookieManager,
        componentConfig,
        true,
      );

      expect(mockEvent.mergeQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          advertising: expect.objectContaining({
            eventType: AD_CONVERSION_VIEW_EVENT_TYPE,
          }),
        }),
      );
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
