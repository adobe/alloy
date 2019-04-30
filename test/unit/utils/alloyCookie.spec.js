import alloyCookie from "../../../src/utils/alloyCookie";

const removeCookie = name => {
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
};

const removeAllCookies = () => {
  const cookies = document.cookie.split(";");
  cookies.forEach(cookie => {
    removeCookie(cookie.split("=")[0]);
  });
};

describe("alloyCookie", () => {
  afterEach(() => {
    removeAllCookies();
  });
  beforeEach(() => {
    removeAllCookies();
  });

  it("should get an object when ALLOY COOKIE is not present", () => {
    const storedAlloyVals = alloyCookie.get("key1");
    expect(storedAlloyVals).toEqual(jasmine.any(Object));
    expect(storedAlloyVals).toEqual({ key1: undefined });
  });

  it("should parse ALLOY COOKIE and get an Object with passed keys as parameters", () => {
    const alloyCookieString = escape("ECID|1234|AID|234-XYZ|ECIDTS|ABBCD");
    document.cookie = `TEMP_ALLOY_COOKIE=${alloyCookieString}`;

    let storedAlloyVals = alloyCookie.get("ECID");
    expect(storedAlloyVals).toEqual({ ECID: "1234" });

    storedAlloyVals = alloyCookie.get(["ECID", "AID"]);
    expect(storedAlloyVals).toEqual({ ECID: "1234", AID: "234-XYZ" });

    storedAlloyVals = alloyCookie.get(["ECID", "AID"]);
    expect(storedAlloyVals).toEqual({ ECID: "1234", AID: "234-XYZ" });

    storedAlloyVals = alloyCookie.get(["ECID", "AID", "WHATEVER"]);
    expect(storedAlloyVals).toEqual({
      ECID: "1234",
      AID: "234-XYZ",
      WHATEVER: undefined
    });
  });

  it("should set ALLOY COOKIE in pipe separated string format", () => {
    let alloyCookieVals = alloyCookie.set({
      ECID: 4567,
      TARGET: "TARGETID",
      OPTIN: "xyzgh",
      IAB: "ohyGT"
    });
    expect(document.cookie).toBe(
      "TEMP_ALLOY_COOKIE=ECID|4567|TARGET|TARGETID|OPTIN|xyzgh|IAB|ohyGT"
    );
    expect(alloyCookieVals).toEqual({
      ECID: "4567",
      TARGET: "TARGETID",
      OPTIN: "xyzgh",
      IAB: "ohyGT"
    });

    alloyCookieVals = alloyCookie.set({
      TARGET: "NEWTARGETID",
      OPTIN: "NEWxyzgh",
      IAB: "ohy&GT"
    });
    expect(document.cookie).toBe(
      "TEMP_ALLOY_COOKIE=ECID|4567|TARGET|NEWTARGETID|OPTIN|NEWxyzgh|IAB|ohy&GT"
    );
    expect(alloyCookieVals).toEqual({
      ECID: "4567",
      TARGET: "NEWTARGETID",
      OPTIN: "NEWxyzgh",
      IAB: "ohy&GT"
    });
  });
});
