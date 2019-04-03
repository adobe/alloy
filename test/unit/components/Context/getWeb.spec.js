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
      "xdm:web": {
        "xdm:webPageDetails": {
          "xdm:URL": "http://mylocation.com"
        },
        "xdm:webReferrer": {
          "xdm:URL": "http://myreferrer.com"
        }
      }
    });
  });
});
