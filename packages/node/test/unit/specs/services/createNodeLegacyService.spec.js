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
import createNodeLegacyService from "../../../../src/services/createNodeLegacyService.js";

describe("createNodeLegacyService", () => {
  it("getEcidFromVisitor resolves to undefined — there is no Visitor.js in Node", async () => {
    const legacy = createNodeLegacyService();
    await expect(
      legacy.getEcidFromVisitor({ orgId: "org", logger: {} }),
    ).resolves.toBeUndefined();
  });

  it("awaitVisitorOptIn resolves immediately — there is no legacy opt-in object in Node", async () => {
    const legacy = createNodeLegacyService();
    await expect(
      legacy.awaitVisitorOptIn({ logger: {} }),
    ).resolves.toBeUndefined();
  });
});
