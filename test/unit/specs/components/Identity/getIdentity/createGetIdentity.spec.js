import createGetIdentity from "../../../../../../src/components/Identity/getIdentity/createGetIdentity";

describe("Identity::createGetIdentity", () => {
  let sendEdgeNetworkRequest;
  let createIdentityRequestPayload;
  let createIdentityRequest;
  let requestPayload;
  let request;

  beforeEach(() => {
    sendEdgeNetworkRequest = jasmine.createSpy("sendEdgeNetworkRequest");
    requestPayload = jasmine.createSpyObj(
      "requestPayload",
      ["mergeConfigOverride"],
      {
        type: "payload"
      }
    );
    createIdentityRequestPayload = jasmine
      .createSpy("createIdentityRequestPayload")
      .and.returnValue(requestPayload);
    request = {
      getPayload() {
        return requestPayload;
      }
    };
    createIdentityRequest = jasmine
      .createSpy("createIdentityRequest")
      .and.returnValue(request);
  });

  it("should return a function which calls sendEdgeNetworkRequest", () => {
    const getIdentity = createGetIdentity({
      sendEdgeNetworkRequest,
      createIdentityRequestPayload,
      createIdentityRequest
    });
    getIdentity();
    expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
      request
    });
  });

  it("each getIdentity call should create new payloads and requests", () => {
    const payload1 = { type: "payload1" };
    const payload2 = { type: "payload2" };
    const request1 = { type: "request1" };
    const request2 = { type: "request2" };
    createIdentityRequestPayload.and.returnValues(payload1, payload2);
    createIdentityRequest.and.returnValues(request1, request2);
    const getIdentity = createGetIdentity({
      sendEdgeNetworkRequest,
      createIdentityRequestPayload,
      createIdentityRequest
    });
    getIdentity(["namespace1", "namespace2"]);
    expect(createIdentityRequestPayload).toHaveBeenCalledWith([
      "namespace1",
      "namespace2"
    ]);
    expect(createIdentityRequest).toHaveBeenCalledWith(payload1);
    expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
      request: request1
    });
    getIdentity();
    expect(createIdentityRequest).toHaveBeenCalledWith(payload2);
    expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
      request: request2
    });
  });

  it("send override configuration, when provided", () => {
    const request1 = { type: "request1" };
    createIdentityRequestPayload.and.returnValues(requestPayload);
    createIdentityRequest.and.returnValues(request1);
    const getIdentity = createGetIdentity({
      sendEdgeNetworkRequest,
      createIdentityRequestPayload,
      createIdentityRequest
    });
    const configuration = {
      com_adobe_identity: {
        idSyncContainerId: "123"
      }
    };
    getIdentity(["namespace1"], configuration);
    expect(createIdentityRequestPayload).toHaveBeenCalledWith(["namespace1"]);
    expect(createIdentityRequest).toHaveBeenCalledWith(requestPayload);
    expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
      request: request1
    });
    expect(requestPayload.mergeConfigOverride).toHaveBeenCalledWith({
      com_adobe_identity: {
        idSyncContainerId: configuration.com_adobe_identity.idSyncContainerId
      }
    });
  });
});
