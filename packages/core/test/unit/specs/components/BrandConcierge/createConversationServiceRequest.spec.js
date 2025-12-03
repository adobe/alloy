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
import { describe, it, expect, beforeEach } from "vitest";
import describeRequest from "../../../helpers/describeRequest.js";
import createConversationServiceRequest from "../../../../../src/components/BrandConcierge/createConversationServiceRequest.js";

describe("createConversationServiceRequest", () => {
  let mockPayload;
  let mockSessionId;

  beforeEach(() => {
    mockPayload = {
      message: "test message"
    };
    mockSessionId = "test-session-123";
  });

  // Test the request factory function that createConversationServiceRequest returns
  const createRequestFactory = (options = {}) => {
    return createConversationServiceRequest({
      payload: mockPayload,
      sessionId: mockSessionId,
      ...options
    });
  };

  describeRequest(createRequestFactory);

  it("creates a request with proper payload", () => {
    const request = createConversationServiceRequest({
      payload: mockPayload,
      sessionId: mockSessionId
    });

    expect(request).toBeDefined();
    expect(typeof request.getPayload).toBe("function");
    expect(request.getPayload()).toEqual(mockPayload);
  });

  it("provides the appropriate action", () => {
    const request = createConversationServiceRequest({
      payload: mockPayload,
      sessionId: mockSessionId
    });

    expect(request.getAction()).toBe("conversations");
  });

  it("allows custom action", () => {
    const request = createConversationServiceRequest({
      payload: mockPayload,
      action: "custom-action",
      sessionId: mockSessionId
    });

    expect(request.getAction()).toBe("custom-action");
  });

  it("never uses sendBeacon", () => {
    const request = createConversationServiceRequest({
      payload: mockPayload,
      sessionId: mockSessionId
    });

    expect(request.getUseSendBeacon()).toBe(false);
  });

  it("includes sessionId in request parameters", () => {
    const request = createConversationServiceRequest({
      payload: mockPayload,
      sessionId: mockSessionId
    });

    expect(request.getRequestParams()).toEqual({
      sessionId: mockSessionId
    });
  });

  it("uses correct edge subpath", () => {
    const request = createConversationServiceRequest({
      payload: mockPayload,
      sessionId: mockSessionId
    });

    expect(request.getEdgeSubPath()).toBe("/brand-concierge");
  });
});