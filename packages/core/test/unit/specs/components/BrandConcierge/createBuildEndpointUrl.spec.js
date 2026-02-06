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
import createBuildEndpointUrl from "../../../../../src/components/BrandConcierge/createBuildEndpointUrl.js";

describe("createBuildEndpointUrl", () => {
  let queryStringMock;
  let buildEndpointUrl;
  let mockRequest;

  beforeEach(() => {
    queryStringMock = {
      stringify: vi.fn()
    };

    mockRequest = {
      getRequestParams: vi.fn().mockReturnValue({
        existingParam: "value"
      }),
      getId: vi.fn().mockReturnValue("test-request-id"),
      getEdgeSubPath: vi.fn().mockReturnValue("/v1/conversation"),
      getAction: vi.fn().mockReturnValue("chat"),
      getDatastreamIdOverride: vi.fn().mockReturnValue(null)
    };

    buildEndpointUrl = createBuildEndpointUrl({ queryString: queryStringMock });
  });

  it("creates a function to build endpoint URLs", () => {
    expect(typeof buildEndpointUrl).toBe("function");
  });

  it("builds URL with request parameters", () => {
    queryStringMock.stringify.mockReturnValue("existingParam=value&requestId=test-request-id&configId=test-datastream");

    const result = buildEndpointUrl({
      edgeDomain: "edge.adobedc.net",
      request: mockRequest,
      datastreamId: "test-datastream"
    });

    expect(mockRequest.getRequestParams).toHaveBeenCalled();
    expect(mockRequest.getId).toHaveBeenCalled();
    expect(mockRequest.getEdgeSubPath).toHaveBeenCalled();
    expect(mockRequest.getAction).toHaveBeenCalled();
    expect(queryStringMock.stringify).toHaveBeenCalledWith({
      existingParam: "value",
      requestId: "test-request-id",
      configId: "test-datastream"
    });
    expect(result).toBe("https://edge.adobedc.net/v1/conversation/chat?existingParam=value&requestId=test-request-id&configId=test-datastream");
  });

  it("uses datastream override when available", () => {
    mockRequest.getDatastreamIdOverride.mockReturnValue("override-datastream");
    queryStringMock.stringify.mockReturnValue("existingParam=value&requestId=test-request-id&configId=override-datastream");

    const result = buildEndpointUrl({
      edgeDomain: "edge.adobedc.net",
      request: mockRequest,
      datastreamId: "default-datastream"
    });

    expect(mockRequest.getDatastreamIdOverride).toHaveBeenCalled();
    expect(queryStringMock.stringify).toHaveBeenCalledWith({
      existingParam: "value",
      requestId: "test-request-id",
      configId: "override-datastream"
    });
    expect(result).toBe("https://edge.adobedc.net/v1/conversation/chat?existingParam=value&requestId=test-request-id&configId=override-datastream");
  });

  it("handles empty request parameters", () => {
    mockRequest.getRequestParams.mockReturnValue({});
    queryStringMock.stringify.mockReturnValue("requestId=test-request-id&configId=test-datastream");

    const result = buildEndpointUrl({
      edgeDomain: "edge.adobedc.net",
      request: mockRequest,
      datastreamId: "test-datastream"
    });

    expect(queryStringMock.stringify).toHaveBeenCalledWith({
      requestId: "test-request-id",
      configId: "test-datastream"
    });
    expect(result).toBe("https://edge.adobedc.net/v1/conversation/chat?requestId=test-request-id&configId=test-datastream");
  });
});