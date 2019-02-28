import window from "@adobe/reactor-window";

export const getBrowserInfo = w => {
  const browserInfo = {};
  browserInfo.resolution = `${w.screen.width}x${w.screen.height}`;
  browserInfo.browserWidth = w.innerWidth;
  browserInfo.browserHeight = w.innerHeight;
  browserInfo.connectionType = w.navigator.connection.effectiveType;

  return browserInfo;
};

export default () => {
  return getBrowserInfo(window);
};
