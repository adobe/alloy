import injectGetLocationHint from "../../../../../src/core/edgeNetwork/injectGetLocationHint";

describe("injectGetLocationHint", () => {
  let cookieJar;
  let orgId;
  let getLocationHint;

  beforeEach(() => {
    cookieJar = jasmine.createSpyObj("cookieJar", ["get"]);
    orgId = "myorg@AdobeOrg";
    getLocationHint = injectGetLocationHint({ orgId, cookieJar });
  });

  it("returns the cluster cookie", () => {
    cookieJar.get.and.returnValue("mycluster");
    expect(getLocationHint()).toEqual("mycluster");
  });

  it("generates the correct cookie name", () => {
    cookieJar.get.and.returnValue("mycluster");
    getLocationHint();
    expect(cookieJar.get).toHaveBeenCalledOnceWith(
      "kndctr_myorg_AdobeOrg_cluster"
    );
  });

  it("doesn't cache the result", () => {
    cookieJar.get.and.returnValues("cluster1", "cluster2");
    expect(getLocationHint()).toEqual("cluster1");
    expect(getLocationHint()).toEqual("cluster2");
  });

  it("returns mbox edge cluster cookie", () => {
    cookieJar.get.and.returnValues(undefined, "35");
    expect(getLocationHint()).toEqual("t35");
  });

  it("returns undefined", () => {
    expect(getLocationHint()).toBeUndefined();
  });
});
