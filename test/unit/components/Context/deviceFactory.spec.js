import deviceFactory from "../../../../src/components/Context/deviceFactory";

describe("Context::deviceFactory", () => {
  let window;

  beforeEach(() => {
    window = {
      screen: {
        width: 600,
        height: 800
      }
    };
  });

  it("handles the happy path", () => {
    window.screen.orientation = { type: "landscape-primary" };
    expect(deviceFactory(window)()).toEqual({
      device: {
        screenHeight: 800,
        screenWidth: 600,
        screenOrientation: "landscape"
      }
    });
  });

  it("handles portrait orientation type", () => {
    window.screen.orientation = { type: "portrait-secondary" };
    expect(deviceFactory(window)().device.screenOrientation).toEqual(
      "portrait"
    );
  });

  it("handles matchMedia queries: portrait", () => {
    window.matchMedia = query => ({
      matches: query === "(orientation: portrait)"
    });
    expect(deviceFactory(window)().device.screenOrientation).toEqual(
      "portrait"
    );
  });

  it("handles matchMedia queries: landscape", () => {
    window.matchMedia = query => ({
      matches: query === "(orientation: landscape)"
    });
    expect(deviceFactory(window)().device.screenOrientation).toEqual(
      "landscape"
    );
  });

  [
    undefined,
    null,
    {},
    { type: "foo" },
    { type: "a-b" },
    { type: null }
  ].forEach(orientation => {
    it(`handles a bad screen orientation: ${JSON.stringify(orientation)}`, () => {
      if (orientation !== undefined) {
        window.screen.orientation = orientation;
      }
      window.matchMedia = () => ({ matches: false });
      expect(
        Object.prototype.hasOwnProperty.call(
          deviceFactory(window)().device,
          "screenOrientation"
        )
      ).toBe(false);
    });
  });
});
