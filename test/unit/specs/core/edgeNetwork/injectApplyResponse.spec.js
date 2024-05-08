/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import injectApplyResponse from "../../../../../src/core/edgeNetwork/injectApplyResponse.js";
import assertFunctionCallOrder from "../../../helpers/assertFunctionCallOrder.js";
import { defer } from "../../../../../src/utils/index.js";
import flushPromiseChains from "../../../helpers/flushPromiseChains.js";

describe("injectApplyResponse", () => {
  let lifecycle;
  let cookieTransfer;
  let processWarningsAndErrors;
  let createResponse;
  let applyResponse;
  let request;
  let response;
  let responseHeaders;
  let responseBody;

  const testApplyResponseSuccess = ({
    runOnResponseCallbacks,
    assertLifecycleCall
  }) => {
    const successHandler = jasmine.createSpy("successHandler");
    applyResponse({
      request,
      responseHeaders,
      responseBody,
      runOnResponseCallbacks
    }).then(successHandler);
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
    lifecycle = jasmine.createSpyObj("lifecycle", {
      onBeforeRequest: Promise.resolve(),
      onRequestFailure: Promise.resolve(),
      onResponse: Promise.resolve()
    });
    cookieTransfer = jasmine.createSpyObj("cookieTransfer", [
      "cookiesToPayload",
      "responseToCookies"
    ]);

    processWarningsAndErrors = jasmine.createSpy("processWarningsAndErrors");

    request = jasmine.createSpyObj("request", {
      getId: "RID123",
      getAction: "test-action",
      getPayload: {
        type: "payload"
      },
      getUseIdThirdPartyDomain: false,
      getUseSendBeacon: false
    });

    responseHeaders = { "x-hello": "yep" };
    responseBody = { handle: [] };

    response = { type: "response" };

    createResponse = jasmine
      .createSpy("createResponse")
      .and.returnValue(response);

    applyResponse = injectApplyResponse({
      cookieTransfer,
      lifecycle,
      createResponse,
      processWarningsAndErrors
    });
  });

  it("calls lifecycle.onResponse, waits for it to complete, then resolves promise", () => {
    const deferred = defer();
    lifecycle.onResponse.and.returnValue(deferred.promise);
    return testApplyResponseSuccess({
      assertLifecycleCall() {
        expect(lifecycle.onResponse).toHaveBeenCalledWith({ response });
        deferred.resolve();
      }
    });
  });

  it("calls lifecycle.onBeforeRequest's responseCallback callback, waits for it to complete, then resolves promise", () => {
    const deferred = defer();
    const responseCallback = jasmine
      .createSpy("responseCallback")
      .and.returnValue(deferred.promise);
    lifecycle.onBeforeRequest.and.callFake(({ onResponse }) => {
      onResponse(responseCallback);
      return Promise.resolve();
    });
    return testApplyResponseSuccess({
      assertLifecycleCall() {
        expect(responseCallback).toHaveBeenCalledWith({ response });
        deferred.resolve();
      }
    });
  });

  it("calls runOnResponseCallbacks, waits for it to complete, then resolves promise", () => {
    const deferred = defer();
    const runOnResponseCallbacks = jasmine
      .createSpy("runOnResponseCallbacks")
      .and.returnValue(deferred.promise);
    return testApplyResponseSuccess({
      runOnResponseCallbacks,
      assertLifecycleCall() {
        expect(runOnResponseCallbacks).toHaveBeenCalledWith({ response });
        deferred.resolve();
      }
    });
  });

  it("transfers cookies from response before lifecycle.onResponse", () => {
    return applyResponse({
      request,
      responseHeaders,
      responseBody
    }).then(() => {
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
      applyResponse({
        request,
        responseHeaders,
        responseBody,
        runOnResponseCallbacks
      })
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
    return expectAsync(
      applyResponse({ request, responseHeaders, responseBody })
    ).toBeResolvedTo({
      a: 1,
      b: 1,
      c: 2
    });
  });

  it("creates the response with the correct parameters", () => {
    return applyResponse({
      request,
      responseHeaders,
      responseBody
    }).then(() => {
      expect(createResponse).toHaveBeenCalledWith({
        content: responseBody,
        getHeader: jasmine.any(Function)
      });
    });
  });

  it("catches when warnings and errors in response", () => {
    const error = new Error("whoopsie");
    processWarningsAndErrors = jasmine
      .createSpy("processWarningsAndErrors")
      .and.throwError(error);

    applyResponse = injectApplyResponse({
      cookieTransfer,
      lifecycle,
      createResponse,
      processWarningsAndErrors
    });

    const runOnResponseCallbacks = jasmine.createSpy("runOnResponseCallbacks");
    const runOnRequestFailureCallbacks = jasmine.createSpy(
      "runOnRequestFailureCallbacks"
    );

    return applyResponse({
      request,
      responseHeaders,
      responseBody,
      runOnResponseCallbacks,
      runOnRequestFailureCallbacks
    })
      .catch(err => {
        expect(runOnRequestFailureCallbacks).toHaveBeenCalledWith({
          error
        });
        expect(err).toEqual(error);
      })
      .then(() => {});
  });

  it("returns combined result", () => {
    const runOnResponseCallbacks = jasmine
      .createSpy("runOnResponseCallbacks")
      .and.returnValue(Promise.resolve([{ c: 2 }, { h: 9 }, undefined]));

    return applyResponse({
      request,
      responseHeaders,
      responseBody,
      runOnResponseCallbacks
    }).then(result => {
      expect(runOnResponseCallbacks).toHaveBeenCalledWith({ response });
      assertFunctionCallOrder([
        cookieTransfer.responseToCookies,
        lifecycle.onResponse
      ]);
      expect(result).not.toBeNull();
      expect(result).toEqual({ c: 2, h: 9 });
    });
  });
});
