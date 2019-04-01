import getPageInfo from "../../../../src/components/Context/getPageInfo";

describe("Context::getPageInfo", () => {
  const window = {
    location: { href: "http://mylocation.com" }
  };
  const topFrameSet = {
    document: { referrer: "http://myreferrer.com" }
  };

  it("works", () => {
    expect(getPageInfo(window, topFrameSet)).toEqual({
      pageURL: "http://mylocation.com",
      referrer: "http://myreferrer.com"
    });
  });
});
