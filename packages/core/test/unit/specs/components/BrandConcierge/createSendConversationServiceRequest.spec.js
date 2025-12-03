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
import createSendConversationServiceRequest from "../../../../../src/components/BrandConcierge/createSendConversationServiceRequest.js";
import flushPromiseChains from "../../../helpers/flushPromiseChains.js";

describe("createSendConversationServiceRequest", () => {
  let mockDependencies;
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockResponse = {
      ok: true,
      status: 200,
      body: {
        getReader: vi.fn().mockReturnValue({
          read: vi.fn().mockResolvedValue({ done: true, value: undefined })
        })
      }
    };

    mockDependencies = {
      logger: {
        logOnBeforeNetworkRequest: vi.fn(),
        logOnNetworkError: vi.fn()
      },
      fetch: vi.fn().mockResolvedValue(mockResponse)
    };

    mockRequest = {
      getPayload: vi.fn().mockReturnValue({ message: "test message" })
    };
  });

  it("creates a send conversation service request function", () => {
    const sendConversationServiceRequest = createSendConversationServiceRequest(mockDependencies);

    expect(typeof sendConversationServiceRequest).toBe("function");
  });

  it("makes fetch request with correct parameters", async () => {
    const sendConversationServiceRequest = createSendConversationServiceRequest(mockDependencies);
    const requestId = "test-request-id";
    const url = "https://test.adobe.io/conversation";

    await sendConversationServiceRequest({
      requestId,
      url,
      request: mockRequest,
      streamingEnabled: true
    });

    expect(mockDependencies.fetch).toHaveBeenCalledWith(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        "Accept": "text/event-stream"
      },
      body: JSON.stringify({ message: "test message" })
    });
  });

  it("uses correct headers for non-streaming requests", async () => {
    const sendConversationServiceRequest = createSendConversationServiceRequest(mockDependencies);
    const requestId = "test-request-id";
    const url = "https://test.adobe.io/conversation";

    await sendConversationServiceRequest({
      requestId,
      url,
      request: mockRequest,
      streamingEnabled: false
    });

    expect(mockDependencies.fetch).toHaveBeenCalledWith(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        "Accept": "text/plain"
      },
      body: JSON.stringify({ message: "test message" })
    });
  });

  it("logs network request before sending", async () => {
    const sendConversationServiceRequest = createSendConversationServiceRequest(mockDependencies);
    const requestId = "test-request-id";
    const url = "https://test.adobe.io/conversation";

    await sendConversationServiceRequest({
      requestId,
      url,
      request: mockRequest
    });

    expect(mockDependencies.logger.logOnBeforeNetworkRequest).toHaveBeenCalledWith({
      url,
      requestId,
      payload: { message: "test message" }
    });
  });

  it("implements retry logic on failure", async () => {
    // Use fake timers to speed up the test
    vi.useFakeTimers();

    const failedResponse = {
      ok: false,
      status: 500
    };

    mockDependencies.fetch
      .mockResolvedValueOnce(failedResponse)
      .mockResolvedValueOnce(failedResponse)
      .mockResolvedValueOnce(mockResponse);

    const sendConversationServiceRequest = createSendConversationServiceRequest(mockDependencies);
    const requestId = "test-request-id";
    const url = "https://test.adobe.io/conversation";

    const resultPromise = sendConversationServiceRequest({
      requestId,
      url,
      request: mockRequest
    });

    // Fast-forward through all the timers (2s + 3s delays)
    await vi.runAllTimersAsync();

    await flushPromiseChains();

    expect(mockDependencies.fetch).toHaveBeenCalledTimes(3);

    vi.useRealTimers();

    const result = await resultPromise;
    expect(result).toBe(mockResponse);
  });

  it("logs network errors during retries", async () => {
    vi.useFakeTimers();

    const failedResponse = {
      ok: false,
      status: 500
    };

    mockDependencies.fetch
      .mockResolvedValueOnce(failedResponse)
      .mockResolvedValueOnce(mockResponse);

    const sendConversationServiceRequest = createSendConversationServiceRequest(mockDependencies);
    const requestId = "test-request-id";
    const url = "https://test.adobe.io/conversation";

    const resultPromise = sendConversationServiceRequest({
      requestId,
      url,
      request: mockRequest
    });

    await vi.runAllTimersAsync();
    await flushPromiseChains();

    expect(mockDependencies.logger.logOnNetworkError).toHaveBeenCalledWith({
      requestId,
      url,
      payload: { message: "test message" },
      error: expect.any(Error)
    });

    vi.useRealTimers();
    await resultPromise;
  });

  it("throws error after all retries are exhausted", async () => {
    vi.useFakeTimers();

    const failedResponse = {
      ok: false,
      status: 500
    };

    mockDependencies.fetch.mockResolvedValue(failedResponse);

    const sendConversationServiceRequest = createSendConversationServiceRequest(mockDependencies);
    const requestId = "test-request-id";
    const url = "https://test.adobe.io/conversation";

    const resultPromise = sendConversationServiceRequest({
      requestId,
      url,
      request: mockRequest
    }).catch(error => error); // Catch the error to prevent unhandled rejection

    // Process timers and promises
    await vi.runAllTimersAsync();
    await flushPromiseChains();

    const result = await resultPromise;

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toMatch("Network request failed after all retries");
    expect(mockDependencies.fetch).toHaveBeenCalledTimes(4); // 1 initial + 3 retries

    vi.useRealTimers();
  });
});