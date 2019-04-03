import getWeb from "../../../../src/components/Context/webFactory";

describe("Context::getWeb", () => {
  const window = {
    location: { href: "http://mylocation.com" }
  };
  const topFrameSetProvider = () => {
    return { document: { referrer: "http://myreferrer.com" } };
  };

  it("works", () => {
    expect(getWeb(window, topFrameSetProvider)()).toEqual({
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
