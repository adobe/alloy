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

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../../../src/utils/createDecodeKndctrCookie.js", () => ({
  default: vi.fn(),
}));

import createIdentity from "../../../../../src/core/identity/createIdentity.js";
import createDecodeKndctrCookie from "../../../../../src/utils/createDecodeKndctrCookie.js";

describe("createIdentity", () => {
  let mockLogger;
  let mockLoggingCookieJar;
  let mockConfig;
  let mockDecodeKndctrCookie;

  beforeEach(() => {
    vi.clearAllMocks();

    mockLogger = {};
    mockLoggingCookieJar = {};

    mockConfig = {
      orgId: "TEST_ORG_ID@AdobeOrg",
    };

    mockDecodeKndctrCookie = vi.fn();
    createDecodeKndctrCookie.mockReturnValue(mockDecodeKndctrCookie);
  });

  describe("initialize", () => {
    it("should resolve the await identity promise immediatelly when ecid cookie is already present", async () => {
      mockDecodeKndctrCookie.mockReturnValue("integration-test-ecid");

      const identity = createIdentity({
        logger: mockLogger,
        loggingCookieJar: mockLoggingCookieJar,
        config: mockConfig,
      });

      identity.initialize();

      const awaitIdentityPromise = identity.awaitIdentity();
      await expect(awaitIdentityPromise).resolves.toBeUndefined();
    });
  });

  describe("setIdentityAcquired", () => {
    it("should resolve the await identity promise", async () => {
      const identity = createIdentity({
        logger: mockLogger,
        loggingCookieJar: mockLoggingCookieJar,
        config: mockConfig,
      });

      identity.initialize();

      await expect(
        Promise.race([
          identity.awaitIdentity(),
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Timeout")), 50);
          }),
        ]),
      ).rejects.toThrow("Timeout");

      const awaitIdentityPromise = identity.awaitIdentity();

      identity.setIdentityAcquired();
      await expect(awaitIdentityPromise).resolves.toBeUndefined();
    });
  });
});
