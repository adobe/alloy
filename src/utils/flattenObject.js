const isPlainObject = obj =>
  obj !== null &&
  typeof obj === "object" &&
  Object.getPrototypeOf(obj) === Object.prototype;

const flattenObject = (obj, result = {}, keys = []) => {
  Object.keys(obj).forEach(key => {
    if (isPlainObject(obj[key]) || Array.isArray(obj[key])) {
      flattenObject(obj[key], result, [...keys, key]);
    } else {
      result[[...keys, key].join(".")] = obj[key];
    }
  });

  return result;
};

export default obj => {
  if (!isPlainObject(obj)) {
    return obj;
  }

  return flattenObject(obj);
};
