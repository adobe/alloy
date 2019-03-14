import { getPageInfo } from "../../../../src/components/Context/page";

describe("Page Info", () => {
  describe("getPageInfo", () => {
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

  describe("getTopFrameSet", () => {
    it("works", () => {
      // TODO
    });
  });
});
