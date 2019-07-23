import { AUTH_STATES } from "./constants";
import isObject from "../../utils/isObject";

const validateCustomerIDs = customerIDs => {
  if (!isObject(customerIDs)) {
    throw new Error(
      "Invalid customer ID format. Each namespace should be an object"
    );
  }
  Object.keys(customerIDs).forEach(customerID => {
    if (!isObject(customerIDs[customerID])) {
      throw new Error(
        "Invalid customer ID format. Each namespace should be an object"
      );
    }
    if (!customerIDs[customerID].id) {
      throw new Error(
        "Invalid customer ID format. Each namespace object should have an id"
      );
    }
  });
};
const normalizeCustomerIDs = customerIDs => {
  const normalized = {};
  Object.keys(customerIDs).forEach(customerID => {
    const currentID = customerIDs[customerID];
    normalized[customerID] = { ...currentID };
    if (
      currentID.authState !== AUTH_STATES.AUTHENTICATED ||
      currentID.authState !== AUTH_STATES.LOGGED_OUT
    ) {
      normalized[customerID].authState = AUTH_STATES.UNKNOWN;
    }
  });
  return normalized;
};
const serializeCustomerIDs = customerIDs => {
  return Object.keys(customerIDs)
    .reduce((serialized, customerID) => {
      return `${serialized}${customerID}|${customerIDs[customerID].id}${
        customerIDs[customerID].authState
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
  validateCustomerIDs,
  normalizeCustomerIDs,
  serializeCustomerIDs,
  createHashFromString
};
