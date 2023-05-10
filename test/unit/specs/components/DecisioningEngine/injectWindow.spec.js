import injectWindow from "../../../../../src/components/DecisioningEngine/injectWindow";

describe("DecisioningEngine::injectWindow", () => {
  const window = {
    document: {
      referrer: "https://myreferrer.com"
    },
    location: {
      href: "https://mylocation.com"
    },
    innerWidth: 100,
    innerHeight: 100,
    scrollX: 10,
    scrollY: 10
  };
  it("should return window information", () => {
    const windowInfo = injectWindow(window);
    expect(windowInfo.url).toEqual("https://mylocation.com");
    expect(windowInfo.referrer).toEqual("https://myreferrer.com");
    expect(windowInfo.width).toEqual(100);
    expect(windowInfo.height).toEqual(100);
    expect(windowInfo.scrollX).toEqual(10);
    expect(windowInfo.scrollY).toEqual(10);
  });
});
