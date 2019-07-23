import deviceFactory from "../../../../../src/components/Context/deviceFactory";

describe("Context::deviceFactory", () => {
  let window;
  let event;

  beforeEach(() => {
    window = {
      screen: {
        width: 600,
        height: 800
      }
    };
    event = jasmine.createSpyObj("event", ["mergeDevice"]);
  });

  it("handles the happy path", () => {
    window.screen.orientation = { type: "landscape-primary" };
    deviceFactory(window)(event);
    expect(event.mergeDevice).toHaveBeenCalledWith({
      screenHeight: 800,
      screenWidth: 600,
      screenOrientation: "landscape"
    });
  });

  it("handles portrait orientation type", () => {
    window.screen.orientation = { type: "portrait-secondary" };
    deviceFactory(window)(event);
    expect(event.mergeDevice).toHaveBeenCalledWith({
      screenHeight: 800,
      screenWidth: 600,
      screenOrientation: "portrait"
    });
  });

  it("handles matchMedia queries: portrait", () => {
    window.matchMedia = query => ({
      matches: query === "(orientation: portrait)"
    });
    deviceFactory(window)(event);
    expect(event.mergeDevice).toHaveBeenCalledWith({
      screenHeight: 800,
      screenWidth: 600,
      screenOrientation: "portrait"
    });
  });

  it("handles matchMedia queries: landscape", () => {
    window.matchMedia = query => ({
      matches: query === "(orientation: landscape)"
    });
    deviceFactory(window)(event);
    expect(event.mergeDevice).toHaveBeenCalledWith({
      screenHeight: 800,
      screenWidth: 600,
      screenOrientation: "landscape"
    });
  });

  [
    undefined,
    null,
    {},
    { type: "foo" },
    { type: "a-b" },
    { type: null }
  ].forEach(orientation => {
    it(`handles a bad screen orientation: ${JSON.stringify(
      orientation
    )}`, () => {
      if (orientation !== undefined) {
        window.screen.orientation = orientation;
      }
      window.matchMedia = () => ({ matches: false });
      deviceFactory(window)(event);
      expect(event.mergeDevice).toHaveBeenCalledWith({
        screenHeight: 800,
        screenWidth: 600
      });
    });
  });
});
