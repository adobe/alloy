export default defaultValue => (path, value) => {
  if (value == null) {
    return defaultValue;
  }
  return value;
};
