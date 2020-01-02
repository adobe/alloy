import assign from "../assign";

export default (first, second, additionalMethods = {}) => {
  const newSchema = (path, value) => {
    return second(path, first(path, value));
  };
  assign(newSchema, first, additionalMethods);
  return newSchema;
};
