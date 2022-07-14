import injectWeb from "../../../../../src/components/Context/injectWeb";

describe("Context::injectWeb", () => {
  const window = {
    location: { href: "http://mylocation.com" },
    document: {
      referrer: "http://myreferrer.com"
    }
  };

  it("works", () => {
    const xdm = {};
    injectWeb(window)(xdm);
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

  it("only populates the referrer once", () => {
    const xdm1 = {};
    const xdm2 = {};
    const web = injectWeb(window);
    web(xdm1);
    web(xdm2);
    expect(xdm2).toEqual({
      web: {
        webPageDetails: {
          URL: "http://mylocation.com"
        }
      }
    });
  });

  it("populates the referrer once for each instance", () => {
    const xdm1 = {};
    const xdm2 = {};
    injectWeb(window)(xdm1);
    injectWeb(window)(xdm2);
    expect(xdm2.web.webReferrer.URL).toEqual("http://myreferrer.com");
  });
});
