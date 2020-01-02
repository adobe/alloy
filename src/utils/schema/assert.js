export default (isValid, path, value, message) => {
  if (value != null && !isValid) {
    throw new Error(`'${path}': Expected ${message}, but got '${value}'.`);
  }
  return value;
};
