import injectSendSetConsentRequest from "../../../../../src/components/Privacy/injectSendSetConsentRequest";

describe("Privacy:injectSendSetConsentRequest", () => {
  let sendEdgeNetworkRequest;
  let requestPayload;
  let request;
  let createConsentRequestPayload;
  let createConsentRequest;
  let sendSetConsentRequest;

  beforeEach(() => {
    sendEdgeNetworkRequest = jasmine.createSpy("sendEdgeNetworkRequest");
    requestPayload = jasmine.createSpyObj("requestPayload", [
      "setConsent",
      "addIdentity",
      "mergeConfigOverride"
    ]);
    createConsentRequestPayload = jasmine
      .createSpy("createConsentRequestPayload")
      .and.returnValue(requestPayload);
    request = {
      getPayload() {
        return requestPayload;
      }
    };
    createConsentRequest = jasmine
      .createSpy("createConsentRequest")
      .and.returnValue(request);
    sendSetConsentRequest = injectSendSetConsentRequest({
      createConsentRequestPayload,
      createConsentRequest,
      sendEdgeNetworkRequest
    });
  });

  it("sets consent level and on requestPayload and sends the request", () => {
    sendEdgeNetworkRequest.and.returnValue(Promise.resolve());
    return sendSetConsentRequest({
      consentOptions: "anything",
      identityMap: {
        a: [{ id: "1" }, { id: "2" }],
        b: [{ id: "3" }]
      }
    }).then(resolvedValue => {
      expect(requestPayload.setConsent).toHaveBeenCalledWith("anything");
      expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
        request
      });
      expect(resolvedValue).toBeUndefined();
      expect(requestPayload.addIdentity).toHaveBeenCalledWith("a", { id: "1" });
      expect(requestPayload.addIdentity).toHaveBeenCalledWith("a", { id: "2" });
      expect(requestPayload.addIdentity).toHaveBeenCalledWith("b", { id: "3" });
    });
  });

  it("sets the configuration overrides on the payload, if provided", () => {
    sendEdgeNetworkRequest.and.returnValue(Promise.resolve());
    return sendSetConsentRequest({
      consentOptions: "anything",
      identityMap: {
        a: [{ id: "1" }, { id: "2" }],
        b: [{ id: "3" }]
      },
      edgeConfigOverrides: {
        com_adobe_identity: {
          idSyncContainerId: "123"
        }
      }
    }).then(() => {
      expect(requestPayload.setConsent).toHaveBeenCalledWith("anything");
      expect(requestPayload.mergeConfigOverride).toHaveBeenCalledWith({
        com_adobe_identity: {
          idSyncContainerId: "123"
        }
      });
    });
  });
});
