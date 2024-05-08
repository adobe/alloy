/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import isNil from "./isNil.js";
import isObject from "./isObject.js";

const deepAssignObject = (target, source) => {
  Object.keys(source).forEach(key => {
    if (isObject(target[key]) && isObject(source[key])) {
      deepAssignObject(target[key], source[key]);
      return;
    }

    target[key] = source[key];
  });
};

/**
 * Recursively copy the values of all enumerable own properties from a source item to a target item if the both items are objects
 * @param {Object} target - a target object
 * @param {...Object} source - an array of source objects
 * @example
 * deepAssign({ a: 'a', b: 'b' }, { b: 'B', c: 'c' });
 * // { a: 'a', b: 'B', c: 'c' }
 */
export default (target, ...sources) => {
  if (isNil(target)) {
    throw new TypeError('deepAssign "target" cannot be null or undefined');
  }

  const result = Object(target);

  sources.forEach(source => deepAssignObject(result, Object(source)));

  return result;
};
