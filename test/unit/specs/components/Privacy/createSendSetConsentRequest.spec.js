import createSendSetConsentRequest from "../../../../../src/components/Privacy/createSendSetConsentRequest";
import { defer } from "../../../../../src/utils";
import flushPromiseChains from "../../../helpers/flushPromiseChains";

describe("Privacy:createSendSetConsentRequest", () => {
  let lifecycle;
  let createConsentRequestPayload;
  let sendEdgeNetworkRequest;
  let payload;
  let sendSetConsentRequest;

  beforeEach(() => {
    lifecycle = jasmine.createSpyObj("lifecycle", ["onBeforeConsentRequest"]);
    createConsentRequestPayload = jasmine.createSpy(
      "createConsentRequestPayload"
    );
    sendEdgeNetworkRequest = jasmine.createSpy("sendEdgeNetworkRequest");
    payload = jasmine.createSpyObj("payload", ["setConsentLevel"]);
    createConsentRequestPayload.and.returnValue(payload);
    sendSetConsentRequest = createSendSetConsentRequest({
      lifecycle,
      createConsentRequestPayload,
      sendEdgeNetworkRequest
    });
  });

  it("calls onBeforeConsentRequest and sends the request", () => {
    const deferred = defer();
    lifecycle.onBeforeConsentRequest.and.returnValue(deferred.promise);
    sendEdgeNetworkRequest.and.returnValue(Promise.resolve());
    const returnedPromise = sendSetConsentRequest({ general: "in" });
    expect(lifecycle.onBeforeConsentRequest).toHaveBeenCalledWith({ payload });
    return flushPromiseChains()
      .then(() => {
        expect(sendEdgeNetworkRequest).not.toHaveBeenCalled();
        deferred.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(payload.setConsentLevel).toHaveBeenCalledWith({ general: "in" });
        expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
          payload,
          action: "privacy/set-consent"
        });
        return returnedPromise;
      })
      .then(resolvedValue => {
        expect(resolvedValue).toBeUndefined();
      });
  });
});
