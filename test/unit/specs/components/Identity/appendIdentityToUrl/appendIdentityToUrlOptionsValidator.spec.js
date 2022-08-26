import appendIdentityToUrlOptionsValidator from "../../../../../../src/components/Identity/appendIdentityToUrl/appendIdentityToUrlOptionsValidator";

describe("Identity::appendIdentityToUrlOptionsValidator", () => {
  [
    undefined,
    "myurl",
    {},
    { url: "" },
    { url: "hello", other: "goodbye" }
  ].forEach(param => {
    it(`should throw an error when ${JSON.stringify(param)} is passed`, () => {
      expect(() => {
        appendIdentityToUrlOptionsValidator(param);
      }).toThrowError();
    });
  });

  it("should accept a url", () => {
    expect(
      appendIdentityToUrlOptionsValidator({ url: "http://google.com" })
    ).toEqual({ url: "http://google.com" });
  });

  it("should accept override configuration", () => {
    expect(
      appendIdentityToUrlOptionsValidator({
        url: "http://google.com",
        configuration: { identity: { idSyncContainerId: "123" } }
      })
    ).toEqual({
      url: "http://google.com",
      configuration: { identity: { idSyncContainerId: "123" } }
    });
  });

  it("should accept an empty override configuration", () => {
    expect(
      appendIdentityToUrlOptionsValidator({
        url: "http://google.com",
        configuration: {}
      })
    ).toEqual({
      url: "http://google.com",
      configuration: {}
    });
  });
});
