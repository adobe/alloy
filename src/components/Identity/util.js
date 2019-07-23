import { AUTH_STATES } from "./constants";
import isObject from "../../utils/isObject";

const ERROR_MESSAGE  = "Invalid customer Id format.";
const NOT_AN_OBJECT_ERROR = "Each namespace should be an object.";
const NO_ID_ERROR = "Each namespace object should have an id.";
const validateCustomerIds = customerIds => {
  if (!isObject(customerIds)) {
    throw new Error(
      `${ERROR_MESSAGE} ${NOT_AN_OBJECT_ERROR}`
    );
  }
  Object.keys(customerIds).forEach(customerId => {
    if (!isObject(customerIds[customerId])) {
      throw new Error(
        `${ERROR_MESSAGE} ${NOT_AN_OBJECT_ERROR}`
      );
    }
    if (!customerIds[customerId].id) {
      throw new Error(
        `${ERROR_MESSAGE} ${NO_ID_ERROR}`
      );
    }
  });
};
const normalizeCustomerIds = customerIds => {
  const normalized = {};
  Object.keys(customerIds).forEach(customerId => {
    const currentId = customerIds[customerId];
    normalized[customerId] = { ...currentId };
    if (
      currentId.authState !== AUTH_STATES.AUTHENTICATED ||
      currentId.authState !== AUTH_STATES.LOGGED_OUT
    ) {
      normalized[customerId].authState = AUTH_STATES.UNKNOWN;
    }
  });
  return normalized;
};
const serializeCustomerIds = customerIds => {
  return Object.keys(customerIds)
    .reduce((serialized, customerId) => {
      return `${serialized}${customerId}|${customerIds[customerId].id}${
        customerIds[customerId].authState
      }|`;
    }, "")
    .slice(0, -1);
};

const createHashFromString = string => {
  return [...string]
    .map(char => char.charCodeAt(0))
    .reduce((hash, charCode) => {
      const shift = (hash << 5) - hash + charCode; // eslint-disable-line no-bitwise
      return shift & shift; // eslint-disable-line no-bitwise
    }, 0);
};

export {
  validateCustomerIds,
  normalizeCustomerIds,
  serializeCustomerIds,
  createHashFromString
};
