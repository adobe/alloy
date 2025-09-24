/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/**
 * Recursively sorts the properties of all objects within the provided data structure.
 * @param {Object|Array} data - The data structure to serialize. It can be an object or an array.
 * @returns {Object|Array} - A new object or array with allo the container object having properties sorted.
 */
const sortObjectPropertiesDeep = (data) => {
  if (Array.isArray(data)) {
    return data.map((value) => sortObjectPropertiesDeep(value));
  }

  if (typeof data === "object" && data !== null) {
    return Object.keys(data)
      .sort()
      .reduce((memo, key) => {
        memo[key] = sortObjectPropertiesDeep(data[key]);
        return memo;
      }, {});
  }

  return data;
};

/**
 * This utility helps create consistent serialized representations of objects
 * by eliminating variations caused by property order. This is useful for creating
 * reliable hashes or checksums containing these objects.
 * @param {Object|Array} data - The data structure to serialize. It can be an object or an array.
 * @returns {Object|Array} - A new object or array with allo the container object having properties sorted.
 */
export default (data) => sortObjectPropertiesDeep(data);
