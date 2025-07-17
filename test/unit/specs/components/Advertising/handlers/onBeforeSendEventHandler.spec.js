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
import handleOnBeforeSendEvent from "../../../../../../src/components/Advertising/handlers/onBeforeSendEventHandler.js";

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

// Mock identity collectors to return resolved promises immediately
vi.mock(
  "../../../../../../src/components/Advertising/identities/collectSurferId.js",
  () => ({
    getSurferId: vi.fn(() => Promise.resolve("mock-surfer-id")),
  }),
);

vi.mock(
  "../../../../../../src/components/Advertising/identities/collectID5Id.js",
  () => ({
    getID5Id: vi.fn(() => Promise.resolve("mock-id5-id")),
  }),
);

vi.mock(
  "../../../../../../src/components/Advertising/identities/collectRampId.js",
  () => ({
    getRampId: vi.fn(() => Promise.resolve("mock-ramp-id")),
  }),
);

// Mock helpers to prevent network calls
vi.mock(
  "../../../../../../src/components/Advertising/utils/helpers.js",
  () => ({
    appendAdvertisingIdQueryToEvent: vi.fn((availableIds, event) => {
      // Mock the actual behavior of appending advertising IDs to the event query
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
    }),
    loadScript: vi.fn().mockResolvedValue(),
    normalizeAdvertiser: vi.fn((advertiser) => {
      if (Array.isArray(advertiser)) {
        return advertiser.join(", ");
      }
      return advertiser || "UNKNOWN";
    }),
    getUrlParams: vi.fn(() => ({ skwcid: null, efid: null })),
    isAnyIdUnused: vi.fn(() => true),
    markIdsAsConverted: vi.fn(),
    isThrottled: vi.fn(() => false),
    shouldThrottle: vi.fn(() => false),
  }),
);

describe("Advertising::onBeforeSendEventHandler", () => {
  let cookieManager;
  let logger;
  let state;
  let event;
  let config;
  let getSurferId;
  let getID5Id;
  let getRampId;

  beforeEach(async () => {
    cookieManager = {
      getValue: vi.fn(),
      setValue: vi.fn(),
    };

    logger = {
      info: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
    };

    state = {
      surferIdAppendedToAepEvent: false,
      processingAdvertisingIds: false,
    };

    event = {
      mergeXdm: vi.fn(),
      mergeQuery: vi.fn(),
    };

    config = {
      id5PartnerId: "test-partner",
      rampIdJSPath: "/test-path",
    };

    // Get and reset mock functions - these are already mocked at module level
    const surferIdModule = await import(
      "../../../../../../src/components/Advertising/identities/collectSurferId.js"
    );
    const id5IdModule = await import(
      "../../../../../../src/components/Advertising/identities/collectID5Id.js"
    );
    const rampIdModule = await import(
      "../../../../../../src/components/Advertising/identities/collectRampId.js"
    );

    getSurferId = vi.mocked(surferIdModule.getSurferId);
    getID5Id = vi.mocked(id5IdModule.getID5Id);
    getRampId = vi.mocked(rampIdModule.getRampId);

    // Reset and set default return values
    getSurferId.mockReset().mockResolvedValue(null);
    getID5Id.mockReset().mockResolvedValue(null);
    getRampId.mockReset().mockResolvedValue(null);
  });

  it("should return early when already processed", async () => {
    state.surferIdAppendedToAepEvent = true;

    await handleOnBeforeSendEvent({
      cookieManager,
      logger,
      state,
      event,
      config,
    });

    expect(getSurferId).not.toHaveBeenCalled();
    expect(getID5Id).not.toHaveBeenCalled();
    expect(getRampId).not.toHaveBeenCalled();
    expect(event.mergeXdm).not.toHaveBeenCalled();
  });

  it("should collect and merge available advertising IDs", async () => {
    getSurferId.mockResolvedValue("test-surfer-id");
    getID5Id.mockResolvedValue("test-id5-id");
    getRampId.mockResolvedValue("test-ramp-id");

    await handleOnBeforeSendEvent({
      cookieManager,
      logger,
      state,
      event,
      config,
    });

    expect(getSurferId).toHaveBeenCalledWith(cookieManager, false);
    expect(getID5Id).toHaveBeenCalledWith(logger, null, false);
    expect(getRampId).toHaveBeenCalledWith(logger, null, cookieManager, false);

    expect(event.mergeQuery).toHaveBeenCalledWith({
      advertising: {
        conversion: {
          StitchIds: {
            SurferId: "test-surfer-id",
            ID5: "test-id5-id",
            RampIDEnv: "test-ramp-id",
          },
        },
      },
    });

    // Current implementation doesn't log these messages
    // expect(logger.info).toHaveBeenCalledWith(
    //   "Adding advertising IDs to event query parameters",
    // );
  });

  it("should only include available IDs", async () => {
    getSurferId.mockResolvedValue("test-surfer-id");
    getID5Id.mockResolvedValue(null);
    getRampId.mockResolvedValue("test-ramp-id");

    await handleOnBeforeSendEvent({
      cookieManager,
      logger,
      state,
      event,
      config,
    });

    expect(event.mergeQuery).toHaveBeenCalledWith({
      advertising: {
        conversion: {
          StitchIds: {
            SurferId: "test-surfer-id",
            RampIDEnv: "test-ramp-id",
          },
        },
      },
    });
  });

  it("should handle configuration without ID5", async () => {
    const configWithoutId5 = {
      rampIdJSPath: "/test-path",
    };

    getSurferId.mockResolvedValue("test-surfer-id");
    getRampId.mockResolvedValue("test-ramp-id");

    await handleOnBeforeSendEvent({
      cookieManager,
      logger,
      state,
      event,
      config: configWithoutId5,
    });

    expect(getSurferId).toHaveBeenCalled();
    expect(getID5Id).toHaveBeenCalledWith(logger, null, false);
    expect(getRampId).toHaveBeenCalledWith(logger, null, cookieManager, false);

    expect(event.mergeQuery).toHaveBeenCalledWith({
      advertising: {
        conversion: {
          StitchIds: {
            SurferId: "test-surfer-id",
            RampIDEnv: "test-ramp-id",
          },
        },
      },
    });
  });

  it("should handle configuration without RampId", async () => {
    const configWithoutRamp = {
      id5PartnerId: "test-partner",
    };

    getSurferId.mockResolvedValue("test-surfer-id");
    getID5Id.mockResolvedValue("test-id5-id");

    await handleOnBeforeSendEvent({
      cookieManager,
      logger,
      state,
      event,
      config: configWithoutRamp,
    });

    expect(getSurferId).toHaveBeenCalled();
    expect(getID5Id).toHaveBeenCalledWith(logger, null, false);
    expect(getRampId).toHaveBeenCalledWith(logger, null, cookieManager, false);

    expect(event.mergeQuery).toHaveBeenCalledWith({
      advertising: {
        conversion: {
          StitchIds: {
            SurferId: "test-surfer-id",
            ID5: "test-id5-id",
          },
        },
      },
    });
  });

  it("should handle empty configuration", async () => {
    getSurferId.mockResolvedValue("test-surfer-id");

    await handleOnBeforeSendEvent({
      cookieManager,
      logger,
      state,
      event,
      config: {},
    });

    expect(getSurferId).toHaveBeenCalled();
    expect(getID5Id).toHaveBeenCalledWith(logger, null, false);
    expect(getRampId).toHaveBeenCalledWith(logger, null, cookieManager, false);

    expect(event.mergeQuery).toHaveBeenCalledWith({
      advertising: {
        conversion: {
          StitchIds: {
            SurferId: "test-surfer-id",
          },
        },
      },
    });
  });

  it("should handle all null IDs gracefully", async () => {
    getSurferId.mockResolvedValue(null);
    getID5Id.mockResolvedValue(null);
    getRampId.mockResolvedValue(null);

    await handleOnBeforeSendEvent({
      cookieManager,
      logger,
      state,
      event,
      config,
    });

    expect(event.mergeXdm).not.toHaveBeenCalled();
  });

  it("should handle identity collection errors", async () => {
    getSurferId.mockRejectedValue(new Error("Failed to get surfer ID"));
    getID5Id.mockRejectedValue(new Error("Failed to get ID5 ID"));
    getRampId.mockRejectedValue(new Error("Failed to get Ramp ID"));

    await handleOnBeforeSendEvent({
      cookieManager,
      logger,
      state,
      event,
      config,
    });

    expect(event.mergeXdm).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(
      "Error in onBeforeSendEvent hook:",
      expect.any(Error),
    );
  });

  it("should set flag to prevent concurrent processing", async () => {
    state.processingAdvertisingIds = true;

    await handleOnBeforeSendEvent({
      cookieManager,
      logger,
      state,
      event,
      config,
    });

    expect(getSurferId).not.toHaveBeenCalled();
    expect(getID5Id).not.toHaveBeenCalled();
    expect(getRampId).not.toHaveBeenCalled();
    expect(event.mergeXdm).not.toHaveBeenCalled();
  });

  it("should prevent concurrent calls from processing", async () => {
    // First call starts processing
    const firstCall = handleOnBeforeSendEvent({
      cookieManager,
      logger,
      state,
      event,
      config,
    });

    // Second call should return immediately
    const secondCall = handleOnBeforeSendEvent({
      cookieManager,
      logger,
      state,
      event,
      config,
    });

    await Promise.all([firstCall, secondCall]);

    // Only one set of identity collection calls should be made
    expect(getSurferId).toHaveBeenCalledTimes(1);
    expect(getID5Id).toHaveBeenCalledTimes(1);
    expect(getRampId).toHaveBeenCalledTimes(1);
  });
});
