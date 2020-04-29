import * as AUTH_STATES from "../constants/authStates";
import { isObject, includes, values, isBoolean, isNil } from "../../../utils";

const ERROR_MESSAGE = "Invalid identity format.";
const NOT_AN_OBJECT_ERROR = "Each namespace should be an object.";
const NO_ID_ERROR = "Each namespace object should have an ID.";
const PRIMARY_NOT_BOOLEAN = "The `primary` property should be true or false.";

const validateIdentities = identities => {
  if (!isObject(identities)) {
    throw new Error(`${ERROR_MESSAGE} ${NOT_AN_OBJECT_ERROR}`);
  }
  Object.keys(identities).forEach(namespace => {
    const { primary } = identities[namespace];

    if (!isObject(identities[namespace])) {
      throw new Error(`${ERROR_MESSAGE} ${NOT_AN_OBJECT_ERROR}`);
    }
    if (!identities[namespace].id) {
      throw new Error(`${ERROR_MESSAGE} ${NO_ID_ERROR}`);
    }
    if (!isNil(primary) && !isBoolean(primary)) {
      throw new Error(`${ERROR_MESSAGE} ${PRIMARY_NOT_BOOLEAN}`);
    }
  });
};

/**
 * Creates a new object where properties are copied from the source object in
 * alphabetical order. This provides consistency between two objects
 * so that when they're hashed, the result is the same if the contents
 * are the same.
 */
const sortObjectKeyNames = object => {
  return Object.keys(object)
    .sort()
    .reduce((newObject, key) => {
      newObject[key] = object[key];
      return newObject;
    }, {});
};

const normalizeIdentities = identities => {
  const sortedIdentities = sortObjectKeyNames(identities);
  // TODO: This requires a change to the docs to list the possible values.
  // Alternatively, maybe we should expose the enum on the instance.
  const authStates = values(AUTH_STATES);

  return Object.keys(sortedIdentities).reduce(
    (normalizedIdentities, namespace) => {
      const { id, authenticatedState, primary } = sortedIdentities[namespace];

      normalizedIdentities[namespace] = {
        id,
        authenticatedState: includes(authStates, authenticatedState)
          ? authenticatedState // Set the auth state to the string value like `authenticated`.
          : AUTH_STATES.AMBIGUOUS
      };

      if (primary !== undefined) {
        normalizedIdentities[namespace].primary = primary;
      }

      return normalizedIdentities;
    },
    {}
  );
};

export { validateIdentities, normalizeIdentities };
