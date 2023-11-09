import assign from "./assign";
import isObject from "./isObject";

export default (...values) => {
  if (values.length < 2) {
    // if the number of args is 0 or 1, just use the default behavior from Object.assign
    return assign(...values);
  }
  return values.reduce((accumulator, currentValue) => {
    if (isObject(currentValue)) {
      Object.keys(currentValue).forEach(key => {
        if (Array.isArray(currentValue[key])) {
          if (Array.isArray(accumulator[key])) {
            accumulator[key].push(...currentValue[key]);
          } else {
            // clone the array so the original isn't modified.
            accumulator[key] = [...currentValue[key]];
          }
        } else {
          accumulator[key] = currentValue[key];
        }
      });
    }
    return accumulator;
  }); // no default value to pass into reduce because we want to skip the first value
};
