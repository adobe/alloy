import webFactory from "../../../../../src/components/Context/webFactory";

describe("Context::webFactory", () => {
  const window = {
    location: { href: "http://mylocation.com" },
    top: {
      document: {
        referrer: "http://myreferrer.com"
      }
    }
  };

  it("works", () => {
    const xdm = {};
    webFactory(window)(xdm);
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
