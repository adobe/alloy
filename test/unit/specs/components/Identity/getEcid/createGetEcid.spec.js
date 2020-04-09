import createGetEcid from "../../../../../../src/components/Identity/getEcid/createGetEcid";
import { defer } from "../../../../../../src/utils";
import flushPromiseChains from "../../../../helpers/flushPromiseChains";

describe("Identity::createGetEcid", () => {
  let consentDeferred;
  let consent;
  let sendEdgeNetworkRequest;
  beforeEach(() => {
    sendEdgeNetworkRequest = jasmine.createSpy();
    consentDeferred = defer();
    consent = jasmine.createSpyObj("consent", {
      awaitConsent: consentDeferred.promise
    });
  });
  it("should return a function which calls sendEdgeNetworkRequest when consent is given", () => {
    const getEcid = createGetEcid({ sendEdgeNetworkRequest, consent });
    expect(typeof getEcid).toBe("function");
    getEcid();
    return flushPromiseChains()
      .then(() => {
        expect(sendEdgeNetworkRequest).not.toHaveBeenCalled();
        consentDeferred.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(sendEdgeNetworkRequest).toHaveBeenCalledWith(
          jasmine.objectContaining({
            payload: jasmine.any(Object),
            action: "identity/acquire"
          })
        );
      });
  });
});
