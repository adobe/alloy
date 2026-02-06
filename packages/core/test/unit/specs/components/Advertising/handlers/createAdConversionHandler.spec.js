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

import { vi, beforeEach, describe, it, expect } from "vitest";
import createAdConversionHandler from "../../../../../../src/components/Advertising/handlers/createAdConversionHandler.js";
import {
  LAST_CLICK_COOKIE_KEY,
} from "../../../../../../src/components/Advertising/constants/index.js";

// Mock network operations to prevent real network calls
vi.mock("fetch", () => vi.fn());
Object.defineProperty(globalThis, "fetch", {
  value: vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    }),
  ),
  writable: true,
});

describe("Advertising::createAdConversionHandler", () => {
  let sendEdgeNetworkRequest;
  let consent;
  let logger;
  let cookieManager;
  let handler;
  let createDataCollectionRequestPayload;
  let createDataCollectionRequest;

  beforeEach(() => {
    sendEdgeNetworkRequest = vi.fn();

    consent = {
      awaitConsent: vi.fn().mockResolvedValue(),
    };

    logger = {
      info: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
    };

    cookieManager = {
      setValue: vi.fn(),
      getValue: vi.fn(),
    };

    createDataCollectionRequestPayload = vi.fn();
    createDataCollectionRequest = vi.fn();

    handler = createAdConversionHandler({
      sendEdgeNetworkRequest,
      consent,
      createDataCollectionRequest,
      createDataCollectionRequestPayload,
      logger,
      cookieManager,
    });
  });

  describe("trackAdConversion", () => {
    it("should create and send conversion request", async () => {
      const mockEvent = {
        finalize: vi.fn(),
      };

      const mockPayload = {
        addEvent: vi.fn(),
      };

      const mockRequest = {
        body: { events: [] },
        getUseIdThirdPartyDomain: vi.fn().mockReturnValue(false),
      };

      createDataCollectionRequestPayload.mockReturnValue(mockPayload);
      createDataCollectionRequest.mockReturnValue(mockRequest);
      sendEdgeNetworkRequest.mockResolvedValue({ status: "success" });

      const result = await handler.trackAdConversion({ event: mockEvent });

      expect(createDataCollectionRequestPayload).toHaveBeenCalled();
      expect(mockPayload.addEvent).toHaveBeenCalledWith(mockEvent);
      expect(mockEvent.finalize).toHaveBeenCalled();
      expect(createDataCollectionRequest).toHaveBeenCalledWith({
        payload: mockPayload,
      });
      expect(consent.awaitConsent).toHaveBeenCalled();
      expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
        request: mockRequest,
      });
      expect(result).toEqual({ success: true });
    });

    it("should handle missing event parameter", () => {
      const mockPayload = {
        addEvent: vi.fn(),
      };
      createDataCollectionRequestPayload.mockReturnValue(mockPayload);

      expect(() => {
        handler.trackAdConversion({ event: undefined });
      }).toThrow("Cannot read properties of undefined (reading 'finalize')");
    });

    it("should handle consent rejection", async () => {
      const mockEvent = {
        finalize: vi.fn(),
      };

      const mockPayload = {
        addEvent: vi.fn(),
      };

      createDataCollectionRequestPayload.mockReturnValue(mockPayload);
      createDataCollectionRequest.mockReturnValue({});

      const consentError = new Error("Consent denied");
      consent.awaitConsent.mockRejectedValue(consentError);

      await expect(
        handler.trackAdConversion({ event: mockEvent }),
      ).rejects.toThrow("Consent denied");
    });

    it("should handle network request failure", async () => {
      const mockEvent = {
        finalize: vi.fn(),
      };

      const mockPayload = {
        addEvent: vi.fn(),
      };

      const mockRequest = {
        body: { events: [] },
        getUseIdThirdPartyDomain: vi.fn().mockReturnValue(false),
      };

      createDataCollectionRequestPayload.mockReturnValue(mockPayload);
      createDataCollectionRequest.mockReturnValue(mockRequest);

      const networkError = new Error("Network failed");
      sendEdgeNetworkRequest.mockRejectedValue(networkError);

      await expect(
        handler.trackAdConversion({ event: mockEvent }),
      ).rejects.toThrow("Network failed");
    });

    it("should handle options parameter", async () => {
      const mockEvent = {
        finalize: vi.fn(),
      };

      const mockPayload = {
        addEvent: vi.fn(),
      };

      const mockRequest = {
        body: { events: [] },
        getUseIdThirdPartyDomain: vi.fn().mockReturnValue(false),
      };

      createDataCollectionRequestPayload.mockReturnValue(mockPayload);
      createDataCollectionRequest.mockReturnValue(mockRequest);
      sendEdgeNetworkRequest.mockResolvedValue({ status: "success" });

      const options = { customOption: "value" };
      await handler.trackAdConversion({ event: mockEvent, options });

      expect(createDataCollectionRequestPayload).toHaveBeenCalled();
    });
  });

  describe("click cookie consent gating", () => {
    let mockEvent;
    let mockPayload;
    let mockRequest;

    beforeEach(() => {
      mockEvent = { finalize: vi.fn() };
      mockPayload = { addEvent: vi.fn() };
      mockRequest = { body: { events: [] } };

      createDataCollectionRequestPayload.mockReturnValue(mockPayload);
      createDataCollectionRequest.mockReturnValue(mockRequest);
      sendEdgeNetworkRequest.mockResolvedValue({ status: "success" });
    });

    it("should write LAST_CLICK_COOKIE_KEY after consent when skwcid and efid are provided", async () => {
      await handler.trackAdConversion({
        event: mockEvent,
        skwcid: "AL!12345",
        efid: "test-efid",
      });

      expect(consent.awaitConsent).toHaveBeenCalled();
      expect(cookieManager.setValue).toHaveBeenCalledWith(
        LAST_CLICK_COOKIE_KEY,
        expect.objectContaining({
          click_time: expect.any(Number),
          skwcid: "AL!12345",
          efid: "test-efid",
        }),
      );
    });

    it("should write LAST_CLICK_COOKIE_KEY after consent when only skwcid is provided", async () => {
      await handler.trackAdConversion({
        event: mockEvent,
        skwcid: "AL!12345",
      });

      expect(cookieManager.setValue).toHaveBeenCalledWith(
        LAST_CLICK_COOKIE_KEY,
        expect.objectContaining({
          click_time: expect.any(Number),
          skwcid: "AL!12345",
        }),
      );
    });

    it("should write LAST_CLICK_COOKIE_KEY after consent when only efid is provided", async () => {
      await handler.trackAdConversion({
        event: mockEvent,
        efid: "test-efid",
      });

      expect(cookieManager.setValue).toHaveBeenCalledWith(
        LAST_CLICK_COOKIE_KEY,
        expect.objectContaining({
          click_time: expect.any(Number),
          efid: "test-efid",
        }),
      );
    });

    it("should NOT write LAST_CLICK_COOKIE_KEY when neither skwcid nor efid are provided", async () => {
      await handler.trackAdConversion({ event: mockEvent });

      expect(cookieManager.setValue).not.toHaveBeenCalled();
    });

    it("should NOT write LAST_CLICK_COOKIE_KEY when consent is denied", async () => {
      consent.awaitConsent.mockRejectedValue(new Error("Consent denied"));

      await expect(
        handler.trackAdConversion({
          event: mockEvent,
          skwcid: "AL!12345",
          efid: "test-efid",
        }),
      ).rejects.toThrow("Consent denied");

      expect(cookieManager.setValue).not.toHaveBeenCalled();
    });

    it("should write cookie BEFORE sending network request", async () => {
      const callOrder = [];

      cookieManager.setValue.mockImplementation(() => {
        callOrder.push("cookie_write");
      });
      sendEdgeNetworkRequest.mockImplementation(() => {
        callOrder.push("network_request");
        return Promise.resolve({ status: "success" });
      });

      await handler.trackAdConversion({
        event: mockEvent,
        skwcid: "AL!12345",
        efid: "test-efid",
      });

      expect(callOrder).toEqual(["cookie_write", "network_request"]);
    });
  });

  describe("error handling", () => {
    it("should handle payload creation errors", () => {
      const mockEvent = {
        finalize: vi.fn(),
      };

      createDataCollectionRequestPayload.mockImplementation(() => {
        throw new Error("Payload creation failed");
      });

      expect(() => {
        handler.trackAdConversion({ event: mockEvent });
      }).toThrow("Payload creation failed");
    });

    it("should handle request creation errors", () => {
      const mockEvent = {
        finalize: vi.fn(),
      };

      const mockPayload = {
        addEvent: vi.fn(),
      };

      createDataCollectionRequestPayload.mockReturnValue(mockPayload);
      createDataCollectionRequest.mockImplementation(() => {
        throw new Error("Request creation failed");
      });

      expect(() => {
        handler.trackAdConversion({ event: mockEvent });
      }).toThrow("Request creation failed");
    });

    it("should handle event finalization errors", () => {
      const mockEvent = {
        finalize: vi.fn().mockImplementation(() => {
          throw new Error("Finalization failed");
        }),
      };

      const mockPayload = {
        addEvent: vi.fn(),
      };

      createDataCollectionRequestPayload.mockReturnValue(mockPayload);

      expect(() => {
        handler.trackAdConversion({ event: mockEvent });
      }).toThrow("Finalization failed");
    });
  });

  describe("handler structure", () => {
    it("should return object with trackAdConversion method", () => {
      expect(handler).toHaveProperty("trackAdConversion");
      expect(typeof handler.trackAdConversion).toBe("function");
    });

    it("should create handler with all required dependencies", () => {
      expect(() => {
        createAdConversionHandler({
          sendEdgeNetworkRequest,
          consent,
          createDataCollectionRequest,
          createDataCollectionRequestPayload,
          logger,
          cookieManager,
        });
      }).not.toThrow();
    });
  });
});
