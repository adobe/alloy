import isObject from "../isObject";
import assert from "./assertValid";

export default schema => (value, path) => {
  assert(isObject(value), value, path, "an object");

  const errors = [];
  const transformedObject = {};
  Object.keys(schema).forEach(subKey => {
    const subValue = value[subKey];
    const subSchema = schema[subKey];
    const subPath = path ? `${path}.${subKey}` : subKey;
    try {
      const transformedValue = subSchema(subValue, subPath);
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
