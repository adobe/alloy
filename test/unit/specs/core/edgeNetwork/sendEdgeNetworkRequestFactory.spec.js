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

import sendEdgeNetworkRequestFactory from "../../../../../src/core/edgeNetwork/sendEdgeNetworkRequestFactory";
import createConfig from "../../../../../src/core/config/createConfig";
import { defer } from "../../../../../src/utils";
import flushPromiseChains from "../../../helpers/flushPromiseChains";
import assertFunctionCallOrder from "../../../helpers/assertFunctionCallOrder";

describe("sendEdgeNetworkRequestFactory", () => {
  const config = createConfig({
    edgeDomain: "edge.example.com",
    edgeBasePath: "ee",
    configId: "myconfigId"
  });
  let logger;
  let lifecycle;
  let cookieTransfer;
  let networkResult;
  let sendNetworkRequest;
  let response;
  let createResponse;
  let processWarningsAndErrors;
  let validateNetworkResponseIsWellFormed;
  let sendEdgeNetworkRequest;
  const payload = {
    getUseIdThirdPartyDomain() {
      return false;
    }
  };
  const action = "test-action";

  /**
   * Helper for testing handling of network request failures, particularly
   * their interplay with lifecycle hooks.
   */
  const testRequestFailureHandling = ({
    runOnRequestFailureCallbacks,
    assertLifecycleCall
  }) => {
    const error = new Error("no connection");
    sendNetworkRequest.and.returnValue(Promise.reject(error));
    const errorHandler = jasmine.createSpy("errorHandler");
    sendEdgeNetworkRequest({ payload, action, runOnRequestFailureCallbacks })
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

  /**
   * Helper for testing handling of malformed network responses, particularly
   * their interplay with lifecycle hooks.
   */
  const testMalformedResponseHandling = ({
    runOnRequestFailureCallbacks,
    assertLifecycleCall
  }) => {
    const error = new Error("Unexpected response.");
    validateNetworkResponseIsWellFormed.and.throwError(error);
    const errorHandler = jasmine.createSpy("errorHandler");
    sendEdgeNetworkRequest({ payload, action, runOnRequestFailureCallbacks })
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

  /**
   * Helper for testing handling of well-formed network responses, particularly
   * their interplay with lifecycle hooks.
   */
  const testWellFormedResponseHandling = ({
    runOnResponseCallbacks,
    assertLifecycleCall
  }) => {
    const successHandler = jasmine.createSpy("successHandler");
    sendEdgeNetworkRequest({ payload, action, runOnResponseCallbacks }).then(
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
    logger = jasmine.createSpyObj("logger", ["log"]);
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
      parsedBody: {}
    };
    sendNetworkRequest = jasmine
      .createSpy("sendNetworkRequest")
      .and.returnValue(Promise.resolve(networkResult));
    response = { type: "response" };
    createResponse = jasmine
      .createSpy("createResponse")
      .and.returnValue(response);
    processWarningsAndErrors = jasmine.createSpy("processWarningsAndErrors");
    validateNetworkResponseIsWellFormed = jasmine.createSpy(
      "validateNetworkResponseIsWellFormed"
    );
    sendEdgeNetworkRequest = sendEdgeNetworkRequestFactory({
      config,
      logger,
      lifecycle,
      cookieTransfer,
      sendNetworkRequest,
      createResponse,
      processWarningsAndErrors,
      validateNetworkResponseIsWellFormed
    });
  });

  it("transfers cookies to payload when sending to first-party domain", () => {
    payload.getUseIdThirdPartyDomain = () => false;
    return sendEdgeNetworkRequest({ payload, action }).then(() => {
      expect(cookieTransfer.cookiesToPayload).toHaveBeenCalledWith(
        payload,
        "edge.example.com"
      );
    });
  });

  it("transfers cookies to payload when sending to third-party domain", () => {
    payload.getUseIdThirdPartyDomain = () => false;
    // Ensure that sendEdgeNetworkRequest waits until after
    // lifecycle.onBeforeRequest to determine the endpoint domain.
    lifecycle.onBeforeRequest.and.callFake(() => {
      payload.getUseIdThirdPartyDomain = () => true;
      return Promise.resolve();
    });
    return sendEdgeNetworkRequest({ payload, action }).then(() => {
      expect(cookieTransfer.cookiesToPayload).toHaveBeenCalledWith(
        payload,
        "adobedc.demdex.net"
      );
    });
  });

  it("sends request to first-party domain", () => {
    payload.getUseIdThirdPartyDomain = () => false;
    return sendEdgeNetworkRequest({ payload, action }).then(() => {
      expect(sendNetworkRequest).toHaveBeenCalledWith({
        payload,
        url: jasmine.stringMatching(
          /https:\/\/edge\.example\.com\/ee\/v1\/test-action\?configId=myconfigId&requestId=[0-9a-f-]+/
        ),
        requestId: jasmine.stringMatching(/^[0-9a-f-]+$/)
      });
    });
  });

  it("sends request to third-party domain", () => {
    payload.getUseIdThirdPartyDomain = () => false;
    // Ensure that sendEdgeNetworkRequest waits until after
    // lifecycle.onBeforeRequest to determine the endpoint domain.
    lifecycle.onBeforeRequest.and.callFake(() => {
      payload.getUseIdThirdPartyDomain = () => true;
      return Promise.resolve();
    });
    return sendEdgeNetworkRequest({ payload, action }).then(() => {
      expect(sendNetworkRequest).toHaveBeenCalledWith({
        payload,
        url: jasmine.stringMatching(
          /https:\/\/adobedc\.demdex\.net\/ee\/v1\/test-action\?configId=myconfigId&requestId=[0-9a-f-]+/
        ),
        requestId: jasmine.stringMatching(/^[0-9a-f-]+$/)
      });
    });
  });

  it("calls lifecycle.onBeforeRequest and waits for it to complete before sending request", () => {
    const deferred = defer();
    lifecycle.onBeforeRequest.and.returnValue(deferred.promise);
    const successHandler = jasmine.createSpy("successHandler");
    sendEdgeNetworkRequest({ payload, action }).then(successHandler);
    return flushPromiseChains()
      .then(() => {
        expect(lifecycle.onBeforeRequest).toHaveBeenCalledWith({
          payload,
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

  it("when network response is malformed, calls lifecycle.onRequestFailure, waits for it to complete, then rejects promise", () => {
    const deferred = defer();
    lifecycle.onRequestFailure.and.returnValue(deferred.promise);

    return testMalformedResponseHandling({
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

  it("when network response is malformed, calls lifecycle.onBeforeRequest's onRequestFailure callback, waits for it to complete, then rejects promise", () => {
    const deferred = defer();
    const requestFailureCallback = jasmine
      .createSpy("requestFailureCallback")
      .and.returnValue(deferred.promise);
    lifecycle.onBeforeRequest.and.callFake(({ onRequestFailure }) => {
      onRequestFailure(requestFailureCallback);
      return Promise.resolve();
    });
    return testMalformedResponseHandling({
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

  it("when network response is malformed, calls runOnRequestFailureCallbacks, waits for it to complete, then rejects promise", () => {
    const deferred = defer();
    const runOnRequestFailureCallbacks = jasmine
      .createSpy("runOnRequestFailureCallbacks")
      .and.returnValue(deferred.promise);
    return testMalformedResponseHandling({
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

  it("when network response is well-formed, calls lifecycle.onResponse, waits for it to complete, then resolves promise", () => {
    const deferred = defer();
    lifecycle.onResponse.and.returnValue(deferred.promise);
    return testWellFormedResponseHandling({
      assertLifecycleCall() {
        expect(lifecycle.onResponse).toHaveBeenCalledWith({ response });
        deferred.resolve();
      }
    });
  });

  it("when network response is well-formed, calls lifecycle.onBeforeRequest's responseCallback callback, waits for it to complete, then resolves promise", () => {
    const deferred = defer();
    const responseCallback = jasmine
      .createSpy("responseCallback")
      .and.returnValue(deferred.promise);
    lifecycle.onBeforeRequest.and.callFake(({ onResponse }) => {
      onResponse(responseCallback);
      return Promise.resolve();
    });
    return testWellFormedResponseHandling({
      assertLifecycleCall() {
        expect(responseCallback).toHaveBeenCalledWith({ response });
        deferred.resolve();
      }
    });
  });

  it("when network response is well-formed, calls runOnResponseCallbacks, waits for it to complete, then resolves promise", () => {
    const deferred = defer();
    const runOnResponseCallbacks = jasmine
      .createSpy("runOnResponseCallbacks")
      .and.returnValue(deferred.promise);
    return testWellFormedResponseHandling({
      runOnResponseCallbacks,
      assertLifecycleCall() {
        expect(runOnResponseCallbacks).toHaveBeenCalledWith({ response });
        deferred.resolve();
      }
    });
  });

  it("transfers cookies from response before lifecycle.onResponse", () => {
    return sendEdgeNetworkRequest({ payload, action }).then(() => {
      expect(cookieTransfer.responseToCookies).toHaveBeenCalledWith(response);
      assertFunctionCallOrder([
        cookieTransfer.responseToCookies,
        lifecycle.onResponse
      ]);
    });
  });

  it("processes warnings and errors", () => {
    return sendEdgeNetworkRequest({ payload, action }).then(() => {
      expect(processWarningsAndErrors).toHaveBeenCalled();
    });
  });

  it("rejects the promise if error is thrown while processing warnings and errors", () => {
    processWarningsAndErrors.and.throwError(new Error("Invalid XDM"));
    return expectAsync(
      sendEdgeNetworkRequest({ payload, action })
    ).toBeRejectedWithError("Invalid XDM");
  });
});
