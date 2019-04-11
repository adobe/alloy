const getScreenOrientationViaProperty = window => {
  const {
    screen: { orientation }
  } = window;

  if (orientation == null || orientation.type == null) {
    return null;
  }

  const parts = orientation.type.split("-");

  if (parts.length === 0) {
    return null;
  }

  if (parts[0] !== "portrait" && parts[0] !== "landscape") {
    return null;
  }

  return parts[0];
};

const getScreenOrientationViaMediaQuery = window => {
  if (window.matchMedia("(orientation: portrait)").matches) {
    return "portrait";
  }
  if (window.matchMedia("(orientation: landscape)").matches) {
    return "landscape";
  }

  return null;
};

export default window => {
  return () => {
    const {
      screen: { width, height }
    } = window;
    const device = {
      screenHeight: height,
      screenWidth: width
    };

    const orientation =
      getScreenOrientationViaProperty(window) ||
      getScreenOrientationViaMediaQuery(window);
    if (orientation) {
      device.screenOrientation = orientation;
    }
    return { device };
  };
};
