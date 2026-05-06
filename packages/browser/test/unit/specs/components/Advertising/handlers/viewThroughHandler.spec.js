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
import handleViewThrough from "../../../../../../src/components/Advertising/handlers/viewThroughHandler.js";
import collectAllIdentities from "../../../../../../src/components/Advertising/identities/collectAllIdentities.js";
import flushPromiseChains from "../../../../helpers/flushPromiseChains.js";

afterEach(() => {
  vi.restoreAllMocks();
});

vi.mock(
  import("../../../../../../src/components/Advertising/identities/collectAllIdentities.js"),
  () => ({
    default: vi.fn(),
  }),
);

describe("Advertising::viewThroughHandler", () => {
  let eventManager;
  let cookieManager;
  let logger;
  let componentConfig;
  let adConversionHandler;
  let getBrowser;
  let collectSurferId;
  let collectHashedIPAddr;

  beforeEach(() => {
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
    collectSurferId = vi.fn().mockResolvedValue(null);
    collectHashedIPAddr = vi.fn().mockResolvedValue(null);

    const fixedTs = Date.UTC(2024, 0, 1, 0, 0, 0);
    vi.spyOn(Date, "now").mockReturnValue(fixedTs);
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
      collectSurferId,
      collectHashedIPAddr,
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
      collectSurferId,
      collectHashedIPAddr,
    });

    await flushPromiseChains();

    expect(collectAllIdentities).toHaveBeenCalledWith(
      logger,
      componentConfig,
      cookieManager,
      getBrowser,
      collectSurferId,
    );

    expect(mockEvent.setUserXdm).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "advertising.enrichment",
      }),
    );

    expect(mockEvent.mergeQuery).toHaveBeenCalledWith({
      advertising: {
        advIds: "",
        eventType: "advertising.enrichment",
        stitchIds: {
          surferId: "test-surfer-id",
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
      collectSurferId,
      collectHashedIPAddr,
    });

    await flushPromiseChains();

    expect(mockEvent.setUserXdm).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "advertising.enrichment",
      }),
    );

    expect(logger.error).toHaveBeenCalledWith(
      "Ad conversion submission failed",
      expect.any(Error),
    );

    expect(result).toEqual([{ status: "fulfilled", value: null }]);
  });
});
