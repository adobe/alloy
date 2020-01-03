import isObject from "../isObject";
import assert from "./assert";

export default schema => (path, value) => {
  if (value == null) {
    return value;
  }
  assert(isObject(value), path, value, "an object");

  const errors = [];
  const transformedObject = {};
  Object.keys(schema).forEach(subKey => {
    const subValue = value[subKey];
    const subSchema = schema[subKey];
    const subPath = path ? `${path}.${subKey}` : subKey;
    try {
      const transformedValue = subSchema(subPath, subValue);
      if (transformedValue !== undefined) {
        transformedObject[subKey] = transformedValue;
      }
    } catch (e) {
      errors.push(e.message);
    }
  });

  if (errors.length) {
    throw new Error(errors.join("\n"));
  }
  return transformedObject;
};
