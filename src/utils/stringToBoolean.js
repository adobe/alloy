import isString from "./isString";

export default str => {
  return isString(str) && (str.toLowerCase() === "true" || str === "1");
};
