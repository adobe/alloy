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

/**
 * Applies keys with their respective values to a target object,
 * where keys and values are ordered in separate arrays.
 * @param {Array} keys The keys to apply to the object.
 * @param {Array} values The values to apply to the object.
 * @param {Object} [target] The object to which key-values should be applied.
 * @returns {*}
 */
export default (keys, values, target = {}) => {
  return keys.reduce((accumulator, key, index) => {
    accumulator[key] = values[index];
    return accumulator;
  }, target);
};
