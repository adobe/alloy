import webFactory from "../../../../src/components/Context/webFactory";

describe("Context::webFactory", () => {
  const window = {
    location: { href: "http://mylocation.com" }
  };
  const topFrameSetProvider = () => {
    return { document: { referrer: "http://myreferrer.com" } };
  };
  let addedWeb;
  const payload = {
    addWeb(web) {
      addedWeb = web;
    }
  };

  it("works", () => {
    webFactory(window, topFrameSetProvider)(payload);
    expect(addedWeb).toEqual({
      webPageDetails: {
        URL: "http://mylocation.com"
      },
      webReferrer: {
        URL: "http://myreferrer.com"
      }
    });
  });
});
