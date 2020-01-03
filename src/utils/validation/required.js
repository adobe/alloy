export default (path, value) => {
  if (value == null) {
    throw new Error(`'${path}' is a required option`);
  }
  return value;
};
