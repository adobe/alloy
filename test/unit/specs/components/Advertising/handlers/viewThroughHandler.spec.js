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
Object.defineProperty(globalThis, "fetch", {
  value: vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    }),
  ),
  writable: true,
});

// Mock DOM operations by overriding methods
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

describe("Advertising::viewThroughHandler", () => {
  let eventManager;
  let cookieManager;
  let logger;
  let componentConfig;
  let adConversionHandler;
  let collectAllIdentities;

  beforeEach(async () => {
    eventManager = {
      createEvent: vi.fn(),
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
    });

    expect(result).toEqual([]);
    expect(logger.info).toHaveBeenCalledWith(
      "All identity types throttled, skipping conversion",
    );
  });

  it("should process identity resolution", async () => {
    const surferId = Promise.resolve("test-surfer-id");
    collectAllIdentities.mockReturnValue({
      surferId,
    });

    eventManager.createEvent.mockReturnValue({
      setUserXdm: vi.fn(),
      finalize: vi.fn(),
    });

    const result = await handleViewThrough({
      eventManager,
      cookieManager,
      logger,
      componentConfig,
      adConversionHandler,
    });

    await flushPromiseChains();

    expect(collectAllIdentities).toHaveBeenCalledWith(
      componentConfig,
      cookieManager,
    );
    expect(logger.info).toHaveBeenCalledWith("ID resolution promises:", [
      "surferId",
    ]);
    expect(result).toBeDefined();
  });
});
