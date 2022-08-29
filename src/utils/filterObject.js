/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import isEmptyObject from "./isEmptyObject";
import isNil from "./isNil";
import isObject from "./isObject";

/**
 * Given an object and a function that takes a value and returns a predicate, filter out
 * all deeply nested values that do not pass the predicate.
 *
 * Example: filterObject({ a: 2, b: { c: 6 } }, (val) => val > 5) returns { b { c: 6 } }
 *
 * @param {*} obj
 * @param {* => boolean} predicate a function that takes a value and return a boolean,
 * representing if it should be included in the result object or not.
 * @returns A copy of the original object with the values that fail the predicate, filtered out.
 */
const filterObject = (obj, predicate) => {
  if (isNil(obj) || !isObject(obj)) {
    return obj;
  }
  return Object.keys(obj).reduce((result, key) => {
    const value = obj[key];
    if (isObject(value)) {
      // value is object, go deeper
      const filteredValue = filterObject(value, predicate);
      if (isEmptyObject(filteredValue)) {
        return result;
      }
      return { ...result, [key]: filteredValue };
    }
    // value is not an object, test predicate
    if (predicate(value)) {
      return { ...result, [key]: value };
    }
    return result;
  }, {});
};

export default filterObject;
