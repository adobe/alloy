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

import { afterEach, describe, it, expect } from "vitest";
import createBrowserLegacyService from "../../../../src/services/createBrowserLegacyService.js";

const createLogger = () => ({
  info: () => {},
  warn: () => {},
  error: () => {},
});

afterEach(() => {
  delete window.Visitor;
  delete window.adobe;
});

describe("BrowserLegacyService", () => {
  it("awaitVisitorOptIn resolves immediately when window.adobe.optIn is absent", async () => {
    const legacy = createBrowserLegacyService();
    await expect(
      legacy.awaitVisitorOptIn({ logger: createLogger() }),
    ).resolves.toBeUndefined();
  });

  it("getEcidFromVisitor resolves to undefined when window.Visitor is absent", async () => {
    const legacy = createBrowserLegacyService();
    await expect(
      legacy.getEcidFromVisitor({
        orgId: "ORG@AdobeOrg",
        logger: createLogger(),
      }),
    ).resolves.toBeUndefined();
  });

  it("awaitVisitorOptIn waits for legacy adobe.optIn approval", async () => {
    let fetchPermissionsCallback;
    window.adobe = {
      optIn: {
        Categories: { ECID: "ecid" },
        isApproved: (cats) => cats.includes("ecid"),
        fetchPermissions: (cb) => {
          fetchPermissionsCallback = cb;
        },
      },
    };
    const legacy = createBrowserLegacyService();
    const pending = legacy.awaitVisitorOptIn({ logger: createLogger() });
    expect(typeof fetchPermissionsCallback).toBe("function");
    fetchPermissionsCallback();
    await expect(pending).resolves.toBeUndefined();
  });
});
