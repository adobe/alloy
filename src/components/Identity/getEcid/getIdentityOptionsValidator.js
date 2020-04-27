import { objectOf, literal, arrayOf } from "../../../utils/validation";
/**
 * Verifies user provided event options.
 * @param {*} options The user event options to validate
 * @returns {*} Validated options
 */
export default options => {
  const getIdentityOptionsValidator = objectOf({
    namespaces: arrayOf(literal(["ECID"])).nonEmpty()
  }).noUnknownFields();
  getIdentityOptionsValidator(options);
  // Return default options for now
  // To-Do: Accept namespace from given options
  return {
    namespaces: ["ECID"]
  };
};
