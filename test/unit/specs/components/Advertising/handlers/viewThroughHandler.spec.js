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
import handleViewThrough from "../../../../../../src/components/Advertising/handlers/viewThroughHandler.js";
import flushPromiseChains from "../../../../helpers/flushPromiseChains.js";

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
    height: 0,
    width: 0,
    frameBorder: 0,
    style: { display: "none" },
    addEventListener: vi.fn(),
    onerror: vi.fn(),
  }));
  if (globalThis.document.body) {
    globalThis.document.body.appendChild = vi.fn();
  }
  if (globalThis.document.head) {
    globalThis.document.head.appendChild = vi.fn();
  }
}

if (typeof globalThis.window !== "undefined") {
  globalThis.window.addEventListener = vi.fn();
  globalThis.window.removeEventListener = vi.fn();
  globalThis.window.attachEvent = vi.fn();
  globalThis.window.detachEvent = vi.fn();
  globalThis.window.ats = undefined;
  globalThis.window.ID5 = undefined;
}

// Mock dependencies
vi.mock(
  "../../../../../../src/components/Advertising/identities/collectAllIdentities.js",
);

// Mock helpers to prevent network calls
vi.mock(
  "../../../../../../src/components/Advertising/utils/helpers.js",
  () => ({
    appendAdvertisingIdQueryToEvent: vi.fn((availableIds, event) => {
      // Mock the actual behavior
      const query = {
        advertising: {
          conversion: {
            StitchIds: {},
          },
        },
      };

      if (availableIds.surferId) {
        query.advertising.conversion.StitchIds.SurferId = availableIds.surferId;
      }
      if (availableIds.id5Id) {
        query.advertising.conversion.StitchIds.ID5 = availableIds.id5Id;
      }
      if (availableIds.rampId) {
        query.advertising.conversion.StitchIds.RampIDEnv = availableIds.rampId;
      }

      event.mergeQuery(query);
      return event;
    }),
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
    isAnyIdUnused: vi.fn(() => true),
    markIdsAsConverted: vi.fn(),
    isThrottled: vi.fn(() => false),
    shouldThrottle: vi.fn(() => false),
    createConversionEvent: vi.fn(),
  }),
);

describe("Advertising::viewThroughHandler", () => {
  let eventManager;
  let cookieManager;
  let logger;
  let componentConfig;
  let adConversionHandler;
  let collectAllIdentities;
  let getBrowser;

  beforeEach(async () => {
    eventManager = {
      createEvent: vi.fn(() => ({
        mergeQuery: vi.fn(),
        finalize: vi.fn(),
        setUserXdm: vi.fn(),
      })),
    };

    cookieManager = {
      getValue: vi.fn(),
      setValue: vi.fn(),
      readClickData: vi.fn(),
    };

    logger = {
      info: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
    };

    componentConfig = {
      id5PartnerId: "test-partner",
      liverampScriptPath: "/test-path",
    };

    adConversionHandler = {
      trackAdConversion: vi.fn().mockResolvedValue({ status: "success" }),
    };

    getBrowser = vi.fn();

    // Mock collectAllIdentities
    const { default: mockCollectAllIdentities } = await import(
      "../../../../../../src/components/Advertising/identities/collectAllIdentities.js"
    );
    collectAllIdentities = mockCollectAllIdentities;
    collectAllIdentities.mockReset();
  });

  it("should handle empty identity promises", async () => {
    collectAllIdentities.mockReturnValue({});

    const result = await handleViewThrough({
      eventManager,
      cookieManager,
      logger,
      componentConfig,
      adConversionHandler,
      getBrowser,
    });

    expect(result).toEqual([]);
  });

  it("should process identity resolution and set correct eventType", async () => {
    const surferId = Promise.resolve("test-surfer-id");
    collectAllIdentities.mockReturnValue({
      surferId,
    });

    const mockEvent = {
      mergeQuery: vi.fn(),
      finalize: vi.fn(),
      setUserXdm: vi.fn(),
    };
    eventManager.createEvent.mockReturnValue(mockEvent);

    const result = await handleViewThrough({
      eventManager,
      cookieManager,
      logger,
      componentConfig,
      adConversionHandler,
      getBrowser,
    });

    await flushPromiseChains();

    expect(collectAllIdentities).toHaveBeenCalledWith(
      logger,
      componentConfig,
      cookieManager,
      getBrowser,
    );

    expect(mockEvent.setUserXdm).toHaveBeenCalledWith({
      eventType: "advertising.enrichment",
      timestamp: expect.any(String),

    });

    expect(mockEvent.mergeQuery).toHaveBeenCalledWith({
      advertising: {
        conversion: {
          StitchIds: {
            SurferId: "test-surfer-id",
          },
        },
      },
    });

    expect(result).toEqual([
      { status: "fulfilled", value: { status: "success" } },
    ]);
  });

  it("should handle error during conversion and still call setUserXdm", async () => {
    const surferId = Promise.resolve("test-surfer-id");
    collectAllIdentities.mockReturnValue({
      surferId,
    });

    const mockEvent = {
      mergeQuery: vi.fn(),
      finalize: vi.fn(),
      setUserXdm: vi.fn(),
    };
    eventManager.createEvent.mockReturnValue(mockEvent);

    adConversionHandler.trackAdConversion.mockRejectedValue(
      new Error("Network error"),
    );

    const result = await handleViewThrough({
      eventManager,
      cookieManager,
      logger,
      componentConfig,
      adConversionHandler,
    });

    await flushPromiseChains();

    expect(mockEvent.setUserXdm).toHaveBeenCalledWith({
      eventType: "advertising.enrichment",
      timestamp: expect.any(String),

    });

    expect(logger.error).toHaveBeenCalledWith(
      "Ad conversion submission failed",
      expect.any(Error),
    );

    expect(result).toEqual([{ status: "fulfilled", value: null }]);
  });
});
