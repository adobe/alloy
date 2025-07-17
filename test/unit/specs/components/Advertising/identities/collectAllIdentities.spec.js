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
import collectAllIdentities from "../../../../../../src/components/Advertising/identities/collectAllIdentities.js";

// Mock DOM and network operations to prevent real network calls
const mockCreateElement = vi.fn(() => ({
  src: "",
  height: 0,
  width: 0,
  frameBorder: 0,
  style: { display: "none" },
  addEventListener: vi.fn(),
  onerror: vi.fn(),
}));

const mockAppendChild = vi.fn();

// Mock global objects before importing modules
if (typeof globalThis.document !== "undefined") {
  globalThis.document.createElement = mockCreateElement;
  if (globalThis.document.body) {
    globalThis.document.body.appendChild = mockAppendChild;
  }
  if (globalThis.document.head) {
    globalThis.document.head.appendChild = mockAppendChild;
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

// Mock identity collection functions to return resolved promises immediately
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

describe("Advertising::collectAllIdentities", () => {
  let componentConfig;
  let cookieManager;
  let logger;
  let getSurferId;
  let getID5Id;
  let getRampId;

  beforeEach(async () => {
    componentConfig = {
      id5Enabled: true,
      id5PartnerId: "test-partner",
      rampIdEnabled: true,
      rampIdJSPath: "/test-path",
    };

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

    // Setup mock functions
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

    // Reset mocks
    getSurferId.mockReset();
    getID5Id.mockReset();
    getRampId.mockReset();
  });

  it("should return promises for all non-throttled IDs", () => {
    cookieManager.getValue.mockImplementation((key) => {
      if (key.includes("last_conversion")) {
        return null; // No previous conversions
      }
      return null;
    });

    getSurferId.mockReturnValue(Promise.resolve("surfer-id"));
    getID5Id.mockReturnValue(Promise.resolve("id5-id"));
    getRampId.mockReturnValue(Promise.resolve("ramp-id"));

    const result = collectAllIdentities(logger, componentConfig, cookieManager);

    expect(result).toHaveProperty("surferId");
    expect(result).toHaveProperty("id5Id");
    expect(result).toHaveProperty("rampId");
    expect(Object.keys(result)).toHaveLength(3);
  });
});
