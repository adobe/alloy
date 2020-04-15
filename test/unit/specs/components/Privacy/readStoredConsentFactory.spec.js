import readStoredConsentFactory from "../../../../../src/components/Privacy/readStoredConsentFactory";

describe("Privacy:readStoredConsentFactory", () => {
  let parseConsentCookie;
  const orgId = "myorgid@mycompany";
  let cookieJar;
  let readStoredConsent;

  beforeEach(() => {
    parseConsentCookie = jasmine.createSpy("parseConsentCookie");
    cookieJar = jasmine.createSpyObj("cookieJar", ["get"]);
    readStoredConsent = readStoredConsentFactory({
      parseConsentCookie,
      orgId,
      cookieJar
    });
  });

  it("gets the cookie", () => {
    cookieJar.get.and.returnValue("cookieValue");
    parseConsentCookie.and.returnValue("parsedConsentValue");
    expect(readStoredConsent()).toEqual("parsedConsentValue");
    expect(parseConsentCookie).toHaveBeenCalledWith("cookieValue");
  });

  it("returns {} if the cookie is not there", () => {
    cookieJar.get.and.returnValue(undefined);
    expect(readStoredConsent()).toEqual({});
    expect(parseConsentCookie).not.toHaveBeenCalled();
  });

  it("uses the correct cookie name", () => {
    readStoredConsent();
    expect(cookieJar.get).toHaveBeenCalledWith(
      "kndctr_myorgid_mycompany_consent"
    );
  });
});
