import * as AUTH_STATES from "../constants/authStates";
import { isObject, includes, values, isBoolean, isNil } from "../../../utils";

const ERROR_MESSAGE = "Invalid user ID format.";
const NOT_AN_OBJECT_ERROR = "Each namespace should be an object.";
const NO_ID_ERROR = "Each namespace object should have an ID.";
const PRIMARY_NOT_BOOLEAN = "The `primary` property should be true or false.";

const validateUserIds = userIds => {
  if (!isObject(userIds)) {
    throw new Error(`${ERROR_MESSAGE} ${NOT_AN_OBJECT_ERROR}`);
  }
  Object.keys(userIds).forEach(userId => {
    const { primary } = userIds[userId];

    if (!isObject(userIds[userId])) {
      throw new Error(`${ERROR_MESSAGE} ${NOT_AN_OBJECT_ERROR}`);
    }
    if (!userIds[userId].id) {
      throw new Error(`${ERROR_MESSAGE} ${NO_ID_ERROR}`);
    }
    if (!isNil(primary) && !isBoolean(primary)) {
      throw new Error(`${ERROR_MESSAGE} ${PRIMARY_NOT_BOOLEAN}`);
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

const normalizeUserIds = userIds => {
  const sortedUserIds = sortObjectKeyNames(userIds);
  // TODO: This requires a change to the docs to list the possible values.
  // Alternatively, maybe we should expose the enum on the instance.
  const authStates = values(AUTH_STATES);

  return Object.keys(sortedUserIds).reduce((normalizedIds, userId) => {
    const { id, authenticatedState, primary } = sortedUserIds[userId];

    normalizedIds[userId] = {
      id,
      authenticatedState: includes(authStates, authenticatedState)
        ? authenticatedState // Set the auth state to the string value like `authenticated`.
        : AUTH_STATES.AMBIGUOUS
    };

    if (primary !== undefined) {
      normalizedIds[userId].primary = primary;
    }

    return normalizedIds;
  }, {});
};

export { validateUserIds, normalizeUserIds };
