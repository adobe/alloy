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

import { vi, describe, it, expect, beforeEach } from "vitest";
import handleClickThrough from "../../../../../../packages/core/src/components/Advertising/handlers/clickThroughHandler.js";
import {
  LAST_CLICK_COOKIE_KEY,
  LAST_CONVERSION_TIME_KEY,
} from "../../../../../../packages/core/src/components/Advertising/constants/index.js";

// Mock network operations to prevent real network calls
vi.mock("fetch", () => vi.fn());

// Mock globalThis fetch and other network APIs
Object.defineProperty(globalThis, "fetch", {
  value: vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    }),
  ),
  writable: true,
});

// Mock XMLHttpRequest
Object.defineProperty(globalThis, "XMLHttpRequest", {
  value: class MockXMLHttpRequest {
    open() {
      this.readyState = 4;
    }

    send() {
      this.status = 200;
    }

    setRequestHeader() {
      this.headers = {};
    }
  },
  writable: true,
});

// Mock DOM operations to prevent network calls from script loading
if (typeof globalThis.document !== "undefined") {
  globalThis.document.createElement = vi.fn(() => ({
    src: "",
    onload: null,
    onerror: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  if (globalThis.document.head) {
    globalThis.document.head.appendChild = vi.fn();
  }
  if (globalThis.document.body) {
    globalThis.document.body.appendChild = vi.fn();
  }
}

if (typeof globalThis.window !== "undefined") {
  globalThis.window.addEventListener = vi.fn();
  globalThis.window.removeEventListener = vi.fn();
}

// Mock helpers with all functions that might make network calls
vi.mock(
  "../../../../../../packages/core/src/components/Advertising/utils/helpers.js",
  () => ({
    normalizeAdvertiser: vi.fn((advertiserSettings) => {
      if (!advertiserSettings || !Array.isArray(advertiserSettings)) {
        return "UNKNOWN";
      }

      return advertiserSettings
        .filter((item) => item && item.enabled === true && item.advertiserId)
        .map((item) => item.advertiserId)
        .join(", ");
    }),
    getUrlParams: vi.fn(() => ({ skwcid: null, efid: null })),
    appendAdvertisingIdQueryToEvent: vi.fn(),
    isAnyIdUnused: vi.fn(() => true),
    markIdsAsConverted: vi.fn(),
    isThrottled: vi.fn(() => false),
    shouldThrottle: vi.fn(() => false),
  }),
);

describe("Advertising::clickThroughHandler", () => {
  let eventManager;
  let cookieManager;
  let adConversionHandler;
  let logger;

  beforeEach(() => {
    eventManager = {
      createEvent: vi.fn(),
    };

    cookieManager = {
      setValue: vi.fn(),
    };

    adConversionHandler = {
      trackAdConversion: vi.fn().mockResolvedValue({ status: "success" }),
    };

    logger = {
      info: vi.fn(),
      error: vi.fn(),
    };

    const fixedTs = Date.UTC(2024, 0, 1, 0, 0, 0);
    const mockNow = {
      valueOf: () => fixedTs,
      toISOString: () => new Date(fixedTs).toISOString(),
    };
    vi.spyOn(Date, "now").mockReturnValue(mockNow);
  });

  it("should handle click-through with skwcid", async () => {
    const mockEvent = {
      setUserXdm: vi.fn(),
      finalize: vi.fn(),
    };
    eventManager.createEvent.mockReturnValue(mockEvent);

    const result = await handleClickThrough({
      eventManager,
      cookieManager,
      adConversionHandler,
      logger,
      skwcid: "test-skwcid",
      efid: undefined,
      optionsFromCommand: {},
    });

    expect(eventManager.createEvent).toHaveBeenCalledWith();

    expect(mockEvent.setUserXdm).toHaveBeenCalledWith(
      expect.objectContaining({
        _experience: {
          adcloud: {
            conversionDetails: {
              trackingCode: "test-skwcid",
            },
          },
        },
        eventType: "advertising.enrichment_ct",
      }),
    );

    expect(cookieManager.setValue).toHaveBeenCalledTimes(2);
    expect(cookieManager.setValue).toHaveBeenCalledWith(
      LAST_CONVERSION_TIME_KEY,
    );
    expect(cookieManager.setValue).toHaveBeenCalledWith(
      "lastConversionTimeExpires",
      expect.any(Number),
    );

    expect(adConversionHandler.trackAdConversion).toHaveBeenCalledWith({
      event: mockEvent,
    });

    expect(result).toEqual({ status: "success" });
  });

  it("should handle click-through with efid", async () => {
    const mockEvent = {
      setUserXdm: vi.fn(),
      finalize: vi.fn(),
    };
    eventManager.createEvent.mockReturnValue(mockEvent);

    const result = await handleClickThrough({
      eventManager,
      cookieManager,
      adConversionHandler,
      logger,
      skwcid: undefined,
      efid: "test-efid",
      optionsFromCommand: {},
    });

    expect(mockEvent.setUserXdm).toHaveBeenCalledWith(
      expect.objectContaining({
        _experience: {
          adcloud: {
            conversionDetails: {
              trackingIdentities: "test-efid",
            },
          },
        },
        eventType: "advertising.enrichment_ct",
      }),
    );

    expect(cookieManager.setValue).toHaveBeenCalledTimes(2);
    expect(cookieManager.setValue).toHaveBeenCalledWith(
      LAST_CONVERSION_TIME_KEY,
    );
    expect(cookieManager.setValue).toHaveBeenCalledWith(
      "lastConversionTimeExpires",
      expect.any(Number),
    );

    expect(result).toEqual({ status: "success" });
  });

  it("should handle both skwcid and efid", async () => {
    const mockEvent = {
      setUserXdm: vi.fn(),
      finalize: vi.fn(),
    };
    eventManager.createEvent.mockReturnValue(mockEvent);

    await handleClickThrough({
      eventManager,
      cookieManager,
      adConversionHandler,
      logger,
      skwcid: "AL!test-skwcid",
      efid: "test-efid",
      optionsFromCommand: {},
    });

    expect(mockEvent.setUserXdm).toHaveBeenCalledWith(
      expect.objectContaining({
        _experience: {
          adcloud: {
            conversionDetails: {
              trackingCode: "AL!test-skwcid",
              trackingIdentities: "test-efid",
            },
          },
        },
        eventType: "advertising.enrichment_ct",
      }),
    );

    expect(cookieManager.setValue).toHaveBeenCalledWith(LAST_CLICK_COOKIE_KEY, {
      click_time: expect.anything(),
      skwcid: "AL!test-skwcid",
      efid: "test-efid",
    });

    expect(cookieManager.setValue).toHaveBeenCalledTimes(3);
    expect(cookieManager.setValue).toHaveBeenCalledWith(
      LAST_CONVERSION_TIME_KEY,
    );
    expect(cookieManager.setValue).toHaveBeenCalledWith(
      "lastConversionTimeExpires",
      expect.any(Number),
    );
  });

  it("should include options from command", async () => {
    const mockEvent = {
      setUserXdm: vi.fn(),
      finalize: vi.fn(),
    };
    eventManager.createEvent.mockReturnValue(mockEvent);

    const options = {
      advertiser: "test-advertiser",
      campaign: "test-campaign",
    };

    await handleClickThrough({
      eventManager,
      cookieManager,
      adConversionHandler,
      logger,
      skwcid: "test-skwcid",
      efid: undefined,
      optionsFromCommand: options,
    });

    expect(mockEvent.setUserXdm).toHaveBeenCalledWith(
      expect.objectContaining({
        _experience: {
          adcloud: {
            conversionDetails: {
              trackingCode: "test-skwcid",
            },
          },
        },
        eventType: "advertising.enrichment_ct",
      }),
    );

    expect(cookieManager.setValue).toHaveBeenCalledTimes(2);
    expect(cookieManager.setValue).toHaveBeenCalledWith(
      LAST_CONVERSION_TIME_KEY,
    );
    expect(cookieManager.setValue).toHaveBeenCalledWith(
      "lastConversionTimeExpires",
      expect.any(Number),
    );
  });

  it("should handle trackAdConversion errors", async () => {
    const mockEvent = {
      setUserXdm: vi.fn(),
      finalize: vi.fn(),
    };
    eventManager.createEvent.mockReturnValue(mockEvent);

    const error = new Error("Tracking failed");
    adConversionHandler.trackAdConversion.mockRejectedValue(error);

    await expect(
      handleClickThrough({
        eventManager,
        cookieManager,
        adConversionHandler,
        logger,
        skwcid: "test-skwcid",
        efid: undefined,
        optionsFromCommand: {},
      }),
    ).rejects.toThrow("Tracking failed");

    expect(logger.error).toHaveBeenCalled();
  });
});
