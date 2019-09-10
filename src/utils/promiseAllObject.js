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
import isPlainObject from "./isPlainObject";
import isFunction from "./isFunction";
import zipObject from "./zipObject";

/**
 * Recursively searches through an object or array for any
 * promises. A new object or array will be composed with
 * the values of any promises found. This will be used
 * to resolve the returned promise.
 *
 * Note that if a promise returns an object or array, that object
 * or array will not be recursively searched for promises.
 *
 * @param {Object|Array} object
 * @returns {Promise}
 */
const promiseAllObject = object => {
  const keys = Object.keys(object);
  return Promise.all(
    keys.map(key => {
      const value = object[key];
      if (
        Array.isArray(value) ||
        (isPlainObject(value) && !isFunction(value.then))
      ) {
        return promiseAllObject(value);
      }
      return value;
    })
  ).then(values => {
    const resolvedObject = Array.isArray(object) ? [] : {};
    return zipObject(keys, values, resolvedObject);
  });
};

export default promiseAllObject;
