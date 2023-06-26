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

import injectSendEdgeNetworkRequest from "../../../../../src/core/edgeNetwork/injectSendEdgeNetworkRequest";
import createConfig from "../../../../../src/core/config/createConfig";
import { defer } from "../../../../../src/utils";
import flushPromiseChains from "../../../helpers/flushPromiseChains";
import assertFunctionCallOrder from "../../../helpers/assertFunctionCallOrder";

describe("injectSendEdgeNetworkRequest", () => {
  const config = createConfig({
    edgeDomain: "edge.example.com",
    edgeBasePath: "ee",
    datastreamId: "myconfigId"
  });
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
  let request;

  // Helper for testing handling of network request failures, particularly
  // their interplay with lifecycle hooks.
  const testRequestFailureHandling = ({
    runOnRequestFailureCallbacks,
    assertLifecycleCall
  }) => {
    const error = new Error("no connection");
    sendNetworkRequest.and.returnValue(Promise.reject(error));
    const errorHandler = jasmine.createSpy("errorHandler");
    sendEdgeNetworkRequest({ request, runOnRequestFailureCallbacks })
      .then(fail)
      .catch(errorHandler);
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
    assertLifecycleCall
  }) => {
    const error = new Error("Unexpected response.");
    processWarningsAndErrors.and.throwError(error);
    const errorHandler = jasmine.createSpy("errorHandler");
    sendEdgeNetworkRequest({ request, runOnRequestFailureCallbacks })
      .then(fail)
      .catch(errorHandler);
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
    assertLifecycleCall
  }) => {
    const successHandler = jasmine.createSpy("successHandler");
    sendEdgeNetworkRequest({ request, runOnResponseCallbacks }).then(
      successHandler
    );
    return flushPromiseChains()
      .then(() => {
        expect(successHandler).not.toHaveBeenCalled();
        assertLifecycleCall();
        expect(lifecycle.onResponse).toHaveBeenCalledWith({ response });
        return flushPromiseChains();
      })
      .then(() => {
        expect(successHandler).toHaveBeenCalled();
      });
  };

  beforeEach(() => {
    request = jasmine.createSpyObj("request", {
      getId: "RID123",
      getAction: "test-action",
      getPayload: {
        type: "payload"
      },
      getUseIdThirdPartyDomain: false,
      getUseSendBeacon: false,
      getEdgeConfigIdOverride: ""
    });
    logger = jasmine.createSpyObj("logger", ["info"]);
    lifecycle = jasmine.createSpyObj("lifecycle", {
      onBeforeRequest: Promise.resolve(),
      onRequestFailure: Promise.resolve(),
      onResponse: Promise.resolve()
    });
    cookieTransfer = jasmine.createSpyObj("cookieTransfer", [
      "cookiesToPayload",
      "responseToCookies"
    ]);
    networkResult = {
      parsedBody: { my: "parsedBody" },
      getHeader: () => "myheader"
    };
    sendNetworkRequest = jasmine
      .createSpy("sendNetworkRequest")
      .and.returnValue(Promise.resolve(networkResult));
    response = { type: "response" };
    createResponse = jasmine
      .createSpy("createResponse")
      .and.returnValue(response);
    processWarningsAndErrors = jasmine.createSpy("processWarningsAndErrors");
    getLocationHint = jasmine.createSpy("getLocationHint");
    getAssuranceValidationTokenParams = jasmine
      .createSpy("getAssuranceValidationTokenParams")
      .and.returnValue("");
    sendEdgeNetworkRequest = injectSendEdgeNetworkRequest({
      config,
      logger,
      lifecycle,
      cookieTransfer,
      sendNetworkRequest,
      createResponse,
      processWarningsAndErrors,
      getLocationHint,
      getAssuranceValidationTokenParams
    });
  });

  it("transfers cookies to payload when sending to first-party domain", () => {
    return sendEdgeNetworkRequest({ request }).then(() => {
      expect(cookieTransfer.cookiesToPayload).toHaveBeenCalledWith(
        request.getPayload(),
        "edge.example.com"
      );
    });
  });

  it("transfers cookies to payload when sending to third-party domain", () => {
    // Ensure that sendEdgeNetworkRequest waits until after
    // lifecycle.onBeforeRequest to determine the endpoint domain.
    lifecycle.onBeforeRequest.and.callFake(() => {
      request.getUseIdThirdPartyDomain.and.returnValue(true);
      return Promise.resolve();
    });
    return sendEdgeNetworkRequest({ request }).then(() => {
      expect(cookieTransfer.cookiesToPayload).toHaveBeenCalledWith(
        request.getPayload(),
        "adobedc.demdex.net"
      );
    });
  });

  it("sends request to first-party domain", () => {
    return sendEdgeNetworkRequest({ request }).then(() => {
      expect(sendNetworkRequest).toHaveBeenCalledWith({
        requestId: "RID123",
        url:
          "https://edge.example.com/ee/v1/test-action?configId=myconfigId&requestId=RID123",
        payload: {
          type: "payload"
        },
        useSendBeacon: false
      });
    });
  });

  it("sends request to third-party domain", () => {
    // Ensure that sendEdgeNetworkRequest waits until after
    // lifecycle.onBeforeRequest to determine the endpoint domain.
    lifecycle.onBeforeRequest.and.callFake(() => {
      request.getUseIdThirdPartyDomain.and.returnValue(true);
      return Promise.resolve();
    });
    return sendEdgeNetworkRequest({ request }).then(() => {
      expect(sendNetworkRequest).toHaveBeenCalledWith({
        requestId: "RID123",
        url:
          "https://adobedc.demdex.net/ee/v1/test-action?configId=myconfigId&requestId=RID123",
        payload: {
          type: "payload"
        },
        useSendBeacon: false
      });
    });
  });

  it("sends request using sendBeacon", () => {
    // Ensure that sendEdgeNetworkRequest waits until after
    // lifecycle.onBeforeRequest to determine whether to use sendBeacon.
    lifecycle.onBeforeRequest.and.callFake(() => {
      request.getUseSendBeacon.and.returnValue(true);
      return Promise.resolve();
    });
    return sendEdgeNetworkRequest({ request }).then(() => {
      expect(sendNetworkRequest).toHaveBeenCalledWith({
        requestId: "RID123",
        url:
          "https://edge.example.com/ee/v1/test-action?configId=myconfigId&requestId=RID123",
        payload: {
          type: "payload"
        },
        useSendBeacon: true
      });
    });
  });

  it("calls lifecycle.onBeforeRequest and waits for it to complete before sending request", () => {
    const deferred = defer();
    lifecycle.onBeforeRequest.and.returnValue(deferred.promise);
    const successHandler = jasmine.createSpy("successHandler");
    sendEdgeNetworkRequest({ request }).then(successHandler);
    return flushPromiseChains()
      .then(() => {
        expect(lifecycle.onBeforeRequest).toHaveBeenCalledWith({
          request,
          onResponse: jasmine.any(Function),
          onRequestFailure: jasmine.any(Function)
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
    lifecycle.onRequestFailure.and.returnValue(deferred.promise);
    return testRequestFailureHandling({
      assertLifecycleCall(error) {
        expect(lifecycle.onRequestFailure).toHaveBeenCalledWith({ error });
        // We reject this deferred to simulate a component throwing an error
        // during the lifecycle.onRequestFailure hook. This tests that the
        // promise from sendEdgeNetworkRequest is still rejected with the
        // network error rather than the error coming from a component.
        deferred.reject();
      }
    });
  });

  it("when network request fails, calls lifecycle.onBeforeRequest's onRequestFailure callback, waits for it to complete, then rejects promise", () => {
    const deferred = defer();
    const requestFailureCallback = jasmine
      .createSpy("requestFailureCallback")
      .and.returnValue(deferred.promise);
    lifecycle.onBeforeRequest.and.callFake(({ onRequestFailure }) => {
      onRequestFailure(requestFailureCallback);
      return Promise.resolve();
    });
    return testRequestFailureHandling({
      assertLifecycleCall(error) {
        expect(requestFailureCallback).toHaveBeenCalledWith({ error });
        // We reject this deferred to simulate a component throwing an error
        // during the lifecycle.onBeforeRequest's onRequestFailure callback.
        // This tests that the promise from sendEdgeNetworkRequest is still
        // rejected with the network error rather than the error coming from
        // a component.
        deferred.reject();
      }
    });
  });

  it("when network request fails, calls onRequestFailureCallbacks, waits for it to complete, then rejects promise", () => {
    const deferred = defer();
    const runOnRequestFailureCallbacks = jasmine
      .createSpy("runOnRequestFailureCallbacks")
      .and.returnValue(deferred.promise);
    return testRequestFailureHandling({
      runOnRequestFailureCallbacks,
      assertLifecycleCall(error) {
        expect(runOnRequestFailureCallbacks).toHaveBeenCalledWith({ error });
        // We reject this deferred to simulate a component throwing an error
        // during the runOnRequestFailureCallbacks call. This tests that the
        // promise from sendEdgeNetworkRequest is still rejected with the
        // network error rather than the error coming from a component.
        deferred.reject();
      }
    });
  });

  it("when network response is a failure, calls lifecycle.onRequestFailure, waits for it to complete, then rejects promise", () => {
    const deferred = defer();
    lifecycle.onRequestFailure.and.returnValue(deferred.promise);

    return testResponseFailureHandling({
      assertLifecycleCall(error) {
        expect(lifecycle.onRequestFailure).toHaveBeenCalledWith({ error });
        // We reject this deferred to simulate a component throwing an error
        // during the lifecycle.onRequestFailure hook. This tests that the
        // promise from sendEdgeNetworkRequest is still rejected with the
        // network error rather than the error coming from a component.
        deferred.reject();
      }
    });
  });

  it("when network response is a failure, calls lifecycle.onBeforeRequest's onRequestFailure callback, waits for it to complete, then rejects promise", () => {
    const deferred = defer();
    const requestFailureCallback = jasmine
      .createSpy("requestFailureCallback")
      .and.returnValue(deferred.promise);
    lifecycle.onBeforeRequest.and.callFake(({ onRequestFailure }) => {
      onRequestFailure(requestFailureCallback);
      return Promise.resolve();
    });
    return testResponseFailureHandling({
      assertLifecycleCall(error) {
        expect(requestFailureCallback).toHaveBeenCalledWith({ error });
        // We reject this deferred to simulate a component throwing an error
        // during the lifecycle.onBeforeRequest's onRequestFailure callback.
        // This tests that the promise from sendEdgeNetworkRequest is still
        // rejected with the network error rather than the error coming from
        // a component.
        deferred.reject();
      }
    });
  });

  it("when network response is a failure, calls runOnRequestFailureCallbacks, waits for it to complete, then rejects promise", () => {
    const deferred = defer();
    const runOnRequestFailureCallbacks = jasmine
      .createSpy("runOnRequestFailureCallbacks")
      .and.returnValue(deferred.promise);
    return testResponseFailureHandling({
      runOnRequestFailureCallbacks,
      assertLifecycleCall(error) {
        expect(runOnRequestFailureCallbacks).toHaveBeenCalledWith({ error });
        // We reject this deferred to simulate a component throwing an error
        // during the runOnRequestFailureCallbacks call. This tests that the
        // promise from sendEdgeNetworkRequest is still rejected with the
        // network error rather than the error coming from a component.
        deferred.reject();
      }
    });
  });

  it("when network response is a success, calls lifecycle.onResponse, waits for it to complete, then resolves promise", () => {
    const deferred = defer();
    lifecycle.onResponse.and.returnValue(deferred.promise);
    return testResponseSuccessHandling({
      assertLifecycleCall() {
        expect(lifecycle.onResponse).toHaveBeenCalledWith({ response });
        deferred.resolve();
      }
    });
  });

  it("when network response is a success, calls lifecycle.onBeforeRequest's responseCallback callback, waits for it to complete, then resolves promise", () => {
    const deferred = defer();
    const responseCallback = jasmine
      .createSpy("responseCallback")
      .and.returnValue(deferred.promise);
    lifecycle.onBeforeRequest.and.callFake(({ onResponse }) => {
      onResponse(responseCallback);
      return Promise.resolve();
    });
    return testResponseSuccessHandling({
      assertLifecycleCall() {
        expect(responseCallback).toHaveBeenCalledWith({ response });
        deferred.resolve();
      }
    });
  });

  it("when network response is a success, calls runOnResponseCallbacks, waits for it to complete, then resolves promise", () => {
    const deferred = defer();
    const runOnResponseCallbacks = jasmine
      .createSpy("runOnResponseCallbacks")
      .and.returnValue(deferred.promise);
    return testResponseSuccessHandling({
      runOnResponseCallbacks,
      assertLifecycleCall() {
        expect(runOnResponseCallbacks).toHaveBeenCalledWith({ response });
        deferred.resolve();
      }
    });
  });

  it("transfers cookies from response before lifecycle.onResponse", () => {
    return sendEdgeNetworkRequest({ request }).then(() => {
      expect(cookieTransfer.responseToCookies).toHaveBeenCalledWith(response);
      assertFunctionCallOrder([
        cookieTransfer.responseToCookies,
        lifecycle.onResponse
      ]);
    });
  });

  it("returns the merged object from lifecycle::onResponse and runOnResponseCallbacks", () => {
    const runOnResponseCallbacks = jasmine
      .createSpy("runOnResponseCallbacks")
      .and.returnValue(Promise.resolve([{ c: 2 }, { h: 9 }, undefined]));

    lifecycle.onResponse.and.returnValue(
      Promise.resolve([{ a: 2 }, { b: 8 }, undefined])
    );

    return expectAsync(
      sendEdgeNetworkRequest({ request, runOnResponseCallbacks })
    ).toBeResolvedTo({ c: 2, h: 9, a: 2, b: 8 });
  });

  it("returns the merged object from lifecycle::onBeforeRequest & lifecycle::onResponse", () => {
    lifecycle.onBeforeRequest.and.callFake(({ onResponse }) => {
      onResponse(() => ({ a: 1 }));
      onResponse(() => ({ b: 1 }));
      onResponse(() => undefined);
      return Promise.resolve();
    });
    lifecycle.onResponse.and.returnValue(Promise.resolve([{ c: 2 }]));
    return expectAsync(sendEdgeNetworkRequest({ request })).toBeResolvedTo({
      a: 1,
      b: 1,
      c: 2
    });
  });

  it("creates the response with the correct parameters", () => {
    return sendEdgeNetworkRequest({ request }).then(() => {
      expect(createResponse).toHaveBeenCalledWith({
        content: { my: "parsedBody" },
        getHeader: networkResult.getHeader
      });
    });
  });

  it("uses the cluster cookie location hint", () => {
    getLocationHint.and.returnValue("va6");
    return sendEdgeNetworkRequest({ request }).then(() => {
      expect(sendNetworkRequest).toHaveBeenCalledWith({
        requestId: "RID123",
        url:
          "https://edge.example.com/ee/va6/v1/test-action?configId=myconfigId&requestId=RID123",
        payload: {
          type: "payload"
        },
        useSendBeacon: false
      });
    });
  });

  it("sets validation token params", () => {
    getAssuranceValidationTokenParams.and.returnValue(
      "&adobeAepValidationToken=abc-123"
    );
    return sendEdgeNetworkRequest({ request }).then(() => {
      expect(sendNetworkRequest).toHaveBeenCalledWith({
        requestId: "RID123",
        url:
          "https://edge.example.com/ee/v1/test-action?configId=myconfigId&requestId=RID123&adobeAepValidationToken=abc-123",
        payload: {
          type: "payload"
        },
        useSendBeacon: false
      });
    });
  });

  it("respects the edgeConfigIdOverride", () => {
    request.getEdgeConfigIdOverride.and.returnValue("myconfigIdOverride");
    return sendEdgeNetworkRequest({ request }).then(() => {
      expect(sendNetworkRequest).toHaveBeenCalledWith({
        payload: request.getPayload(),
        url:
          "https://edge.example.com/ee/v1/test-action?configId=myconfigIdOverride&requestId=RID123",
        requestId: "RID123",
        useSendBeacon: false
      });
    });
  });
});
