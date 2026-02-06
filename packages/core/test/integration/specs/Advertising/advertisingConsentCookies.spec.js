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

/**
 * Integration tests for advertising cookie consent gating.
 *
 * These tests wire the real consent state machine, the real consent manager,
 * and the real consent-aware cookie manager together and verify that
 * advertising cookies are only written after consent is granted.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import createConsentStateMachine from "../../../../src/core/consent/createConsentStateMachine.js";
import createConsent from "../../../../src/core/consent/createConsent.js";
import createConsentAwareCookieManager from "../../../../src/components/Advertising/utils/createConsentAwareCookieManager.js";
import handleClickThrough from "../../../../src/components/Advertising/handlers/clickThroughHandler.js";
import {
  LAST_CLICK_COOKIE_KEY,
  LAST_CONVERSION_TIME_KEY,
  LAST_CONVERSION_TIME_KEY_EXPIRES,
} from "../../../../src/components/Advertising/constants/index.js";
import { IN, OUT, PENDING } from "../../../../src/constants/consentStatus.js";
import { GENERAL } from "../../../../src/constants/consentPurpose.js";

const flushPromises = () => {
  let p;
  for (let i = 0; i < 10; i += 1) {
    p = p ? p.then(() => Promise.resolve()) : Promise.resolve();
  }
  return p;
};

describe("Advertising consent cookie integration", () => {
  let logger;
  let baseCookieManager;
  let generalConsentState;
  let consent;

  beforeEach(() => {
    logger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    baseCookieManager = {
      getValue: vi.fn().mockReturnValue(null),
      setValue: vi.fn().mockReturnValue(true),
    };

    generalConsentState = createConsentStateMachine({ logger });
    consent = createConsent({ generalConsentState, logger });
  });

  // -------------------------------------------------------------------------
  // defaultConsent = "in"
  // -------------------------------------------------------------------------
  describe("when defaultConsent is 'in'", () => {
    beforeEach(() => {
      consent.initializeConsent({ [GENERAL]: IN }, {});
    });

    it("should write the advertising cookie immediately", () => {
      const cookieManager = createConsentAwareCookieManager({
        baseCookieManager,
        consent,
      });

      cookieManager.setValue(LAST_CLICK_COOKIE_KEY, {
        click_time: 123,
        skwcid: "AL!test",
        efid: "ef-test",
      });

      expect(baseCookieManager.setValue).toHaveBeenCalledTimes(1);
      expect(baseCookieManager.setValue).toHaveBeenCalledWith(
        LAST_CLICK_COOKIE_KEY,
        { click_time: 123, skwcid: "AL!test", efid: "ef-test" },
        undefined,
      );
    });
  });

  // -------------------------------------------------------------------------
  // defaultConsent = "out"
  // -------------------------------------------------------------------------
  describe("when defaultConsent is 'out'", () => {
    beforeEach(() => {
      consent.initializeConsent({ [GENERAL]: OUT }, {});
    });

    it("should discard advertising cookie writes", () => {
      const cookieManager = createConsentAwareCookieManager({
        baseCookieManager,
        consent,
      });

      const result = cookieManager.setValue(LAST_CLICK_COOKIE_KEY, {
        click_time: 123,
      });

      expect(result).toBe(false);
      expect(baseCookieManager.setValue).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // defaultConsent = "pending" → granted later
  // -------------------------------------------------------------------------
  describe("when defaultConsent is 'pending' and consent is later granted", () => {
    beforeEach(() => {
      consent.initializeConsent({ [GENERAL]: PENDING }, {});
    });

    it("should queue advertising cookie writes and flush on consent grant", async () => {
      const cookieManager = createConsentAwareCookieManager({
        baseCookieManager,
        consent,
      });

      // Write while consent is pending – should NOT hit the base manager.
      cookieManager.setValue(LAST_CLICK_COOKIE_KEY, {
        click_time: 100,
        skwcid: "AL!queued",
        efid: "ef-queued",
      });
      cookieManager.setValue(LAST_CONVERSION_TIME_KEY, 200);
      cookieManager.setValue(
        LAST_CONVERSION_TIME_KEY_EXPIRES,
        Date.now() + 91 * 24 * 60 * 60 * 1000,
      );

      expect(baseCookieManager.setValue).not.toHaveBeenCalled();

      // Simulate user granting consent.
      consent.setConsent({ [GENERAL]: IN });
      await flushPromises();

      // All three queued writes should now be flushed.
      expect(baseCookieManager.setValue).toHaveBeenCalledTimes(3);
      expect(baseCookieManager.setValue).toHaveBeenCalledWith(
        LAST_CLICK_COOKIE_KEY,
        { click_time: 100, skwcid: "AL!queued", efid: "ef-queued" },
        undefined,
      );
      expect(baseCookieManager.setValue).toHaveBeenCalledWith(
        LAST_CONVERSION_TIME_KEY,
        200,
        undefined,
      );
    });

    it("should return pending values from getValue before consent is resolved", () => {
      const cookieManager = createConsentAwareCookieManager({
        baseCookieManager,
        consent,
      });

      cookieManager.setValue(LAST_CLICK_COOKIE_KEY, {
        click_time: 555,
        skwcid: "AL!pending-read",
      });

      // Read should return the pending value, not the base cookie.
      expect(cookieManager.getValue(LAST_CLICK_COOKIE_KEY)).toEqual({
        click_time: 555,
        skwcid: "AL!pending-read",
      });
      expect(baseCookieManager.setValue).not.toHaveBeenCalled();
    });

    it("should allow immediate writes after consent transitions to 'in'", async () => {
      const cookieManager = createConsentAwareCookieManager({
        baseCookieManager,
        consent,
      });

      consent.setConsent({ [GENERAL]: IN });
      await flushPromises();

      // New writes after consent should go directly to the base manager.
      cookieManager.setValue("postConsentKey", "postConsentVal");
      expect(baseCookieManager.setValue).toHaveBeenCalledWith(
        "postConsentKey",
        "postConsentVal",
        undefined,
      );
    });
  });

  // -------------------------------------------------------------------------
  // defaultConsent = "pending" → denied later
  // -------------------------------------------------------------------------
  describe("when defaultConsent is 'pending' and consent is later denied", () => {
    beforeEach(() => {
      consent.initializeConsent({ [GENERAL]: PENDING }, {});
    });

    it("should discard all queued writes when consent is denied", async () => {
      const cookieManager = createConsentAwareCookieManager({
        baseCookieManager,
        consent,
      });

      cookieManager.setValue(LAST_CLICK_COOKIE_KEY, { click_time: 999 });
      cookieManager.setValue(LAST_CONVERSION_TIME_KEY, 999);

      expect(baseCookieManager.setValue).not.toHaveBeenCalled();

      // Deny consent.
      consent.setConsent({ [GENERAL]: OUT });
      await flushPromises();

      // Queued writes must never reach the base manager.
      expect(baseCookieManager.setValue).not.toHaveBeenCalled();
    });

    it("should silently discard writes made after consent is denied", async () => {
      const cookieManager = createConsentAwareCookieManager({
        baseCookieManager,
        consent,
      });

      consent.setConsent({ [GENERAL]: OUT });
      await flushPromises();

      const result = cookieManager.setValue("afterDenial", "anything");
      expect(result).toBe(false);
      expect(baseCookieManager.setValue).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // End-to-end: clickThroughHandler + consent cookie manager
  // -------------------------------------------------------------------------
  describe("clickThroughHandler with consent-gated cookie manager", () => {
    it("should NOT write cookies during pending consent, then flush when granted", async () => {
      consent.initializeConsent({ [GENERAL]: PENDING }, {});

      const cookieManager = createConsentAwareCookieManager({
        baseCookieManager,
        consent,
      });

      const mockEvent = {
        setUserXdm: vi.fn(),
        finalize: vi.fn(),
      };
      const eventManager = { createEvent: vi.fn().mockReturnValue(mockEvent) };
      const adConversionHandler = {
        trackAdConversion: vi.fn().mockImplementation(() => {
          // trackAdConversion itself awaits consent — simulate that
          return consent.awaitConsent().then(() => ({ success: true }));
        }),
      };

      // Start click-through handler (will block on consent inside
      // trackAdConversion).
      const clickPromise = handleClickThrough({
        eventManager,
        cookieManager,
        adConversionHandler,
        logger,
        skwcid: "AL!integration-test",
        efid: "ef-integration",
      });

      // While consent is pending, the handler has already called
      // cookieManager.setValue — but those writes should be queued.
      await flushPromises();
      expect(baseCookieManager.setValue).not.toHaveBeenCalled();

      // Grant consent.
      consent.setConsent({ [GENERAL]: IN });
      await flushPromises();

      // Wait for the handler to complete.
      const result = await clickPromise;

      // The queued cookie writes should have been flushed.
      expect(baseCookieManager.setValue).toHaveBeenCalledWith(
        LAST_CLICK_COOKIE_KEY,
        expect.objectContaining({
          skwcid: "AL!integration-test",
          efid: "ef-integration",
        }),
        undefined,
      );
      expect(baseCookieManager.setValue).toHaveBeenCalledWith(
        LAST_CONVERSION_TIME_KEY,
        undefined,
        undefined,
      );
      expect(baseCookieManager.setValue).toHaveBeenCalledWith(
        LAST_CONVERSION_TIME_KEY_EXPIRES,
        expect.any(Number),
        undefined,
      );
      expect(result).toEqual({ success: true });
    });

    it("should NOT write cookies when consent is denied", async () => {
      consent.initializeConsent({ [GENERAL]: PENDING }, {});

      const cookieManager = createConsentAwareCookieManager({
        baseCookieManager,
        consent,
      });

      const mockEvent = {
        setUserXdm: vi.fn(),
        finalize: vi.fn(),
      };
      const eventManager = { createEvent: vi.fn().mockReturnValue(mockEvent) };
      const adConversionHandler = {
        trackAdConversion: vi.fn().mockImplementation(() => {
          return consent.awaitConsent().then(() => ({ success: true }));
        }),
      };

      const clickPromise = handleClickThrough({
        eventManager,
        cookieManager,
        adConversionHandler,
        logger,
        skwcid: "AL!denied-test",
        efid: "ef-denied",
      });

      await flushPromises();
      expect(baseCookieManager.setValue).not.toHaveBeenCalled();

      // Deny consent.
      consent.setConsent({ [GENERAL]: OUT });
      await flushPromises();

      // The handler should reject because trackAdConversion rejects.
      await expect(clickPromise).rejects.toThrow();

      // No cookies should have been written.
      expect(baseCookieManager.setValue).not.toHaveBeenCalled();
    });
  });
});
