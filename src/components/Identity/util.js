import { AUTH_STATES } from "./constants";
import {
  isObject,
  values,
  includes,
  bufferToHex,
  sha256Buffer
} from "../../utils";

const ERROR_MESSAGE = "Invalid customer ID format.";
const NOT_AN_OBJECT_ERROR = "Each namespace should be an object.";
const NO_ID_ERROR = "Each namespace object should have an ID.";

const validateCustomerIds = customerIds => {
  if (!isObject(customerIds)) {
    throw new Error(`${ERROR_MESSAGE} ${NOT_AN_OBJECT_ERROR}`);
  }
  Object.keys(customerIds).forEach(customerId => {
    if (!isObject(customerIds[customerId])) {
      throw new Error(`${ERROR_MESSAGE} ${NOT_AN_OBJECT_ERROR}`);
    }
    if (!customerIds[customerId].id) {
      throw new Error(`${ERROR_MESSAGE} ${NO_ID_ERROR}`);
    }
  });
};

const sortObjectKeyNames = object => {
  return Object.keys(object)
    .sort()
    .reduce((newObject, key) => {
      newObject[key] = object[key];
      return newObject;
    }, {});
};

const normalizeCustomerIds = customerIds => {
  const sortedCustomerIds = sortObjectKeyNames(customerIds);
  return Object.keys(sortedCustomerIds).reduce((normalizedIds, customerId) => {
    const { id, authState } = sortedCustomerIds[customerId];
    const authStates = values(AUTH_STATES);
    normalizedIds[customerId] = {
      id,
      authState: includes(authStates, authState)
        ? authState
        : AUTH_STATES.UNKNOWN
    };
    return normalizedIds;
  }, {});
};

export { validateCustomerIds, normalizeCustomerIds, bufferToHex, sha256Buffer };
