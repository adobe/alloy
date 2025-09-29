/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { vi, beforeEach, describe, it, expect } from "vitest";
import injectSendEdgeNetworkRequest from "../../../../../src/core/edgeNetwork/injectSendEdgeNetworkRequest.js";
import createConfig from "../../../../../src/core/config/createConfig.js";
import { defer } from "../../../../../src/utils/index.js";
import flushPromiseChains from "../../../helpers/flushPromiseChains.js";
import assertFunctionCallOrder from "../../../helpers/assertFunctionCallOrder.js";

describe("injectSendEdgeNetworkRequest", () => {
  let config;
  let logger;
  let lifecycle;
  let cookieTransfer;
  let networkResult;
  let sendNetworkRequest;
  let response;
  let createResponse;
  let processWarningsAndErrors;
  let getLocationHint;
  let getAssuranceValidationTokenParams;
  let sendEdgeNetworkRequest;
  let payload;
  let request;

  // Helper for testing handling of network request failures, particularly
  // their interplay with lifecycle hooks.
  const testRequestFailureHandling = ({
    runOnRequestFailureCallbacks,
    assertLifecycleCall,
  }) => {
    const error = new Error("no connection");
    sendNetworkRequest.mockReturnValue(Promise.reject(error));
    const errorHandler = vi.fn();
    sendEdgeNetworkRequest({
      request,
      runOnRequestFailureCallbacks,
    }).catch(errorHandler);
    return flushPromiseChains()
      .then(() => {
        expect(errorHandler).not.toHaveBeenCalled();
        assertLifecycleCall(error);
        return flushPromiseChains();
      })
      .then(() => {
        expect(errorHandler).toHaveBeenCalledWith(error);
      });
  };

  // Helper for testing handling of fatal error responses from the server, particularly
  // their interplay with lifecycle hooks.

  const testResponseFailureHandling = ({
    runOnRequestFailureCallbacks,
    assertLifecycleCall,
  }) => {
    const error = new Error("Unexpected response.");
    processWarningsAndErrors.mockImplementation(() => {
      throw error;
    });
    const errorHandler = vi.fn();

    sendEdgeNetworkRequest({
      request,
      runOnRequestFailureCallbacks,
    }).catch(errorHandler);

    return flushPromiseChains()
      .then(() => {
        expect(errorHandler).not.toHaveBeenCalled();
        assertLifecycleCall(error);
        return flushPromiseChains();
      })
      .then(() => {
        expect(errorHandler).toHaveBeenCalledWith(error);
      });
  };

  // Helper for testing handling of successful network responses, particularly
  // their interplay with lifecycle hooks.
  const testResponseSuccessHandling = ({
    runOnResponseCallbacks,
    assertLifecycleCall,
  }) => {
    const successHandler = vi.fn();
    sendEdgeNetworkRequest({
      request,
      runOnResponseCallbacks,
    }).then(successHandler);
    return flushPromiseChains()
      .then(() => {
        expect(successHandler).not.toHaveBeenCalled();
        assertLifecycleCall();
        expect(lifecycle.onResponse).toHaveBeenCalledWith({
          response,
        });
        return flushPromiseChains();
      })
      .then(() => {
        expect(successHandler).toHaveBeenCalled();
      });
  };
  beforeEach(() => {
    config = createConfig({
      edgeDomain: "edge.example.com",
      edgeBasePath: "ee",
      datastreamId: "myconfigId",
    });
    payload = {
      mergeMeta: vi.fn(),
      type: vi.fn().mockReturnValue("payload"),
    };
    request = {
      getId: vi.fn().mockReturnValue("RID123"),
      getAction: vi.fn().mockReturnValue("test-action"),
      getPayload: vi.fn().mockReturnValue(payload),
      getUseIdThirdPartyDomain: vi.fn().mockReturnValue(false),
      getUseSendBeacon: vi.fn().mockReturnValue(false),
      getDatastreamIdOverride: vi.fn().mockReturnValue(""),
      getEdgeSubPath: vi.fn().mockReturnValue(""),
    };
    logger = {
      info: vi.fn(),
    };
    lifecycle = {
      onBeforeRequest: vi.fn().mockReturnValue(Promise.resolve()),
      onRequestFailure: vi.fn().mockReturnValue(Promise.resolve()),
      onResponse: vi.fn().mockReturnValue(Promise.resolve()),
    };
    cookieTransfer = {
      cookiesToPayload: vi.fn(),
      responseToCookies: vi.fn(),
    };
    networkResult = {
      parsedBody: {
        my: "parsedBody",
      },
      getHeader: () => "myheader",
    };
    sendNetworkRequest = vi
      .fn()
      .mockReturnValue(Promise.resolve(networkResult));
    response = {
      type: "response",
    };
    createResponse = vi.fn().mockReturnValue(response);
    processWarningsAndErrors = vi.fn();
    getLocationHint = vi.fn();
    getAssuranceValidationTokenParams = vi.fn().mockReturnValue("");
    sendEdgeNetworkRequest = injectSendEdgeNetworkRequest({
      config,
      logger,
      lifecycle,
      cookieTransfer,
      sendNetworkRequest,
      createResponse,
      processWarningsAndErrors,
      getLocationHint,
      getAssuranceValidationTokenParams,
    });
  });
  it("transfers cookies to payload when sending to first-party domain", () => {
    return sendEdgeNetworkRequest({
      request,
    }).then(() => {
      expect(cookieTransfer.cookiesToPayload).toHaveBeenCalledWith(
        payload,
        "edge.example.com",
      );
    });
  });
  it("transfers cookies to payload when sending to third-party domain", () => {
    // Ensure that sendEdgeNetworkRequest waits until after
    // lifecycle.onBeforeRequest to determine the endpoint domain.
    lifecycle.onBeforeRequest.mockImplementation(() => {
      request.getUseIdThirdPartyDomain.mockReturnValue(true);
      return Promise.resolve();
    });
    return sendEdgeNetworkRequest({
      request,
    }).then(() => {
      expect(cookieTransfer.cookiesToPayload).toHaveBeenCalledWith(
        payload,
        "adobedc.demdex.net",
      );
    });
  });
  it("sends request to first-party domain", () => {
    return sendEdgeNetworkRequest({
      request,
    }).then(() => {
      expect(sendNetworkRequest).toHaveBeenCalledWith({
        requestId: "RID123",
        url: "https://edge.example.com/ee/v1/test-action?configId=myconfigId&requestId=RID123",
        payload,
        useSendBeacon: false,
      });
    });
  });
  it("sends request to third-party domain", () => {
    // Ensure that sendEdgeNetworkRequest waits until after
    // lifecycle.onBeforeRequest to determine the endpoint domain.
    lifecycle.onBeforeRequest.mockImplementation(() => {
      request.getUseIdThirdPartyDomain.mockReturnValue(true);
      return Promise.resolve();
    });
    return sendEdgeNetworkRequest({
      request,
    }).then(() => {
      expect(sendNetworkRequest).toHaveBeenCalledWith({
        requestId: "RID123",
        url: "https://adobedc.demdex.net/ee/v1/test-action?configId=myconfigId&requestId=RID123",
        payload,
        useSendBeacon: false,
      });
    });
  });
  it("sends request using sendBeacon", () => {
    // Ensure that sendEdgeNetworkRequest waits until after
    // lifecycle.onBeforeRequest to determine whether to use sendBeacon.
    lifecycle.onBeforeRequest.mockImplementation(() => {
      request.getUseSendBeacon.mockReturnValue(true);
      return Promise.resolve();
    });
    return sendEdgeNetworkRequest({
      request,
    }).then(() => {
      expect(sendNetworkRequest).toHaveBeenCalledWith({
        requestId: "RID123",
        url: "https://edge.example.com/ee/v1/test-action?configId=myconfigId&requestId=RID123",
        payload,
        useSendBeacon: true,
      });
    });
  });
  it("calls lifecycle.onBeforeRequest and waits for it to complete before sending request", () => {
    const deferred = defer();
    lifecycle.onBeforeRequest.mockReturnValue(deferred.promise);
    const successHandler = vi.fn();
    sendEdgeNetworkRequest({
      request,
    }).then(successHandler);
    return flushPromiseChains()
      .then(() => {
        expect(lifecycle.onBeforeRequest).toHaveBeenCalledWith({
          request,
          onResponse: expect.any(Function),
          onRequestFailure: expect.any(Function),
        });
        expect(sendNetworkRequest).not.toHaveBeenCalled();
        deferred.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(successHandler).toHaveBeenCalled();
      });
  });
  it("when network request fails, calls lifecycle.onRequestFailure, waits for it to complete, then rejects promise", () => {
    const deferred = defer();
    lifecycle.onRequestFailure.mockReturnValue(deferred.promise);
    return testRequestFailureHandling({
      assertLifecycleCall(error) {
        expect(lifecycle.onRequestFailure).toHaveBeenCalledWith({
          error,
        });
        // We reject this deferred to simulate a component throwing an error
        // during the lifecycle.onRequestFailure hook. This tests that the
        // promise from sendEdgeNetworkRequest is still rejected with the
        // network error rather than the error coming from a component.
        deferred.reject();
      },
    });
  });
  it("when network request fails, calls lifecycle.onBeforeRequest's onRequestFailure callback, waits for it to complete, then rejects promise", () => {
    const deferred = defer();
    const requestFailureCallback = vi.fn().mockReturnValue(deferred.promise);
    lifecycle.onBeforeRequest.mockImplementation(({ onRequestFailure }) => {
      onRequestFailure(requestFailureCallback);
      return Promise.resolve();
    });
    return testRequestFailureHandling({
      assertLifecycleCall(error) {
        expect(requestFailureCallback).toHaveBeenCalledWith({
          error,
        });
        // We reject this deferred to simulate a component throwing an error
        // during the lifecycle.onBeforeRequest's onRequestFailure callback.
        // This tests that the promise from sendEdgeNetworkRequest is still
        // rejected with the network error rather than the error coming from
        // a component.
        deferred.reject();
      },
    });
  });
  it("when network request fails, calls onRequestFailureCallbacks, waits for it to complete, then rejects promise", () => {
    const deferred = defer();
    const runOnRequestFailureCallbacks = vi
      .fn()
      .mockReturnValue(deferred.promise);
    return testRequestFailureHandling({
      runOnRequestFailureCallbacks,
      assertLifecycleCall(error) {
        expect(runOnRequestFailureCallbacks).toHaveBeenCalledWith({
          error,
        });
        // We reject this deferred to simulate a component throwing an error
        // during the runOnRequestFailureCallbacks call. This tests that the
        // promise from sendEdgeNetworkRequest is still rejected with the
        // network error rather than the error coming from a component.
        deferred.reject();
      },
    });
  });
  it("when network response is a failure, calls lifecycle.onRequestFailure, waits for it to complete, then rejects promise", () => {
    const deferred = defer();
    lifecycle.onRequestFailure.mockReturnValue(deferred.promise);
    return testResponseFailureHandling({
      assertLifecycleCall(error) {
        expect(lifecycle.onRequestFailure).toHaveBeenCalledWith({
          error,
        });
        // We reject this deferred to simulate a component throwing an error
        // during the lifecycle.onRequestFailure hook. This tests that the
        // promise from sendEdgeNetworkRequest is still rejected with the
        // network error rather than the error coming from a component.
        deferred.reject();
      },
    });
  });
  it("when network response is a failure, calls lifecycle.onBeforeRequest's onRequestFailure callback, waits for it to complete, then rejects promise", () => {
    const deferred = defer();
    const requestFailureCallback = vi.fn().mockReturnValue(deferred.promise);
    lifecycle.onBeforeRequest.mockImplementation(({ onRequestFailure }) => {
      onRequestFailure(requestFailureCallback);
      return Promise.resolve();
    });
    return testResponseFailureHandling({
      assertLifecycleCall(error) {
        expect(requestFailureCallback).toHaveBeenCalledWith({
          error,
        });
        // We reject this deferred to simulate a component throwing an error
        // during the lifecycle.onBeforeRequest's onRequestFailure callback.
        // This tests that the promise from sendEdgeNetworkRequest is still
        // rejected with the network error rather than the error coming from
        // a component.
        deferred.reject();
      },
    });
  });
  it("when network response is a failure, calls runOnRequestFailureCallbacks, waits for it to complete, then rejects promise", () => {
    const deferred = defer();
    const runOnRequestFailureCallbacks = vi
      .fn()
      .mockReturnValue(deferred.promise);
    return testResponseFailureHandling({
      runOnRequestFailureCallbacks,
      assertLifecycleCall(error) {
        expect(runOnRequestFailureCallbacks).toHaveBeenCalledWith({
          error,
        });
        // We reject this deferred to simulate a component throwing an error
        // during the runOnRequestFailureCallbacks call. This tests that the
        // promise from sendEdgeNetworkRequest is still rejected with the
        // network error rather than the error coming from a component.
        deferred.reject();
      },
    });
  });
  it("when network response is a success, calls lifecycle.onResponse, waits for it to complete, then resolves promise", () => {
    const deferred = defer();
    lifecycle.onResponse.mockReturnValue(deferred.promise);
    return testResponseSuccessHandling({
      assertLifecycleCall() {
        expect(lifecycle.onResponse).toHaveBeenCalledWith({
          response,
        });
        deferred.resolve();
      },
    });
  });
  it("when network response is a success, calls lifecycle.onBeforeRequest's responseCallback callback, waits for it to complete, then resolves promise", () => {
    const deferred = defer();
    const responseCallback = vi.fn().mockReturnValue(deferred.promise);
    lifecycle.onBeforeRequest.mockImplementation(({ onResponse }) => {
      onResponse(responseCallback);
      return Promise.resolve();
    });
    return testResponseSuccessHandling({
      assertLifecycleCall() {
        expect(responseCallback).toHaveBeenCalledWith({
          response,
        });
        deferred.resolve();
      },
    });
  });
  it("when network response is a success, calls runOnResponseCallbacks, waits for it to complete, then resolves promise", () => {
    const deferred = defer();
    const runOnResponseCallbacks = vi.fn().mockReturnValue(deferred.promise);
    return testResponseSuccessHandling({
      runOnResponseCallbacks,
      assertLifecycleCall() {
        expect(runOnResponseCallbacks).toHaveBeenCalledWith({
          response,
        });
        deferred.resolve();
      },
    });
  });
  it("transfers cookies from response before lifecycle.onResponse", () => {
    return sendEdgeNetworkRequest({
      request,
    }).then(() => {
      expect(cookieTransfer.responseToCookies).toHaveBeenCalledWith(response);
      assertFunctionCallOrder([
        cookieTransfer.responseToCookies,
        lifecycle.onResponse,
      ]);
    });
  });
  it("returns the merged object from lifecycle::onResponse and runOnResponseCallbacks", () => {
    const runOnResponseCallbacks = vi.fn().mockReturnValue(
      Promise.resolve([
        {
          c: 2,
        },
        {
          h: 9,
        },
        undefined,
      ]),
    );
    lifecycle.onResponse.mockReturnValue(
      Promise.resolve([
        {
          a: 2,
        },
        {
          b: 8,
        },
        undefined,
      ]),
    );
    return expect(
      sendEdgeNetworkRequest({
        request,
        runOnResponseCallbacks,
      }),
    ).resolves.toStrictEqual({
      c: 2,
      h: 9,
      a: 2,
      b: 8,
    });
  });
  it("returns the merged object from lifecycle::onBeforeRequest & lifecycle::onResponse", () => {
    lifecycle.onBeforeRequest.mockImplementation(({ onResponse }) => {
      onResponse(() => ({
        a: 1,
      }));
      onResponse(() => ({
        b: 1,
      }));
      onResponse(() => undefined);
      return Promise.resolve();
    });
    lifecycle.onResponse.mockReturnValue(
      Promise.resolve([
        {
          c: 2,
        },
      ]),
    );
    return expect(
      sendEdgeNetworkRequest({
        request,
      }),
    ).resolves.toStrictEqual({
      a: 1,
      b: 1,
      c: 2,
    });
  });
  it("creates the response with the correct parameters", () => {
    return sendEdgeNetworkRequest({
      request,
    }).then(() => {
      expect(createResponse).toHaveBeenCalledWith({
        content: {
          my: "parsedBody",
        },
        getHeader: networkResult.getHeader,
      });
    });
  });
  it("uses the cluster cookie location hint", () => {
    getLocationHint.mockReturnValue("va6");
    return sendEdgeNetworkRequest({
      request,
    }).then(() => {
      expect(sendNetworkRequest).toHaveBeenCalledWith({
        requestId: "RID123",
        url: "https://edge.example.com/ee/va6/v1/test-action?configId=myconfigId&requestId=RID123",
        payload,
        useSendBeacon: false,
      });
    });
  });
  it("sets validation token params", () => {
    getAssuranceValidationTokenParams.mockReturnValue(
      "&adobeAepValidationToken=abc-123",
    );
    return sendEdgeNetworkRequest({
      request,
    }).then(() => {
      expect(sendNetworkRequest).toHaveBeenCalledWith({
        requestId: "RID123",
        url: "https://edge.example.com/ee/v1/test-action?configId=myconfigId&requestId=RID123&adobeAepValidationToken=abc-123",
        payload,
        useSendBeacon: false,
      });
    });
  });
  it("respects the datastreamIdOverride", () => {
    request.getDatastreamIdOverride.mockReturnValue("myconfigIdOverride");
    return sendEdgeNetworkRequest({
      request,
    }).then(() => {
      expect(payload.mergeMeta).toHaveBeenCalledWith({
        sdkConfig: {
          datastream: {
            original: "myconfigId",
          },
        },
      });
      expect(sendNetworkRequest).toHaveBeenCalledWith({
        payload,
        url: "https://edge.example.com/ee/v1/test-action?configId=myconfigIdOverride&requestId=RID123",
        requestId: "RID123",
        useSendBeacon: false,
      });
    });
  });
});
