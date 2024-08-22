import createGetEcidFromCookiefrom "../../../../../src/components/Identity/createGetEcidFromCookie";

describe("Identity::createGetEcidFromCookie", () => {
  let cookieValue;
  let cookieJar;
  let getEcidFromCookie;
  beforeEach(() => {
    cookieValue = "CiYxNDAxNTI0NjEzODM4MjI2ODk1MTgwNTkyMTYxNjkxNTc0MzEyOFISCIelhf%5FOMRABGAEqA09SMjAA8AHX%5F4DZlzI%3D";
    cookieJar = jasmine.createSpyObj("cookieJar", {
      get: cookieValue
    });
    getEcidFromCookie = createGetEcidFromCookie({
      config: {
        orgId: "TEST_ORG"
      },
      cookieJar
    });
  });

  it("should return the ecid from the cookie", () => {
    const result = getEcidFromCookie();
    expect(result).toBe("14015246138382268951805921616915743128");
  });
}); 
