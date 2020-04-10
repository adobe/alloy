import createGetEcid from "../../../../../../src/components/Identity/getEcid/createGetEcid";

describe("Identity::createGetEcid", () => {
  let sendEdgeNetworkRequest;
  beforeEach(() => {
    sendEdgeNetworkRequest = jasmine.createSpy();
  });
  it("should return a function which calls sendEdgeNetworkRequest", () => {
    const getEcid = createGetEcid({ sendEdgeNetworkRequest });
    expect(typeof getEcid).toBe("function");
    getEcid();

    expect(sendEdgeNetworkRequest).toHaveBeenCalledWith(
      jasmine.objectContaining({
        payload: jasmine.any(Object),
        action: "identity/acquire"
      })
    );
  });
});
