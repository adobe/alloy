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

// Mock identity collectors to return resolved promises immediately
vi.mock(
  "../../../../../../src/components/Advertising/identities/collectSurferId.js",
  () => ({
    default: vi.fn(() => Promise.resolve("mock-surfer-id")),
  }),
);

vi.mock(
  "../../../../../../src/components/Advertising/identities/initiateAdvertisingIdentityCall.js",
  () => ({
    collectHashedIPAddr: vi.fn(() => Promise.resolve("")),
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
    appendAdCloudIdentityToEvent: vi.fn(),
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
  let event;
  let componentConfig;
  let getSurferId;
  let collectHashedIPAddr;
  let getID5Id;
  let getRampId;
  let getBrowser;
  let appendAdCloudIdentityToEvent;
  let isThrottled;

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

    event = {
      mergeXdm: vi.fn(),
      mergeQuery: vi.fn(),
      getUserIdentityMap: vi.fn().mockReturnValue(undefined),
      getUserXdm: vi.fn().mockReturnValue(undefined),
    };

    componentConfig = {
      id5PartnerId: "test-partner",
      rampIdJSPath: "/test-path",
      dspEnabled: true,
    };

    // Default to a non-Chrome browser so RampID is collected by default
    getBrowser = vi.fn().mockReturnValue("Firefox");

    // Get and reset mock functions - these are already mocked at module level
    const surferIdModule = await import(
      "../../../../../../src/components/Advertising/identities/collectSurferId.js"
    );
    const hashedIpModule = await import(
      "../../../../../../src/components/Advertising/identities/initiateAdvertisingIdentityCall.js"
    );
    const id5IdModule = await import(
      "../../../../../../src/components/Advertising/identities/collectID5Id.js"
    );
    const rampIdModule = await import(
      "../../../../../../src/components/Advertising/identities/collectRampId.js"
    );

    getSurferId = vi.mocked(surferIdModule.default);
    collectHashedIPAddr = vi.mocked(hashedIpModule.collectHashedIPAddr);
    getID5Id = vi.mocked(id5IdModule.getID5Id);
    getRampId = vi.mocked(rampIdModule.getRampId);

    const helpersModule = await import(
      "../../../../../../src/components/Advertising/utils/helpers.js"
    );
    appendAdCloudIdentityToEvent = vi.mocked(
      helpersModule.appendAdCloudIdentityToEvent,
    );
    isThrottled = vi.mocked(helpersModule.isThrottled);

    // Reset and set default return values
    getSurferId.mockReset().mockResolvedValue(null);
    collectHashedIPAddr.mockReset().mockResolvedValue("");
    getID5Id.mockReset().mockResolvedValue(null);
    getRampId.mockReset().mockResolvedValue(null);
    appendAdCloudIdentityToEvent.mockClear();
    isThrottled.mockReset().mockReturnValue(false);
  });

  it("should return early when advertising is disabled", async () => {
    await handleOnBeforeSendEvent({
      cookieManager,
      logger,
      event,
      componentConfig,
      advertising: { handleAdvertisingData: "disabled" },
      getBrowser,
    });

    expect(getSurferId).not.toHaveBeenCalled();
    expect(getID5Id).not.toHaveBeenCalled();
    expect(getRampId).not.toHaveBeenCalled();
    expect(event.mergeQuery).not.toHaveBeenCalled();
  });

  it("should return early when advertising.handleAdvertisingData is null", async () => {
    await handleOnBeforeSendEvent({
      cookieManager,
      logger,
      event,
      componentConfig,
      advertising: { handleAdvertisingData: null },
      getBrowser,
    });

    expect(getSurferId).not.toHaveBeenCalled();
    expect(getID5Id).not.toHaveBeenCalled();
    expect(getRampId).not.toHaveBeenCalled();
    expect(event.mergeQuery).not.toHaveBeenCalled();
  });

  it("should wait for surfer ID when advertising.handleAdvertisingData is 'wait'", async () => {
    getSurferId.mockResolvedValue("test-surfer-id");

    await handleOnBeforeSendEvent({
      cookieManager,
      logger,
      event,
      componentConfig,
      advertising: { handleAdvertisingData: "wait" },
      getBrowser,
    });

    expect(getSurferId).toHaveBeenCalledWith(cookieManager, getBrowser, true);
    expect(getID5Id).toHaveBeenCalledWith(logger, "test-partner", true, true);
    expect(getRampId).toHaveBeenCalledWith(
      logger,
      "/test-path",
      cookieManager,
      true,
      true,
    );
  });

  it("should collect and merge available advertising IDs", async () => {
    getSurferId.mockResolvedValue("test-surfer-id");
    getID5Id.mockResolvedValue("test-id5-id");
    getRampId.mockResolvedValue("test-ramp-id");
    event.getUserIdentityMap.mockReturnValue({});

    await handleOnBeforeSendEvent({
      cookieManager,
      logger,
      event,
      componentConfig,
      advertising: { handleAdvertisingData: "auto" },
      getBrowser,
    });

    expect(getSurferId).toHaveBeenCalledWith(cookieManager, getBrowser, false);
    expect(getID5Id).toHaveBeenCalledWith(logger, "test-partner", false, false);
    expect(getRampId).toHaveBeenCalledWith(
      logger,
      "/test-path",
      cookieManager,
      false,
      false,
    );

    expect(appendAdCloudIdentityToEvent).toHaveBeenCalledWith(
      {
        surferId: "test-surfer-id",
        id5Id: "test-id5-id",
        rampId: "test-ramp-id",
      },
      event,
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
  });

  it("should include hashedIP in availableIdsForIdentity and availableIds when collectHashedIPAddr resolves a value", async () => {
    getSurferId.mockResolvedValue("test-surfer-id");
    collectHashedIPAddr.mockResolvedValue(
      "92a8071c9c08f76e03b5d56a50aa1ae6",
    );
    getID5Id.mockResolvedValue(null);
    getRampId.mockResolvedValue(null);
    event.getUserIdentityMap.mockReturnValue({});

    await handleOnBeforeSendEvent({
      cookieManager,
      logger,
      event,
      componentConfig,
      advertising: { handleAdvertisingData: "auto" },
      getBrowser,
    });

    expect(collectHashedIPAddr).toHaveBeenCalledWith(cookieManager);
    expect(appendAdCloudIdentityToEvent).toHaveBeenCalledWith(
      {
        surferId: "test-surfer-id",
        hashedIP: "92a8071c9c08f76e03b5d56a50aa1ae6",
      },
      event,
    );
    expect(event.mergeQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        advertising: expect.objectContaining({
          conversion: expect.objectContaining({
            StitchIds: expect.objectContaining({
              SurferId: "test-surfer-id",
            }),
          }),
        }),
      }),
    );
  });

  it("should only include available IDs", async () => {
    getSurferId.mockResolvedValue("test-surfer-id");
    getID5Id.mockResolvedValue(null);
    getRampId.mockResolvedValue("test-ramp-id");
    event.getUserIdentityMap.mockReturnValue({});

    await handleOnBeforeSendEvent({
      cookieManager,
      logger,
      event,
      componentConfig,
      advertising: { handleAdvertisingData: "auto" },
      getBrowser,
    });

    expect(appendAdCloudIdentityToEvent).toHaveBeenCalledWith(
      { surferId: "test-surfer-id", rampId: "test-ramp-id" },
      event,
    );

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

  it("should handle configuration without ID5 partner id (skip ID5 call)", async () => {
    getSurferId.mockResolvedValue(null);
    getRampId.mockResolvedValue("test-ramp-id");
    event.getUserIdentityMap.mockReturnValue({});

    await handleOnBeforeSendEvent({
      cookieManager,
      logger,
      event,
      componentConfig: {
        rampIdJSPath: "/test-path",
      },
      advertising: { handleAdvertisingData: "auto" },
      getBrowser,
    });

    expect(appendAdCloudIdentityToEvent).toHaveBeenCalledWith(
      { rampId: "test-ramp-id" },
      event,
    );

    expect(getSurferId).toHaveBeenCalled();
    expect(getID5Id).not.toHaveBeenCalled();
    expect(getRampId).toHaveBeenCalledWith(
      logger,
      "/test-path",
      cookieManager,
      false,
      false,
    );

    expect(event.mergeQuery).toHaveBeenCalledWith({
      advertising: {
        conversion: {
          StitchIds: {
            RampIDEnv: "test-ramp-id",
          },
        },
      },
    });
  });

  it("should handle empty configuration", async () => {
    getSurferId.mockResolvedValue("test-surfer-id");
    event.getUserIdentityMap.mockReturnValue({});

    await handleOnBeforeSendEvent({
      cookieManager,
      logger,
      event,
      componentConfig: {},
      advertising: { handleAdvertisingData: "auto" },
      getBrowser,
    });

    expect(appendAdCloudIdentityToEvent).toHaveBeenCalledWith(
      { surferId: "test-surfer-id" },
      event,
    );

    expect(getSurferId).toHaveBeenCalled();
    expect(getID5Id).not.toHaveBeenCalled();
    expect(getRampId).toHaveBeenCalledWith(
      logger,
      undefined,
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
      event,
      componentConfig,
      advertising: {},
      getBrowser,
    });

    expect(appendAdCloudIdentityToEvent).not.toHaveBeenCalled();
    expect(event.mergeQuery).not.toHaveBeenCalled();
  });

  it("should handle identity collection errors", async () => {
    getSurferId.mockRejectedValue(new Error("Failed to get surfer ID"));
    collectHashedIPAddr.mockRejectedValue(new Error("Failed to get hashed IP"));
    getID5Id.mockRejectedValue(new Error("Failed to get ID5 ID"));
    getRampId.mockRejectedValue(new Error("Failed to get Ramp ID"));

    await handleOnBeforeSendEvent({
      cookieManager,
      logger,
      event,
      componentConfig,
      advertising: { handleAdvertisingData: "auto" },
      getBrowser,
    });

    expect(appendAdCloudIdentityToEvent).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("should call appendAdCloudIdentityToEvent with availableIdsForIdentity (all resolved IDs) and appendAdvertisingIdQueryToEvent with availableIds (non-throttled only)", async () => {
    getSurferId.mockResolvedValue("surfer-val");
    getID5Id.mockResolvedValue("id5-val");
    getRampId.mockResolvedValue("ramp-val");
    event.getUserIdentityMap.mockReturnValue({});
    isThrottled.mockImplementation((idType) => idType === "surferId");

    await handleOnBeforeSendEvent({
      cookieManager,
      logger,
      event,
      componentConfig,
      advertising: { handleAdvertisingData: "auto" },
      getBrowser,
    });

    expect(appendAdCloudIdentityToEvent).toHaveBeenCalledWith(
      {
        surferId: "surfer-val",
        id5Id: "id5-val",
        rampId: "ramp-val",
      },
      event,
    );
    expect(event.mergeQuery).toHaveBeenCalledWith({
      advertising: {
        conversion: {
          StitchIds: {
            ID5: "id5-val",
            RampIDEnv: "ramp-val",
          },
        },
      },
    });
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
      event,
      componentConfig,
      advertising: { handleAdvertisingData: "auto" },
      getBrowser,
    });

    const call2 = handleOnBeforeSendEvent({
      cookieManager,
      logger,
      event,
      componentConfig,
      advertising: { handleAdvertisingData: "auto" },
      getBrowser,
    });

    // Resolve the first call
    resolveFirstCall("test-surfer-id");

    await Promise.all([call1, call2]);

    expect(getSurferId).toHaveBeenCalledTimes(2);
  });
});
