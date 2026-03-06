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

describe("Advertising::createAdConversionHandler", () => {
  let sendEdgeNetworkRequest;
  let consent;
  let logger;
  let handler;
  let event;
  let request;

  beforeEach(() => {
    sendEdgeNetworkRequest = vi.fn();

    consent = {
      awaitConsent: vi.fn().mockResolvedValue(),
    };

    logger = {
      error: vi.fn(),
    };

    event = {
      finalize: vi.fn(),
    };

    request = { id: "request" };

    const createPayload = vi.fn(() => ({
      addEvent: vi.fn(),
    }));
    const createRequest = vi.fn(() => {
      return request;
    });

    handler = createAdConversionHandler({
      sendEdgeNetworkRequest,
      consent,
      createDataCollectionRequest: createRequest,
      createDataCollectionRequestPayload: createPayload,
      logger,
    });
  });

  describe("trackAdConversion", () => {
    it("returns success and coordinates collaborators, with consent", async () => {
      sendEdgeNetworkRequest.mockResolvedValue({ status: "success" });

      const result = await handler.trackAdConversion({ event });

      expect(event.finalize).toHaveBeenCalledTimes(1);
      expect(consent.awaitConsent).toHaveBeenCalled();
      expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({ request });

      expect(result).toEqual({ success: true });
    });

    it("does not send when consent is rejected", async () => {
      const error = new Error("Consent denied");
      consent.awaitConsent.mockRejectedValueOnce(error);

      await expect(handler.trackAdConversion({ event })).rejects.toThrow();
      expect(sendEdgeNetworkRequest).not.toHaveBeenCalled();
    });

    it("logs and rethrows network failures", async () => {
      const error = new Error("Network failed");
      sendEdgeNetworkRequest.mockRejectedValueOnce(error);

      await expect(handler.trackAdConversion({ event })).rejects.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
