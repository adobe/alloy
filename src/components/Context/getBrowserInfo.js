export default window => {
  const browserInfo = {};
  browserInfo.resolution = `${window.screen.width}x${window.screen.height}`;
  browserInfo.browserWidth = window.innerWidth;
  browserInfo.browserHeight = window.innerHeight;
  browserInfo.connectionType = window.navigator.connection.effectiveType;

  return browserInfo;
};
