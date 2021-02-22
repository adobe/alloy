import createStoredConsent from "../../../../../src/components/Privacy/createStoredConsent";

describe("Privacy:createStoredConsent", () => {
  let parseConsentCookie;
  const orgId = "myorgid@mycompany";
  let cookieJar;
  let storedConsent;

  beforeEach(() => {
    parseConsentCookie = jasmine.createSpy("parseConsentCookie");
    cookieJar = jasmine.createSpyObj("cookieJar", ["get", "remove"]);
    storedConsent = createStoredConsent({
      parseConsentCookie,
      orgId,
      cookieJar
    });
  });

  it("gets the cookie", () => {
    cookieJar.get.and.returnValue("cookieValue");
    parseConsentCookie.and.returnValue("parsedConsentValue");
    expect(storedConsent.read()).toEqual("parsedConsentValue");
    expect(parseConsentCookie).toHaveBeenCalledWith("cookieValue");
  });

  it("returns empty object if the cookie is not there", () => {
    cookieJar.get.and.returnValue(undefined);
    expect(storedConsent.read()).toEqual({});
    expect(parseConsentCookie).not.toHaveBeenCalled();
  });

  it("uses the correct cookie name", () => {
    storedConsent.read();
    expect(cookieJar.get).toHaveBeenCalledWith(
      "kndctr_myorgid_mycompany_consent"
    );
  });

  it("removes the cookie", () => {
    storedConsent.clear();
    expect(cookieJar.remove).toHaveBeenCalledWith(
      "kndctr_myorgid_mycompany_consent"
    );
  });
});
