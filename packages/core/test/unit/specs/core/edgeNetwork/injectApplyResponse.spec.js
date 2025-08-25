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
import { vi, beforeEach, describe, it, expect } from "vitest";
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
    assertLifecycleCall,
  }) => {
    const successHandler = vi.fn();
    applyResponse({
      request,
      responseHeaders,
      responseBody,
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
    lifecycle = {
      onBeforeRequest: vi.fn().mockReturnValue(Promise.resolve()),
      onRequestFailure: vi.fn().mockReturnValue(Promise.resolve()),
      onResponse: vi.fn().mockReturnValue(Promise.resolve()),
    };
    cookieTransfer = {
      cookiesToPayload: vi.fn(),
      responseToCookies: vi.fn(),
    };
    processWarningsAndErrors = vi.fn();
    request = {
      getId: vi.fn().mockReturnValue("RID123"),
      getAction: vi.fn().mockReturnValue("test-action"),
      getPayload: vi.fn().mockReturnValue({
        type: "payload",
      }),
      getUseIdThirdPartyDomain: vi.fn().mockReturnValue(false),
      getUseSendBeacon: vi.fn().mockReturnValue(false),
    };
    responseHeaders = {
      "x-hello": "yep",
    };
    responseBody = {
      handle: [],
    };
    response = {
      type: "response",
    };
    createResponse = vi.fn().mockReturnValue(response);
    applyResponse = injectApplyResponse({
      cookieTransfer,
      lifecycle,
      createResponse,
      processWarningsAndErrors,
    });
  });
  it("calls lifecycle.onResponse, waits for it to complete, then resolves promise", () => {
    const deferred = defer();
    lifecycle.onResponse.mockReturnValue(deferred.promise);
    return testApplyResponseSuccess({
      assertLifecycleCall() {
        expect(lifecycle.onResponse).toHaveBeenCalledWith({
          response,
        });
        deferred.resolve();
      },
    });
  });
  it("calls lifecycle.onBeforeRequest's responseCallback callback, waits for it to complete, then resolves promise", () => {
    const deferred = defer();
    const responseCallback = vi.fn().mockReturnValue(deferred.promise);
    lifecycle.onBeforeRequest.mockImplementation(({ onResponse }) => {
      onResponse(responseCallback);
      return Promise.resolve();
    });
    return testApplyResponseSuccess({
      assertLifecycleCall() {
        expect(responseCallback).toHaveBeenCalledWith({
          response,
        });
        deferred.resolve();
      },
    });
  });
  it("calls runOnResponseCallbacks, waits for it to complete, then resolves promise", () => {
    const deferred = defer();
    const runOnResponseCallbacks = vi.fn().mockReturnValue(deferred.promise);
    return testApplyResponseSuccess({
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
    return applyResponse({
      request,
      responseHeaders,
      responseBody,
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
      applyResponse({
        request,
        responseHeaders,
        responseBody,
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
      applyResponse({
        request,
        responseHeaders,
        responseBody,
      }),
    ).resolves.toStrictEqual({
      a: 1,
      b: 1,
      c: 2,
    });
  });
  it("creates the response with the correct parameters", () => {
    return applyResponse({
      request,
      responseHeaders,
      responseBody,
    }).then(() => {
      expect(createResponse).toHaveBeenCalledWith({
        content: responseBody,
        getHeader: expect.any(Function),
      });
    });
  });
  it("catches when warnings and errors in response", () => {
    const error = new Error("whoopsie");
    processWarningsAndErrors = vi.fn().mockImplementation(() => {
      throw error;
    });
    applyResponse = injectApplyResponse({
      cookieTransfer,
      lifecycle,
      createResponse,
      processWarningsAndErrors,
    });
    const runOnResponseCallbacks = vi.fn();
    const runOnRequestFailureCallbacks = vi.fn();
    return applyResponse({
      request,
      responseHeaders,
      responseBody,
      runOnResponseCallbacks,
      runOnRequestFailureCallbacks,
    })
      .catch((err) => {
        expect(runOnRequestFailureCallbacks).toHaveBeenCalledWith({
          error,
        });
        expect(err).toEqual(error);
      })
      .then(() => {});
  });
  it("returns combined result", () => {
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
    return applyResponse({
      request,
      responseHeaders,
      responseBody,
      runOnResponseCallbacks,
    }).then((result) => {
      expect(runOnResponseCallbacks).toHaveBeenCalledWith({
        response,
      });
      assertFunctionCallOrder([
        cookieTransfer.responseToCookies,
        lifecycle.onResponse,
      ]);
      expect(result).not.toBeNull();
      expect(result).toEqual({
        c: 2,
        h: 9,
      });
    });
  });
});
