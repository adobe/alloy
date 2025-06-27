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

// Mock DOM and network operations to prevent real network calls
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
    };

    event = {
      mergeQuery: vi.fn(),
    };

    config = {
      id5PartnerId: "test-partner",
      liverampScriptPath: "/test-path",
    };

    // Get and reset mock functions
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

    getSurferId.mockReset();
    getID5Id.mockReset();
    getRampId.mockReset();
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
    expect(event.mergeQuery).not.toHaveBeenCalled();
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
    expect(getID5Id).toHaveBeenCalledWith("test-partner");
    expect(getRampId).toHaveBeenCalledWith("/test-path", cookieManager, false);

    expect(event.mergeQuery).toHaveBeenCalledWith({
      advertising: {
        gSurferId: "test-surfer-id",
        gID5Id: "test-id5-id",
        gRampId: "test-ramp-id",
      },
    });

    expect(logger.info).toHaveBeenCalledWith(
      "Adding advertising IDs to event query parameters",
    );
    expect(logger.info).toHaveBeenCalledWith(
      "Advertising IDs added to event query successfully",
    );
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
        gSurferId: "test-surfer-id",
        gRampId: "test-ramp-id",
      },
    });
  });

  it("should handle configuration without ID5", async () => {
    const configWithoutId5 = {
      liverampScriptPath: "/test-path",
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
    expect(getID5Id).not.toHaveBeenCalled();
    expect(getRampId).toHaveBeenCalled();

    expect(event.mergeQuery).toHaveBeenCalledWith({
      advertising: {
        gSurferId: "test-surfer-id",
        gRampId: "test-ramp-id",
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
    expect(getID5Id).toHaveBeenCalled();
    expect(getRampId).not.toHaveBeenCalled();

    expect(event.mergeQuery).toHaveBeenCalledWith({
      advertising: {
        gSurferId: "test-surfer-id",
        gID5Id: "test-id5-id",
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
    expect(getID5Id).not.toHaveBeenCalled();
    expect(getRampId).not.toHaveBeenCalled();

    expect(event.mergeQuery).toHaveBeenCalledWith({
      advertising: {
        gSurferId: "test-surfer-id",
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

    expect(event.mergeQuery).not.toHaveBeenCalled();
  });

  it("should handle identity collection errors", async () => {
    getSurferId.mockRejectedValue(new Error("Surfer ID failed"));
    getID5Id.mockResolvedValue("test-id5-id");
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
        gID5Id: "test-id5-id",
        gRampId: "test-ramp-id",
      },
    });

    // The implementation catches errors and converts them to null,
    // so errors don't propagate to the logger
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("should set flag to prevent concurrent processing", async () => {
    getSurferId.mockResolvedValue("test-surfer-id");

    await handleOnBeforeSendEvent({
      cookieManager,
      logger,
      state,
      event,
      config,
    });

    expect(state.surferIdAppendedToAepEvent).toBe(true);
  });

  it("should prevent concurrent calls from processing", async () => {
    getSurferId.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("test-surfer-id"), 100);
        }),
    );

    const promise1 = handleOnBeforeSendEvent({
      cookieManager,
      logger,
      state,
      event,
      config,
    });

    const promise2 = handleOnBeforeSendEvent({
      cookieManager,
      logger,
      state,
      event,
      config,
    });

    await Promise.all([promise1, promise2]);

    // Only one call should have processed
    expect(event.mergeQuery).toHaveBeenCalledTimes(1);
  });
});
