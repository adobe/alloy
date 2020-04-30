import createGetIdentity from "../../../../../../src/components/Identity/getIdentity/createGetIdentity";

describe("Identity::createGetIdentity", () => {
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
    const getIdentity = createGetIdentity({
      sendEdgeNetworkRequest,
      createIdentityPayload
    });
    expect(typeof getIdentity).toBe("function");
    getIdentity();
    expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
      payload: samplePayload,
      action: "identity/acquire"
    });
  });

  it("Each getIdentity call should create a new payload object", () => {
    const payload1 = { type: "payload1" };
    const payload2 = { type: "payload2" };
    createIdentityPayload.and.returnValues(payload1, payload2);
    const getIdentity = createGetIdentity({
      sendEdgeNetworkRequest,
      createIdentityPayload
    });
    expect(typeof getIdentity).toBe("function");
    getIdentity({ options: ["optionOne", "optionTwo"] });
    expect(createIdentityPayload).toHaveBeenCalledWith({
      options: ["optionOne", "optionTwo"]
    });
    expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
      payload: payload1,
      action: "identity/acquire"
    });
    getIdentity();
    expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
      payload: payload2,
      action: "identity/acquire"
    });
  });
});
