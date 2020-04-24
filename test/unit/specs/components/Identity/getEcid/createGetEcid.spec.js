import createGetEcid from "../../../../../../src/components/Identity/getEcid/createGetEcid";

describe("Identity::createGetEcid", () => {
  let sendEdgeNetworkRequest;
  let createIdentityPayload;
  const samplePayload = {
    myPayload: { methodOne: () => {}, methodTwo: () => {} }
  };
  beforeEach(() => {
    sendEdgeNetworkRequest = jasmine.createSpy("sendEdgeNetworkRequest");
    createIdentityPayload = jasmine
      .createSpy("createIdentityPayload")
      .and.returnValue(samplePayload);
  });
  it("should return a function which calls sendEdgeNetworkRequest", () => {
    const getEcid = createGetEcid({
      sendEdgeNetworkRequest,
      createIdentityPayload
    });
    expect(typeof getEcid).toBe("function");
    getEcid();

    expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
      payload: samplePayload,
      action: "identity/acquire"
    });
  });

  it("Each getEcid call should create a new payload object", () => {
    const payload1 = { type: "payload1" };
    const payload2 = { type: "payload2" };
    createIdentityPayload.and.returnValues(payload1, payload2);
    const getEcid = createGetEcid({
      sendEdgeNetworkRequest,
      createIdentityPayload
    });
    expect(typeof getEcid).toBe("function");
    getEcid();
    expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
      payload: payload1,
      action: "identity/acquire"
    });
    getEcid();
    expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
      payload: payload2,
      action: "identity/acquire"
    });
  });
});
