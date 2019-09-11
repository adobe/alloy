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
import zipObject from "./zipObject";

/**
 * Recursively searches through an object or array for any
 * promises. As part of the process, the object or array will
 * be recursively cloned but composed with the resolved values
 * of any promises found. This will be used to resolve the
 * returned promise. If any promise found resolves to a plain
 * object or array (no custom constructors), that object or
 * array will also be recursively searched for promises.
 *
 * @param {Object|Array} object A plain object array (no custom constructors).
 * @returns {Promise}
 */
const promiseAllObject = object => {
  const keys = Object.keys(object);
  return Promise.all(
    keys.map(key => {
      return Promise.resolve(object[key]).then(resolvedValue => {
        return Array.isArray(resolvedValue) || isPlainObject(resolvedValue)
          ? promiseAllObject(resolvedValue)
          : resolvedValue;
      });
    })
  ).then(values => {
    const resolvedObject = Array.isArray(object) ? [] : {};
    return zipObject(keys, values, resolvedObject);
  });
};

export default promiseAllObject;
