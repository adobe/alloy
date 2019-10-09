import implementationDetailsFactory from "../../../../../src/components/Context/implementationDetailsFactory";
import { deepAssign } from "../../../../../src/utils";

describe("Context::implementationDetails", () => {
  const version = "1.2.3";

  it("works", () => {
    const xdm = {};
    deepAssign(xdm, implementationDetailsFactory(version)(xdm));
    expect(xdm).toEqual({
      implementationDetails: {
        name: "https://ns.adobe.com/experience/alloy",
        version: "1.2.3",
        environment: "web"
      }
    });
  });
});
