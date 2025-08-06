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
    default: vi.fn(() => Promise.resolve("mock-surfer-id")),
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
  }),
);

describe("Advertising::onBeforeSendEventHandler", () => {
  let cookieManager;
  let logger;
  let state;
  let event;
  let componentConfig;
  let getSurferId;
  let getID5Id;
  let getRampId;
  let getBrowser;

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

    componentConfig = {
      id5PartnerId: "test-partner",
      rampIdJSPath: "/test-path",
    };

    getBrowser = vi.fn().mockReturnValue("Chrome");

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

    getSurferId = vi.mocked(surferIdModule.default);
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
      componentConfig,
      options: {},
      getBrowser,
    });

    expect(getSurferId).not.toHaveBeenCalled();
    expect(getID5Id).not.toHaveBeenCalled();
    expect(getRampId).not.toHaveBeenCalled();
    expect(event.mergeXdm).not.toHaveBeenCalled();
  });

  it("should return early when advertising is disabled", async () => {
    await handleOnBeforeSendEvent({
      cookieManager,
      logger,
      state,
      event,
      componentConfig,
      options: { handleAdvertisingData: "disabled" },
      getBrowser,
    });

    expect(getSurferId).not.toHaveBeenCalled();
    expect(getID5Id).not.toHaveBeenCalled();
    expect(getRampId).not.toHaveBeenCalled();
    expect(event.mergeQuery).not.toHaveBeenCalled();
  });

  it("should return early when handleAdvertisingData is null", async () => {
    await handleOnBeforeSendEvent({
      cookieManager,
      logger,
      state,
      event,
      componentConfig,
      options: { handleAdvertisingData: null },
      getBrowser,
    });

    expect(getSurferId).not.toHaveBeenCalled();
    expect(getID5Id).not.toHaveBeenCalled();
    expect(getRampId).not.toHaveBeenCalled();
    expect(event.mergeQuery).not.toHaveBeenCalled();
  });

  it("should wait for surfer ID when handleAdvertisingData is 'wait'", async () => {
    getSurferId.mockResolvedValue("test-surfer-id");

    await handleOnBeforeSendEvent({
      cookieManager,
      logger,
      state,
      event,
      componentConfig,
      options: { handleAdvertisingData: "wait" },
      getBrowser,
    });

    expect(getSurferId).toHaveBeenCalledWith(cookieManager, getBrowser, true);
    expect(getID5Id).toHaveBeenCalledWith(logger, null, false, true);
    expect(getRampId).toHaveBeenCalledWith(
      logger,
      null,
      cookieManager,
      false,
      true,
    );
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
      componentConfig,
      options: {},
      getBrowser,
    });

    expect(getSurferId).toHaveBeenCalledWith(cookieManager, getBrowser, false);
    expect(getID5Id).toHaveBeenCalledWith(logger, null, false, false);
    expect(getRampId).toHaveBeenCalledWith(
      logger,
      null,
      cookieManager,
      false,
      false,
    );

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

    expect(state.surferIdAppendedToAepEvent).toBe(true);
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
      componentConfig,
      options: {},
      getBrowser,
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
    getSurferId.mockResolvedValue(null);
    getID5Id.mockResolvedValue("test-id5-id");
    getRampId.mockResolvedValue(null);

    await handleOnBeforeSendEvent({
      cookieManager,
      logger,
      state,
      event,
      componentConfig: {
        rampIdJSPath: "/test-path",
      },
      options: {},
      getBrowser,
    });

    expect(getSurferId).toHaveBeenCalled();
    expect(getID5Id).toHaveBeenCalledWith(logger, null, false, false);
    expect(getRampId).toHaveBeenCalledWith(
      logger,
      null,
      cookieManager,
      false,
      false,
    );

    expect(event.mergeQuery).toHaveBeenCalledWith({
      advertising: {
        conversion: {
          StitchIds: {
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
      componentConfig: {},
      options: {},
      getBrowser,
    });

    expect(getSurferId).toHaveBeenCalled();
    expect(getID5Id).toHaveBeenCalledWith(logger, null, false, false);
    expect(getRampId).toHaveBeenCalledWith(
      logger,
      null,
      cookieManager,
      false,
      false,
    );

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
      componentConfig,
      options: {},
      getBrowser,
    });

    expect(event.mergeXdm).not.toHaveBeenCalled();
    expect(state.surferIdAppendedToAepEvent).toBe(false);
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
      componentConfig,
      options: {},
      getBrowser,
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
      componentConfig,
      options: {},
    });

    expect(getSurferId).not.toHaveBeenCalled();
    expect(getID5Id).not.toHaveBeenCalled();
    expect(getRampId).not.toHaveBeenCalled();
    expect(event.mergeXdm).not.toHaveBeenCalled();
  });

  it("should prevent concurrent calls from processing", async () => {
    let resolveFirstCall;
    const firstCallPromise = new Promise((resolve) => {
      resolveFirstCall = resolve;
    });

    getSurferId.mockImplementation(() => firstCallPromise);

    // Start two concurrent calls
    const call1 = handleOnBeforeSendEvent({
      cookieManager,
      logger,
      state,
      event,
      componentConfig,
      options: {},
    });

    const call2 = handleOnBeforeSendEvent({
      cookieManager,
      logger,
      state,
      event,
      componentConfig,
      options: {},
    });

    // Resolve the first call
    resolveFirstCall("test-surfer-id");

    await Promise.all([call1, call2]);

    // Should only be called once due to concurrent processing protection
    expect(getSurferId).toHaveBeenCalledTimes(1);
  });
});
