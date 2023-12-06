export default (win = window) => {
  const { targetGlobalSettings = {} } = win;

  return targetGlobalSettings;
};
