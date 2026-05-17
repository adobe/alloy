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

import { describe, it, expect } from "vitest";
import createBrowserRuntimeService from "../../../../src/services/createBrowserRuntimeService.js";

describe("BrowserRuntimeService", () => {
  it("setTimeout/clearTimeout are bound to window (no illegal invocation when called as free functions)", async () => {
    const runtime = createBrowserRuntimeService();
    const { setTimeout: timeoutFn, clearTimeout: clearFn } = runtime;
    const fired = new Promise((resolve) => {
      const id = timeoutFn(resolve, 0);
      // Calling clear as a free function should not throw.
      expect(() => clearFn(id + 9999)).not.toThrow();
    });
    await fired;
  });

  it("atob/btoa round-trip as free functions", () => {
    const runtime = createBrowserRuntimeService();
    const { atob: atobFn, btoa: btoaFn } = runtime;
    expect(atobFn(btoaFn("hello"))).toBe("hello");
  });

  it("exposes TextEncoder/TextDecoder constructors and a now() timestamp", () => {
    const runtime = createBrowserRuntimeService();
    expect(new runtime.TextEncoder().encode("a").length).toBe(1);
    expect(new runtime.TextDecoder().decode(new Uint8Array([97]))).toBe("a");
    expect(typeof runtime.now()).toBe("number");
  });
});
