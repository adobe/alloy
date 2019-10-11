import { AUTH_STATES } from "../constants";
import {
  isObject,
  includes,
  keys,
  values,
  isBoolean,
  isNil
} from "../../../utils";

const ERROR_MESSAGE = "Invalid customer ID format.";
const NOT_AN_OBJECT_ERROR = "Each namespace should be an object.";
const NO_ID_ERROR = "Each namespace object should have an ID.";
const PRIMARY_NOT_BOOLEAN = "The `primary` property should be true or false.";

const validateCustomerIds = customerIds => {
  if (!isObject(customerIds)) {
    throw new Error(`${ERROR_MESSAGE} ${NOT_AN_OBJECT_ERROR}`);
  }
  keys(customerIds).forEach(customerId => {
    const { primary } = customerIds[customerId];

    if (!isObject(customerIds[customerId])) {
      throw new Error(`${ERROR_MESSAGE} ${NOT_AN_OBJECT_ERROR}`);
    }
    if (!customerIds[customerId].id) {
      throw new Error(`${ERROR_MESSAGE} ${NO_ID_ERROR}`);
    }
    if (!isNil(primary) && !isBoolean(primary)) {
      throw new Error(`${ERROR_MESSAGE} ${PRIMARY_NOT_BOOLEAN}`);
    }
  });
};

const sortObjectKeyNames = object => {
  return keys(object)
    .sort()
    .reduce((newObject, key) => {
      newObject[key] = object[key];
      return newObject;
    }, {});
};

const normalizeCustomerIds = customerIds => {
  const sortedCustomerIds = sortObjectKeyNames(customerIds);
  // TODO: This requires a change to the docs to list the possible values.
  // Alternatively, maybe we should expose the enum on the instance.
  const authStates = values(AUTH_STATES);

  return keys(sortedCustomerIds).reduce((normalizedIds, customerId) => {
    const { id, authenticatedState, primary } = sortedCustomerIds[customerId];

    normalizedIds[customerId] = {
      id,
      authenticatedState: includes(authStates, authenticatedState)
        ? authenticatedState // Set the auth state to the string value like `authenticated`.
        : AUTH_STATES.AMBIGUOUS,
      ...(primary !== undefined && { primary })
    };

    return normalizedIds;
  }, {});
};

export { validateCustomerIds, normalizeCustomerIds };
