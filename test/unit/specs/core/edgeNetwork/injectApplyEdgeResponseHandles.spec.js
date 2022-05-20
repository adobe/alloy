import injectApplyEdgeResponseHandles from "../../../../../src/core/edgeNetwork/injectApplyEdgeResponseHandles";
import assertFunctionCallOrder from "../../../helpers/assertFunctionCallOrder";

describe("injectApplyEdgeResponseHandles", () => {
  let lifecycle;
  let cookieTransfer;
  let createResponse;
  let request;
  let response;
  let handles;

  beforeEach(() => {
    lifecycle = jasmine.createSpyObj("lifecycle", {
      onBeforeRequest: Promise.resolve(),
      onRequestFailure: Promise.resolve(),
      onResponse: Promise.resolve()
    });
    cookieTransfer = jasmine.createSpyObj("cookieTransfer", [
      "cookiesToPayload",
      "responseToCookies",
      "getPathFromCookie"
    ]);

    request = jasmine.createSpyObj("request", {
      getId: "RID123",
      getAction: "test-action",
      getPayload: {
        type: "payload"
      },
      getUseIdThirdPartyDomain: false,
      getUseSendBeacon: false
    });
  });

  it("works", () => {
    handles = [];

    response = { type: "response" };

    createResponse = jasmine
      .createSpy("createResponse")
      .and.returnValue(response);

    const applyEdgeResponseHandles = injectApplyEdgeResponseHandles({
      cookieTransfer,
      lifecycle,
      createResponse
    });

    const runOnResponseCallbacks = jasmine
      .createSpy("runOnResponseCallbacks")
      .and.returnValue(Promise.resolve([{ c: 2 }, { h: 9 }, undefined]));

    return applyEdgeResponseHandles({
      request,
      handles,
      runOnResponseCallbacks
    }).then(result => {
      expect(runOnResponseCallbacks).toHaveBeenCalledWith({ response });
      assertFunctionCallOrder([
        cookieTransfer.responseToCookies,
        lifecycle.onResponse
      ]);
      expect(result).not.toBeNull();
    });
  });
});
