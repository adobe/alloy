/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

import isObject from "./isObject";

const isObjectObject = o => {
  return (
    isObject(o) === true &&
    Object.prototype.toString.call(o) === "[object Object]"
  );
};

/**
 * Determines if the value is an object created by the object
 * constructor.
 * @param value
 * @returns {boolean}
 */
export default value => {
  if (isObjectObject(value) === false) return false;

  // If has modified constructor
  const ctor = value.constructor;
  if (typeof ctor !== "function") return false;

  // If has modified prototype
  const prot = ctor.prototype;
  if (isObjectObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  // eslint-disable-next-line no-prototype-builtins
  if (prot.hasOwnProperty("isPrototypeOf") === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
};
