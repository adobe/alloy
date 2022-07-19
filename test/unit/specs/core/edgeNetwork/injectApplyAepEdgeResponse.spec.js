import injectApplyAepEdgeResponse from "../../../../../src/core/edgeNetwork/injectApplyAepEdgeResponse";
import assertFunctionCallOrder from "../../../helpers/assertFunctionCallOrder";
import { defer } from "../../../../../src/utils";
import flushPromiseChains from "../../../helpers/flushPromiseChains";

describe("injectApplyAepEdgeResponse", () => {
  let lifecycle;
  let cookieTransfer;
  let processWarningsAndErrors;
  let createResponse;
  let applyAepEdgeResponse;
  let request;
  let response;
  let responseHeaders;
  let responseBody;

  const testApplyResponseSuccess = ({
    runOnResponseCallbacks,
    assertLifecycleCall
  }) => {
    const successHandler = jasmine.createSpy("successHandler");
    applyAepEdgeResponse({
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

    applyAepEdgeResponse = injectApplyAepEdgeResponse({
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
    return applyAepEdgeResponse({
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
      applyAepEdgeResponse({
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
      applyAepEdgeResponse({ request, responseHeaders, responseBody })
    ).toBeResolvedTo({
      a: 1,
      b: 1,
      c: 2
    });
  });

  it("creates the response with the correct parameters", () => {
    return applyAepEdgeResponse({
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

    applyAepEdgeResponse = injectApplyAepEdgeResponse({
      cookieTransfer,
      lifecycle,
      createResponse,
      processWarningsAndErrors
    });

    const runOnResponseCallbacks = jasmine.createSpy("runOnResponseCallbacks");
    const runOnRequestFailureCallbacks = jasmine.createSpy(
      "runOnRequestFailureCallbacks"
    );

    return applyAepEdgeResponse({
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

    return applyAepEdgeResponse({
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
