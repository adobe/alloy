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

// Mock dependencies
vi.mock(
  "../../../../../../src/utils/request/createDataCollectionRequestPayload.js",
);
vi.mock("../../../../../../src/utils/request/createDataCollectionRequest.js");

describe("Advertising::createAdConversionHandler", () => {
  let eventManager;
  let sendEdgeNetworkRequest;
  let consent;
  let logger;
  let handler;
  let createDataCollectionRequestPayload;
  let createDataCollectionRequest;

  beforeEach(async () => {
    eventManager = {
      createEvent: vi.fn(),
    };

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

    // Mock the request creation functions
    const mockCreateDataCollectionRequestPayload = await import(
      "../../../../../../src/utils/request/createDataCollectionRequestPayload.js"
    );
    const mockCreateDataCollectionRequest = await import(
      "../../../../../../src/utils/request/createDataCollectionRequest.js"
    );

    createDataCollectionRequestPayload =
      mockCreateDataCollectionRequestPayload.default;
    createDataCollectionRequest = mockCreateDataCollectionRequest.default;

    createDataCollectionRequestPayload.mockReset();
    createDataCollectionRequest.mockReset();

    handler = createAdConversionHandler({
      sendEdgeNetworkRequest,
      consent,
      createDataCollectionRequest,
      createDataCollectionRequestPayload,
      logger,
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
          eventManager,
          sendEdgeNetworkRequest,
          consent,
          logger,
        });
      }).not.toThrow();
    });
  });
});
