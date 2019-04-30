import cookie from "./cookie";

const COOKIE_NAME = "TEMP_ALLOY_COOKIE";
const COOKIE_EXPIRY = 7;

const getKeyValPair = pipedString => {
  const keyVals = {};
  pipedString.replace(/([^=|]+)\|([^|]*)/g, (match, key, val) => {
    keyVals[key] = val;
  });
  return keyVals;
};

const createPipedString = keyVals => {
  let pipedString = "";

  Object.keys(keyVals).forEach(element => {
    pipedString += `${element}|${keyVals[element]}|`;
  });
  // removing the last pipe
  return pipedString.slice(0, -1);
};

/* Export two functions get and set
    get: 
    Accepts a string or an array of strings
    returns an object with keys as the requested string and their values

    set:
    Accepts an Object with Keys and values to beb stored in alloy cookie
    Sets the cookie with keys and values separated by pipe
    Example: "KEY1|VAL1|KEY2|VAL2"
*/

export default {
  get: keys => {
    const storedData = cookie.get(COOKIE_NAME);

    const storedDataAsKeyVals = storedData ? getKeyValPair(storedData) : {};
    const keysArray = Array.isArray(keys) ? keys : [keys];

    return keysArray.reduce((selected, key) => {
      return {
        ...selected,
        [key]: storedDataAsKeyVals[key]
      };
    }, {});
  },
  set: keyVals => {
    const storedData = cookie.get(COOKIE_NAME);
    const storedDataAsKeyVals = storedData ? getKeyValPair(storedData) : {};
    Object.keys(keyVals).forEach(element => {
      storedDataAsKeyVals[element] = String(keyVals[element]);
    });
    const cookieVal = createPipedString(storedDataAsKeyVals);
    cookie.set(COOKIE_NAME, cookieVal, { expires: COOKIE_EXPIRY });
    return storedDataAsKeyVals;
  }
};
