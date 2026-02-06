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

import { vi, describe, it, expect, beforeEach } from "vitest";
import createConsentAwareCookieManager from "../../../../../../src/components/Advertising/utils/createConsentAwareCookieManager.js";
import flushPromiseChains from "../../../../helpers/flushPromiseChains.js";

describe("Advertising::createConsentAwareCookieManager", () => {
  let baseCookieManager;

  beforeEach(() => {
    baseCookieManager = {
      getValue: vi.fn(),
      setValue: vi.fn().mockReturnValue(true),
    };
  });

  // ---------------------------------------------------------------------------
  // Consent already "in"
  // ---------------------------------------------------------------------------
  describe("when consent is already 'in'", () => {
    const createConsentIn = () => ({
      current: () => ({ state: "in", wasSet: true }),
      awaitConsent: () => Promise.resolve(),
    });

    it("should write cookies immediately", () => {
      const manager = createConsentAwareCookieManager({
        baseCookieManager,
        consent: createConsentIn(),
      });

      manager.setValue("myKey", "myValue", { expires: 10 });

      expect(baseCookieManager.setValue).toHaveBeenCalledWith(
        "myKey",
        "myValue",
        { expires: 10 },
      );
    });

    it("should read cookies from the base manager", () => {
      baseCookieManager.getValue.mockReturnValue("storedValue");

      const manager = createConsentAwareCookieManager({
        baseCookieManager,
        consent: createConsentIn(),
      });

      expect(manager.getValue("myKey")).toBe("storedValue");
      expect(baseCookieManager.getValue).toHaveBeenCalledWith("myKey");
    });

    it("should handle multiple writes immediately", () => {
      const manager = createConsentAwareCookieManager({
        baseCookieManager,
        consent: createConsentIn(),
      });

      manager.setValue("key1", "val1");
      manager.setValue("key2", "val2");
      manager.setValue("key3", "val3");

      expect(baseCookieManager.setValue).toHaveBeenCalledTimes(3);
    });
  });

  // ---------------------------------------------------------------------------
  // Consent already "out"
  // ---------------------------------------------------------------------------
  describe("when consent is already 'out'", () => {
    const createConsentOut = () => ({
      current: () => ({ state: "out", wasSet: true }),
      awaitConsent: () =>
        Promise.reject(new Error("The user declined consent.")),
    });

    it("should discard cookie writes silently", () => {
      const manager = createConsentAwareCookieManager({
        baseCookieManager,
        consent: createConsentOut(),
      });

      const result = manager.setValue("myKey", "myValue");

      expect(result).toBe(false);
      expect(baseCookieManager.setValue).not.toHaveBeenCalled();
    });

    it("should still allow reads from the base manager", () => {
      baseCookieManager.getValue.mockReturnValue("existingValue");

      const manager = createConsentAwareCookieManager({
        baseCookieManager,
        consent: createConsentOut(),
      });

      expect(manager.getValue("myKey")).toBe("existingValue");
    });
  });

  // ---------------------------------------------------------------------------
  // Consent "pending" → later granted
  // ---------------------------------------------------------------------------
  describe("when consent is 'pending' and later granted", () => {
    it("should queue writes and flush them when consent is granted", async () => {
      let resolveConsent;
      const consent = {
        current: () => ({ state: "pending", wasSet: false }),
        awaitConsent: () =>
          new Promise((resolve) => {
            resolveConsent = resolve;
          }),
      };

      const manager = createConsentAwareCookieManager({
        baseCookieManager,
        consent,
      });

      // Writes while pending should be queued, not written.
      manager.setValue("key1", "val1");
      manager.setValue("key2", "val2");
      expect(baseCookieManager.setValue).not.toHaveBeenCalled();

      // Grant consent.
      resolveConsent();
      await flushPromiseChains();

      // Now the queued writes should have been flushed.
      expect(baseCookieManager.setValue).toHaveBeenCalledTimes(2);
      expect(baseCookieManager.setValue).toHaveBeenCalledWith(
        "key1",
        "val1",
        undefined,
      );
      expect(baseCookieManager.setValue).toHaveBeenCalledWith(
        "key2",
        "val2",
        undefined,
      );
    });

    it("should return pending values from getValue before consent is granted", () => {
      let resolveConsent;
      const consent = {
        current: () => ({ state: "pending", wasSet: false }),
        awaitConsent: () =>
          new Promise((resolve) => {
            resolveConsent = resolve;
          }),
      };

      const manager = createConsentAwareCookieManager({
        baseCookieManager,
        consent,
      });

      manager.setValue("myKey", "myValue");

      // getValue should return the pending value.
      expect(manager.getValue("myKey")).toBe("myValue");
      // The base cookie manager should not have been called for this key write.
      expect(baseCookieManager.setValue).not.toHaveBeenCalled();

      // Clean up
      resolveConsent();
    });

    it("should write immediately after consent has been granted", async () => {
      let resolveConsent;
      const consent = {
        current: () => ({ state: "pending", wasSet: false }),
        awaitConsent: () =>
          new Promise((resolve) => {
            resolveConsent = resolve;
          }),
      };

      const manager = createConsentAwareCookieManager({
        baseCookieManager,
        consent,
      });

      // Grant consent.
      resolveConsent();
      await flushPromiseChains();

      // After consent, writes should go through immediately.
      manager.setValue("laterKey", "laterVal");
      expect(baseCookieManager.setValue).toHaveBeenCalledWith(
        "laterKey",
        "laterVal",
        undefined,
      );
    });

    it("should update pending value when same key is written twice", () => {
      let resolveConsent;
      const consent = {
        current: () => ({ state: "pending", wasSet: false }),
        awaitConsent: () =>
          new Promise((resolve) => {
            resolveConsent = resolve;
          }),
      };

      const manager = createConsentAwareCookieManager({
        baseCookieManager,
        consent,
      });

      manager.setValue("key1", "firstVal");
      manager.setValue("key1", "secondVal");

      // Last write wins.
      expect(manager.getValue("key1")).toBe("secondVal");

      // Clean up
      resolveConsent();
    });

    it("should fall through to base cookie manager for keys not in pending queue", () => {
      let resolveConsent;
      const consent = {
        current: () => ({ state: "pending", wasSet: false }),
        awaitConsent: () =>
          new Promise((resolve) => {
            resolveConsent = resolve;
          }),
      };

      baseCookieManager.getValue.mockReturnValue("fromCookie");

      const manager = createConsentAwareCookieManager({
        baseCookieManager,
        consent,
      });

      // No pending write for this key → should read from base.
      expect(manager.getValue("otherKey")).toBe("fromCookie");

      // Clean up
      resolveConsent();
    });
  });

  // ---------------------------------------------------------------------------
  // Consent "pending" → later denied
  // ---------------------------------------------------------------------------
  describe("when consent is 'pending' and later denied", () => {
    it("should discard queued writes when consent is denied", async () => {
      let rejectConsent;
      const consent = {
        current: () => ({ state: "pending", wasSet: false }),
        awaitConsent: () =>
          new Promise((_resolve, reject) => {
            rejectConsent = reject;
          }),
      };

      const manager = createConsentAwareCookieManager({
        baseCookieManager,
        consent,
      });

      manager.setValue("key1", "val1");
      manager.setValue("key2", "val2");
      expect(baseCookieManager.setValue).not.toHaveBeenCalled();

      // Deny consent.
      rejectConsent(new Error("The user declined consent."));
      await flushPromiseChains();

      // Queued writes should have been discarded.
      expect(baseCookieManager.setValue).not.toHaveBeenCalled();
    });

    it("should discard new writes after consent is denied", async () => {
      let rejectConsent;
      const consent = {
        current: () => ({ state: "pending", wasSet: false }),
        awaitConsent: () =>
          new Promise((_resolve, reject) => {
            rejectConsent = reject;
          }),
      };

      const manager = createConsentAwareCookieManager({
        baseCookieManager,
        consent,
      });

      rejectConsent(new Error("The user declined consent."));
      await flushPromiseChains();

      // Writes after denial should be discarded.
      const result = manager.setValue("lateKey", "lateVal");
      expect(result).toBe(false);
      expect(baseCookieManager.setValue).not.toHaveBeenCalled();
    });
  });
});
