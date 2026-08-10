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

import { describe, it, expect, vi } from "vitest";
import createNodeRuntimeService from "../../../../src/services/createNodeRuntimeService.js";

describe("createNodeRuntimeService", () => {
  it("round-trips base64 via atob/btoa", () => {
    const runtime = createNodeRuntimeService();
    expect(runtime.atob(runtime.btoa("hello"))).toBe("hello");
  });

  it("exposes working TextEncoder/TextDecoder", () => {
    const runtime = createNodeRuntimeService();
    const encoded = new runtime.TextEncoder().encode("hello");
    expect(new runtime.TextDecoder().decode(encoded)).toBe("hello");
  });

  it("now() returns the current epoch-millisecond timestamp", () => {
    const runtime = createNodeRuntimeService();
    expect(runtime.now()).toBeCloseTo(Date.now(), -2);
  });

  it("setTimeout/clearTimeout schedule and cancel a callback", async () => {
    const runtime = createNodeRuntimeService();
    const shouldNotRun = vi.fn();

    await new Promise((resolve) => {
      const id = runtime.setTimeout(shouldNotRun, 10);
      runtime.clearTimeout(id);
      runtime.setTimeout(resolve, 20);
    });

    expect(shouldNotRun).not.toHaveBeenCalled();
  });
});
