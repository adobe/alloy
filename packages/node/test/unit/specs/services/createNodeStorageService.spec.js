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
import createNodeStorageService from "../../../../src/services/createNodeStorageService.js";

describe("createNodeStorageService", () => {
  it("exposes session and persistent storage areas", () => {
    const { session, persistent } =
      createNodeStorageService().createNamespacedStorage("test.");
    expect(session).toBeDefined();
    expect(persistent).toBeDefined();
  });

  it.each(["session", "persistent"])(
    "%s storage: getItem/setItem/removeItem/clear round-trip",
    async (area) => {
      const storage =
        createNodeStorageService().createNamespacedStorage("test.")[area];

      expect(await storage.getItem("name")).toBeNull();

      expect(await storage.setItem("name", "value")).toBe(true);
      expect(await storage.getItem("name")).toBe("value");

      expect(await storage.removeItem("name")).toBe(true);
      expect(await storage.getItem("name")).toBeNull();

      await storage.setItem("a", "1");
      await storage.setItem("b", "2");
      expect(await storage.clear()).toBe(true);
      expect(await storage.getItem("a")).toBeNull();
      expect(await storage.getItem("b")).toBeNull();
    },
  );

  it("isolates storage areas created by separate createNamespacedStorage() calls", async () => {
    const service = createNodeStorageService();
    const first = service.createNamespacedStorage("instance.a.");
    const second = service.createNamespacedStorage("instance.b.");

    await first.session.setItem("name", "from-first");

    expect(await second.session.getItem("name")).toBeNull();
  });
});
