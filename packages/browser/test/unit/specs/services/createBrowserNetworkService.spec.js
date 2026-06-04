/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { afterEach, describe, it, expect, vi } from "vitest";
import createBrowserNetworkService from "../../../../src/services/createBrowserNetworkService.js";

const createLogger = () => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("BrowserNetworkService", () => {
  it("exposes sendFetchRequest as a function and sendBeacon when available", () => {
    const network = createBrowserNetworkService();
    expect(typeof network.sendFetchRequest).toBe("function");
    expect(typeof network.sendBeacon).toBe("function");
  });

  it("sets sendBeacon to null when navigator.sendBeacon is unavailable", () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      Navigator.prototype,
      "sendBeacon",
    );
    delete Navigator.prototype.sendBeacon;
    try {
      const network = createBrowserNetworkService();
      expect(network.sendBeacon).toBeNull();
    } finally {
      if (descriptor) {
        Object.defineProperty(Navigator.prototype, "sendBeacon", descriptor);
      }
    }
  });
});
