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
import createComponent from "../../../../../src/components/Advertising/createComponent.js";

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
  "../../../../../src/components/Advertising/handlers/createAdConversionHandler.js",
);
vi.mock(
  "../../../../../src/components/Advertising/utils/createAdvertisingSessionManager.js",
);
vi.mock(
  "../../../../../src/components/Advertising/handlers/clickThroughHandler.js",
);
vi.mock(
  "../../../../../src/components/Advertising/handlers/viewThroughHandler.js",
);
vi.mock(
  "../../../../../src/components/Advertising/handlers/onBeforeSendEventHandler.js",
);
vi.mock("../../../../../src/components/Advertising/utils/helpers.js");

describe("Advertising::createComponent", () => {
  let logger;
  let config;
  let eventManager;
  let sendEdgeNetworkRequest;
  let consent;
  let cookieManager;
  let adConversionHandler;
  let handleClickThrough;
  let handleViewThrough;
  let handleOnBeforeSendEvent;
  let getUrlParams;

  beforeEach(async () => {
    // Mock logger
    logger = {
      info: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
    };

    // Mock config
    config = {
      orgId: "test-org-id",
      advertising: {
        viewThruEnabled: true,
        throttleMinutes: 30,
        id5PartnerId: "test-partner",
        liverampScriptPath: "/test-path",
      },
    };

    // Mock event manager
    eventManager = {
      createEvent: vi.fn(),
    };

    // Mock sendEdgeNetworkRequest
    sendEdgeNetworkRequest = vi.fn();

    // Mock consent
    consent = {
      awaitConsent: vi.fn(),
    };

    // Mock cookie manager
    cookieManager = {
      getValue: vi.fn(),
      setValue: vi.fn(),
      readClickData: vi.fn(),
      writeClickData: vi.fn(),
    };

    // Mock ad conversion handler
    adConversionHandler = {
      trackAdConversion: vi.fn(),
    };

    // Mock handlers
    handleClickThrough = vi.fn().mockResolvedValue({ status: "click-through" });
    handleViewThrough = vi.fn().mockResolvedValue([{ status: "view-through" }]);
    handleOnBeforeSendEvent = vi.fn().mockResolvedValue();

    // Mock URL params helper
    getUrlParams = vi.fn().mockReturnValue({ skwcid: null, efid: null });

    // Setup mocks
    const { default: createAdConversionHandler } = await import(
      "../../../../../src/components/Advertising/handlers/createAdConversionHandler.js"
    );
    const { default: createCookieManager } = await import(
      "../../../../../src/components/Advertising/utils/createAdvertisingSessionManager.js"
    );
    const { default: clickThroughHandler } = await import(
      "../../../../../src/components/Advertising/handlers/clickThroughHandler.js"
    );
    const { default: viewThroughHandler } = await import(
      "../../../../../src/components/Advertising/handlers/viewThroughHandler.js"
    );
    const { default: onBeforeSendEventHandler } = await import(
      "../../../../../src/components/Advertising/handlers/onBeforeSendEventHandler.js"
    );
    const { getUrlParams: mockGetUrlParams } = await import(
      "../../../../../src/components/Advertising/utils/helpers.js"
    );

    createAdConversionHandler.mockReturnValue(adConversionHandler);
    createCookieManager.mockReturnValue(cookieManager);
    clickThroughHandler.mockImplementation(handleClickThrough);
    viewThroughHandler.mockImplementation(handleViewThrough);
    onBeforeSendEventHandler.mockImplementation(handleOnBeforeSendEvent);
    mockGetUrlParams.mockImplementation(getUrlParams);
  });

  it("should create session manager with orgId", async () => {
    const component = createComponent({
      logger,
      config,
      eventManager,
      sendEdgeNetworkRequest,
      consent,
    });

    const { default: createCookieManager } = await import(
      "../../../../../src/components/Advertising/utils/createAdvertisingSessionManager.js"
    );
    expect(createCookieManager).toHaveBeenCalledWith({
      orgId: "test-org-id",
      logger,
    });
    expect(component).toBeDefined();
  });
});
