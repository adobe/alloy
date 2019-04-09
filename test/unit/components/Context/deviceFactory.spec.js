import deviceFactory from "../../../../src/components/Context/deviceFactory";

describe("Context::deviceFactory", () => {
  const window = {
    screen: {
      width: 1001,
      height: 1002,
      orientation: { type: "landscape-primary" }
    }
  };

  const nullOrientationWindow = {
    screen: {
      width: 600,
      height: 800,
      orientation: {}
    }
  };

  it("works", () => {
    expect(deviceFactory(window)()).toEqual({
      device: {
        screenHeight: 1002,
        screenWidth: 1001,
        screenOrientation: "landscape"
      }
    });
  });

  it("handles null screen orientation", () => {
    expect(deviceFactory(nullOrientationWindow)()).toEqual({
      device: {
        screenHeight: 800,
        screenWidth: 600
      }
    });
  });
});
