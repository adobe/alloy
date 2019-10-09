import webFactory from "../../../../../src/components/Context/webFactory";
import { deepAssign } from "../../../../../src/utils";

describe("Context::webFactory", () => {
  const window = {
    location: { href: "http://mylocation.com" }
  };
  const topFrameSetProvider = () => {
    return { document: { referrer: "http://myreferrer.com" } };
  };

  it("works", () => {
    const xdm = {};
    deepAssign(xdm, webFactory(window, topFrameSetProvider)(xdm));
    expect(xdm).toEqual({
      web: {
        webPageDetails: {
          URL: "http://mylocation.com"
        },
        webReferrer: {
          URL: "http://myreferrer.com"
        }
      }
    });
  });
});
