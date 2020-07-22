import injectSendSetConsentRequest from "../../../../../src/components/Privacy/injectSendSetConsentRequest";

describe("Privacy:injectSendSetConsentRequest", () => {
  let createConsentRequestPayload;
  let sendEdgeNetworkRequest;
  let payload;
  let sendSetConsentRequest;

  beforeEach(() => {
    createConsentRequestPayload = jasmine.createSpy(
      "createConsentRequestPayload"
    );
    sendEdgeNetworkRequest = jasmine.createSpy("sendEdgeNetworkRequest");
    payload = jasmine.createSpyObj("payload", ["setConsent", "addIdentity"]);
    createConsentRequestPayload.and.returnValue(payload);
    sendSetConsentRequest = injectSendSetConsentRequest({
      createConsentRequestPayload,
      sendEdgeNetworkRequest
    });
  });

  it("sets consent level and on payload and sends the request", () => {
    sendEdgeNetworkRequest.and.returnValue(Promise.resolve());
    return sendSetConsentRequest({
      consentOptions: "anything",
      identityMap: {
        a: [{ id: "1" }, { id: "2" }],
        b: [{ id: "3" }]
      }
    }).then(resolvedValue => {
      expect(payload.setConsent).toHaveBeenCalledWith("anything");
      expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
        payload,
        action: "privacy/set-consent"
      });
      expect(resolvedValue).toBeUndefined();
      expect(payload.addIdentity).toHaveBeenCalledWith("a", { id: "1" });
      expect(payload.addIdentity).toHaveBeenCalledWith("a", { id: "2" });
      expect(payload.addIdentity).toHaveBeenCalledWith("b", { id: "3" });
    });
  });
});
