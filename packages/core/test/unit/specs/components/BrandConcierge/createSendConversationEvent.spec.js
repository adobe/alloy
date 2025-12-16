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
import createSendConversationEvent from "../../../../../src/components/BrandConcierge/createSendConversationEvent.js";
import flushPromiseChains from "../../../helpers/flushPromiseChains.js";

describe("createSendConversationEvent", () => {
  let mockDependencies;
  let mockEvent;

  beforeEach(() => {
    mockEvent = {
      mergeQuery: vi.fn(),
      mergeXdm: vi.fn(),
      finalize: vi.fn(),
      mergeMeta: vi.fn()
    };

    mockDependencies = {
      loggingCookieJar: {
        get: vi.fn(),
      },
      logger: {
        info: vi.fn(),
        error: vi.fn(),
      },
      eventManager: {
        createEvent: vi.fn().mockReturnValue(mockEvent)
      },
      consent: {
       current: vi.fn().mockReturnValue({state: "in"})
      },
      instanceName: "test-instance",
      sendEdgeNetworkRequest: vi.fn(),
      config: {
        orgId: "test-org-id",
        edgeConfigId: "test-edge-config-id",
        edgeDomain: "edge.adobedc.net",
        edgeBasePath: "/ee",
        datastreamId: "test-datastream"
      },
      buildEndpointUrl: vi.fn().mockReturnValue("https://test.adobe.io/conversation"),
      lifecycle: {
        onBeforeEvent: vi.fn().mockResolvedValue(undefined),
        onBeforeRequest: vi.fn(),
        onRequestFailure: vi.fn()
      },
      cookieTransfer: {
        cookiesToPayload: vi.fn(),
        responseToCookies: vi.fn()
      },
      createResponse: vi.fn(),
      sendConversationServiceRequest: vi.fn(),
      decodeKndctrCookie: vi.fn().mockReturnValue("test-ecid-123")
    };
  });

  it("creates a send conversation event function", () => {
    const sendConversationEvent = createSendConversationEvent(mockDependencies);

    expect(typeof sendConversationEvent).toBe("function");
  });

  it("handles message events", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      body: "mock-stream-body"
    };
    mockDependencies.sendConversationServiceRequest.mockResolvedValue(mockResponse);

    const sendConversationEvent = createSendConversationEvent(mockDependencies);
    const options = {
      message: "Hello, I need help with a product",
      onStreamResponse: vi.fn()
    };

    const resultPromise = sendConversationEvent(options);

    return flushPromiseChains().then(() => {
      expect(mockDependencies.eventManager.createEvent).toHaveBeenCalled();
      expect(mockEvent.mergeQuery).toHaveBeenCalledWith({
        conversation: {
          surfaces: [expect.any(String)],
          message: "Hello, I need help with a product",
          data: undefined
        }
      });
      expect(mockEvent.mergeXdm).toHaveBeenCalledWith({
        identityMap: {
          ECID: [
            {
              id: "test-ecid-123"
            }
          ]
        }
      });
      expect(mockDependencies.lifecycle.onBeforeEvent).toHaveBeenCalled();
      expect(mockDependencies.sendConversationServiceRequest).toHaveBeenCalled();
      return resultPromise;
    });
  });

  it("handles XDM events", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      body: "mock-stream-body"
    };
    mockDependencies.sendConversationServiceRequest.mockResolvedValue(mockResponse);

    const sendConversationEvent = createSendConversationEvent(mockDependencies);
    const options = {
      xdm: {
        interactionId: "test-interaction-id",
        conversationId: "test-conversation-id"
      },
      onStreamResponse: vi.fn()
    };

    const resultPromise = sendConversationEvent(options);

    return flushPromiseChains().then(() => {
      expect(mockDependencies.eventManager.createEvent).toHaveBeenCalled();
      expect(mockEvent.mergeXdm).toHaveBeenCalledWith({
        identityMap: {
          ECID: [
            {
              id: "test-ecid-123"
            }
          ]
        }
      });
      expect(mockEvent.mergeXdm).toHaveBeenCalledWith({
        interactionId: "test-interaction-id",
        conversationId: "test-conversation-id"
      });
      expect(mockDependencies.sendConversationServiceRequest).toHaveBeenCalled();
      return resultPromise;
    });
  });

  it("handles data events", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      body: "mock-stream-body"
    };
    mockDependencies.sendConversationServiceRequest.mockResolvedValue(mockResponse);

    const sendConversationEvent = createSendConversationEvent(mockDependencies);
    const options = {
      data: {
        type: "feedback",
        payload: {
          rating: 5,
          comment: "Great service!"
        }
      },
      onStreamResponse: vi.fn()
    };

    const resultPromise = sendConversationEvent(options);

    return flushPromiseChains().then(() => {
      expect(mockDependencies.eventManager.createEvent).toHaveBeenCalled();
      expect(mockEvent.mergeQuery).toHaveBeenCalledWith({
        conversation: {
          surfaces: [expect.any(String)],
          message: undefined,
          data: {
            type: "feedback",
            payload: {
              rating: 5,
              comment: "Great service!"
            }
          }
        }
      });
      expect(mockDependencies.sendConversationServiceRequest).toHaveBeenCalled();
      return resultPromise;
    });
  });

  it("handles stream timeout when no data is received within 10 seconds", async () => {
    vi.useFakeTimers();
    
    const mockResponse = {
      ok: true,
      status: 200,
      body: {
        // Simulate an async iterator that never yields data
        [Symbol.asyncIterator]: async function* () {
          // Never yield anything - simulates a hanging stream
          await new Promise(() => {}); // Promise that never resolves
        }
      }
    };
    mockDependencies.sendConversationServiceRequest.mockResolvedValue(mockResponse);

    const sendConversationEvent = createSendConversationEvent(mockDependencies);
    const onStreamResponse = vi.fn();
    const options = {
      message: "Hello, I need help",
      onStreamResponse
    };

    const resultPromise = sendConversationEvent(options);

    await flushPromiseChains();

    // Fast-forward time by 10 seconds to trigger the timeout
    vi.advanceTimersByTime(10000);
    return resultPromise.then(res => {
      // Verify that timeout error was logged
      expect(mockDependencies.logger.error).toHaveBeenCalledWith(
        "Stream error occurred",
        expect.objectContaining({
          message: "Stream timeout: No data received within 10 seconds"
        })
      );

      // Verify that onStreamResponse was called with the timeout error
      expect(onStreamResponse).toHaveBeenCalledWith({
        error: expect.objectContaining({
          message: "Stream timeout: No data received within 10 seconds"
        })
      });

      vi.useRealTimers();
    });
    // await flushPromiseChains();
  });
});