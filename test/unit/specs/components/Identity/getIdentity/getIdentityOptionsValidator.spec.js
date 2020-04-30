import getIdentityOptionsValidator from "../../../../../../src/components/Identity/getIdentity/getIdentityOptionsValidator";

describe("Identity::getIdentityOptionsValidator", () => {
  it("should throw an error when invalid options are passed", () => {
    expect(() => {
      getIdentityOptionsValidator({ key: ["item1", "item2"] });
    }).toThrow(new Error("'key': Unknown field."));

    expect(() => {
      getIdentityOptionsValidator({
        key1: ["item1", "item2"],
        key2: ["item1", "item2"]
      });
    }).toThrow(new Error("'key1': Unknown field.\n'key2': Unknown field."));

    expect(() => {
      getIdentityOptionsValidator({ namespaces: [] });
    }).toThrow(
      new Error("'namespaces': Expected a non-empty array, but got ''.")
    );

    expect(() => {
      getIdentityOptionsValidator({ namespaces: ["ACD"] });
    }).toThrow(new Error("'namespaces[0]': Expected ECID, but got 'ACD'."));
  });

  it("should return valid options when no options are passed", () => {
    expect(() => {
      getIdentityOptionsValidator();
    }).not.toThrow();
    const validatedIdentityOptions = getIdentityOptionsValidator();
    expect(validatedIdentityOptions).toEqual({ namespaces: ["ECID"] });
  });

  it("should not throw when supported namespace options are passed", () => {
    const ECID = "ECID";
    expect(() => {
      getIdentityOptionsValidator({ namespaces: [ECID] });
    }).not.toThrow();
  });
});
