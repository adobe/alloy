import getWeb from "../../../../src/components/Context/webFactory";

describe("Context::getWeb", () => {
  const window = {
    location: { href: "http://mylocation.com" }
  };
  const topFrameSet = {
    document: { referrer: "http://myreferrer.com" }
  };

  it("works", () => {
    expect(getWeb(window, topFrameSet)).toEqual({
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
