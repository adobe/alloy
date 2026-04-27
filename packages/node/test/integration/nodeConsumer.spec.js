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

// These tests simulate a Node.js application consuming @adobe/alloy-core
// via the @adobe/alloy-node wrapper. They are skipped until the Universal
// JS migration is complete — see packages/browser/UNIVERSAL_JS_MIGRATION.md.
// Today they fail at module load because @adobe/alloy-core references
// `window`, `document`, etc. at module scope.
// eslint-disable-next-line vitest/no-disabled-tests -- skipped until Universal JS migration completes
describe.skip("Node consumer integration", () => {
  const config = {
    orgId: "5BFE274A5F6980A50A495C08@AdobeOrg",
    datastreamId: "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83",
    edgeDomain: "edge.adobedc.net",
    edgeBasePath: "ee",
    thirdPartyCookiesEnabled: false,
    debugEnabled: false,
  };

  it("imports @adobe/alloy-core without throwing", async () => {
    const mod = await import("@adobe/alloy-core");
    expect(mod.createCustomInstance).toBeTypeOf("function");
  });

  it("imports @adobe/alloy-node without throwing", async () => {
    const mod = await import("../../src/index.js");
    expect(mod.createInstance).toBeTypeOf("function");
  });

  it("creates an instance", async () => {
    const { createInstance } = await import("../../src/index.js");
    const alloy = createInstance();
    expect(alloy).toBeTypeOf("function");
  });

  it("configures an instance", async () => {
    const { createInstance } = await import("../../src/index.js");
    const alloy = createInstance();
    await expect(alloy("configure", config)).resolves.toBeDefined();
  });

  it("sends an event", async () => {
    const { createInstance } = await import("../../src/index.js");
    const alloy = createInstance();
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
