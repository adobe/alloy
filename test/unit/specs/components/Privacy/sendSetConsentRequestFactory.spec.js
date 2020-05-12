import sendSetConsentRequestFactory from "../../../../../src/components/Privacy/sendSetConsentRequestFactory";

describe("Privacy:sendSetConsentRequestFactory", () => {
  let createConsentRequestPayload;
  let sendEdgeNetworkRequest;
  let payload;
  let sendSetConsentRequest;

  beforeEach(() => {
    createConsentRequestPayload = jasmine.createSpy(
      "createConsentRequestPayload"
    );
    sendEdgeNetworkRequest = jasmine.createSpy("sendEdgeNetworkRequest");
    payload = jasmine.createSpyObj("payload", ["setConsent"]);
    createConsentRequestPayload.and.returnValue(payload);
    sendSetConsentRequest = sendSetConsentRequestFactory({
      createConsentRequestPayload,
      sendEdgeNetworkRequest
    });
  });

  it("sets consent level and on payload and sends the request", () => {
    sendEdgeNetworkRequest.and.returnValue(Promise.resolve());
    return sendSetConsentRequest("anything").then(resolvedValue => {
      expect(payload.setConsent).toHaveBeenCalledWith("anything");
      expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
        payload,
        action: "privacy/set-consent"
      });
      expect(resolvedValue).toBeUndefined();
    });
  });
});
