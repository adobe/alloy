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

// Lifecycle tests below are skipped until core's remaining `window`
// references are migrated to capabilities — `createInstance(...)` still
// crashes in Node otherwise.
//
// Imports are static so file-load failure is the signal. Dynamic
// `await import()` would be charged against the 5s per-test timeout, which
// Vite's first-run dep bundling can blow past when the full suite runs in
// parallel.
import { describe, it, expect } from "vitest";
import * as core from "@adobe/alloy-core";
import * as coreServices from "@adobe/alloy-core/services";
import * as node from "../../src/index.js";

const config = {
  orgId: "5BFE274A5F6980A50A495C08@AdobeOrg",
  datastreamId: "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83",
  edgeDomain: "edge.adobedc.net",
  edgeBasePath: "ee",
  thirdPartyCookiesEnabled: false,
  debugEnabled: false,
};

describe("Node consumer integration", () => {
  it("imports @adobe/alloy-core without throwing", () => {
    expect(core.createCustomInstance).toBeTypeOf("function");
    expect(core.createInstance).toBeTypeOf("function");
  });

  it("imports @adobe/alloy-core/services without throwing", () => {
    expect(coreServices).toBeDefined();
  });

  it("imports @adobe/alloy-node without throwing", () => {
    expect(node.createInstance).toBeTypeOf("function");
    expect(node.createCustomInstance).toBeTypeOf("function");
  });

  // eslint-disable-next-line vitest/no-disabled-tests -- skipped until Universal JS migration completes
  it.skip("creates an instance", () => {
    const alloy = node.createInstance();
    expect(alloy).toBeTypeOf("function");
  });

  // eslint-disable-next-line vitest/no-disabled-tests -- skipped until Universal JS migration completes
  it.skip("configures an instance", async () => {
    const alloy = node.createInstance();
    await expect(alloy("configure", config)).resolves.toBeDefined();
  });

  // eslint-disable-next-line vitest/no-disabled-tests -- skipped until Universal JS migration completes
  it.skip("sends an event", async () => {
    const alloy = node.createInstance();
    await alloy("configure", config);

    const result = await alloy("sendEvent", {
      xdm: {
        eventType: "test.nodeConsumer",
        _id: "00000000-0000-0000-0000-000000000000",
      },
    });

    expect(result).toBeDefined();
  });
});
