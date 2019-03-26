const getScreenOrientation = window => {
  const { screen } = window;
  const { orientation, width, height } = screen;

  if (orientation == null) {
    return width > height ? "landscape" : "portrait";
  }

  if (orientation.type == null) {
    return null;
  }

  const parts = orientation.type.split("-");

  if (parts.length === 0) {
    return null;
  }

  return parts[0] || null;
};

export default window => {
  const {
    screen: { width, height }
  } = window;
  const orientation = getScreenOrientation(window);

  return {
    "xdm:device": {
      "xdm:screenHeight": height,
      "xdm:screenWidth": width,
      "xdm:screenOrientation": orientation
    }
  };
};
