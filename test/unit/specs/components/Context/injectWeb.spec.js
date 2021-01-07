import injectWeb from "../../../../../src/components/Context/injectWeb";

describe("Context::injectWeb", () => {
  it("works", () => {
    const window = {
      location: { href: "http://mylocation.com?campaign=123|456" },
      document: {
        referrer: "http://myreferrer.com?product=123|456"
      }
    };
    const xdm = {};
    injectWeb(window)(xdm);
    expect(xdm).toEqual({
      web: {
        webPageDetails: {
          URL: "http://mylocation.com?campaign=123%7C456"
        },
        webReferrer: {
          URL: "http://myreferrer.com?product=123%7C456"
        }
      }
    });
  });

  it("does not double encode URLs", () => {
    const window = {
      location: { href: "http://mylocation.com?campaign=123%7C456" },
      document: {
        referrer: "http://myreferrer.com?product=123%7C456"
      }
    };
    const xdm = {};
    injectWeb(window)(xdm);
    expect(xdm).toEqual({
      web: {
        webPageDetails: {
          URL: "http://mylocation.com?campaign=123%7C456"
        },
        webReferrer: {
          URL: "http://myreferrer.com?product=123%7C456"
        }
      }
    });
  });
});
