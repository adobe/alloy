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
import handleClickThrough from "../../../../../../src/components/Advertising/handlers/clickThroughHandler.js";
import {
  LAST_CLICK_COOKIE_KEY,
  LAST_CONVERSION_TIME_KEY,
} from "../../../../../../src/components/Advertising/constants/index.js";

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

// Mock helpers
vi.mock(
  "../../../../../../src/components/Advertising/utils/helpers.js",
  () => ({
    normalizeAdvertiser: vi.fn((advertiser) => advertiser || "UNKNOWN"),
  }),
);

describe("Advertising::clickThroughHandler", () => {
  let eventManager;
  let cookieManager;
  let adConversionHandler;
  let logger;
  let componentConfig;

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

    componentConfig = {};
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
      componentConfig,
      skwcid: "test-skwcid",
      efid: null,
      optionsFromCommand: {},
    });

    expect(eventManager.createEvent).toHaveBeenCalledWith();

    expect(mockEvent.setUserXdm).toHaveBeenCalledWith({
      _experience: {
        adCloud: {
          adConversionDetails: {
            adAssetData: "test-skwcid",
          },
          adAssetReference: {
            advertiser: "UNKNOWN",
          },
        },
      },
    });

    expect(cookieManager.setValue).toHaveBeenCalledWith(LAST_CLICK_COOKIE_KEY, {
      click_time: expect.any(Number),
      skwcid: "test-skwcid",
    });

    expect(cookieManager.setValue).toHaveBeenCalledWith(
      LAST_CONVERSION_TIME_KEY,
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
      componentConfig,
      skwcid: null,
      efid: "test-efid",
      optionsFromCommand: {},
    });

    expect(mockEvent.setUserXdm).toHaveBeenCalledWith({
      _experience: {
        adCloud: {
          adConversionDetails: {
            adStitchData: "test-efid",
          },
          adAssetReference: {
            advertiser: "UNKNOWN",
          },
        },
      },
    });

    expect(cookieManager.setValue).toHaveBeenCalledWith(LAST_CLICK_COOKIE_KEY, {
      click_time: expect.any(Number),
      efid: "test-efid",
    });

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
      componentConfig,
      skwcid: "test-skwcid",
      efid: "test-efid",
      optionsFromCommand: {},
    });

    expect(mockEvent.setUserXdm).toHaveBeenCalledWith({
      _experience: {
        adCloud: {
          adConversionDetails: {
            adStitchData: "test-efid",
            adAssetData: "test-skwcid",
          },
          adAssetReference: {
            advertiser: "UNKNOWN",
          },
        },
      },
    });

    expect(cookieManager.setValue).toHaveBeenCalledWith(LAST_CLICK_COOKIE_KEY, {
      click_time: expect.any(Number),
      skwcid: "test-skwcid",
      efid: "test-efid",
    });
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
      componentConfig,
      skwcid: "test-skwcid",
      efid: null,
      optionsFromCommand: options,
    });

    expect(mockEvent.setUserXdm).toHaveBeenCalledWith({
      _experience: {
        adCloud: {
          adConversionDetails: {
            adAssetData: "test-skwcid",
          },
          adAssetReference: {
            advertiser: "test-advertiser",
          },
        },
      },
    });

    expect(cookieManager.setValue).toHaveBeenCalledWith(LAST_CLICK_COOKIE_KEY, {
      click_time: expect.any(Number),
      skwcid: "test-skwcid",
    });
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
        componentConfig,
        skwcid: "test-skwcid",
        efid: null,
        optionsFromCommand: {},
      }),
    ).rejects.toThrow("Tracking failed");

    expect(logger.error).toHaveBeenCalled();
  });
});
