import { AUTH_STATES } from "./constants";
import { isObject, values, includes } from "../../utils";

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

const bufferToHex = buffer => {
  return Array.prototype.map
    .call(new Uint8Array(buffer), item => `00${item.toString(16)}`.slice(-2))
    .join("");
};

const encodeText = str => {
  if (window.TextEncoder) {
    return new TextEncoder("utf-8").encode(str);
  }
  // IE 11, which doesn't have TextEncoder
  const cleanString = unescape(encodeURIComponent(str));
  return new Uint8Array(cleanString.split("").map(char => char.charCodeAt(0)));
};

const sha256Buffer = message => {
  const data = encodeText(message);
  const crypto = window.msCrypto || window.crypto;
  const result = crypto.subtle.digest("SHA-256", data);
  if (result.then) {
    return result;
  }
  // IE 11, whose result is a CryptoOperation object instead of a promise
  return new Promise((resolve, reject) => {
    result.addEventListener("complete", () => {
      resolve(result.result);
    });
    result.addEventListener("error", () => {
      reject();
    });
  });
};

export { validateCustomerIds, normalizeCustomerIds, bufferToHex, sha256Buffer };
