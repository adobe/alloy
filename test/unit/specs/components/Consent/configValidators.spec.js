import configValidators from "../../../../../src/components/Consent/configValidators.js";

describe("defaultConsent", () => {
  it("validates defaultConsent=undefined", () => {
    const config = configValidators({});
    expect(config.defaultConsent).toEqual("in");
  });
  it("validates defaultConsent={}", () => {
    expect(() => {
      configValidators({
        defaultConsent: {},
      });
    }).toThrowError();
  });
  it("validates defaultConsent='in'", () => {
    const config = configValidators({
      defaultConsent: "in",
    });
    expect(config.defaultConsent).toEqual("in");
  });
  it("validates defaultConsent='pending'", () => {
    const config = configValidators({
      defaultConsent: "pending",
    });
    expect(config.defaultConsent).toEqual("pending");
  });
  it("validates defaultConsent=123", () => {
    expect(() => {
      configValidators({ defaultConsent: 123 });
    }).toThrowError();
  });
  it("validates defaultConsent='out'", () => {
    const config = configValidators({
      defaultConsent: "out",
    });
    expect(config.defaultConsent).toEqual("out");
  });
});
