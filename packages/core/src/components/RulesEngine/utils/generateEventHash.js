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
import fnv1a32Hex from "../../../utils/fnv1a32Hex";

/**
 * Generates an event history hash from an object by removing keys with empty values, sorting the keys,
 * converting the object to a string, and hashing the string.
 * @param {Object} o - The object to process.
 * @returns {string} - The hash of the processed object.
 */
export default (o) => {
  const obj = structuredClone(o);

  const objectString = Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      const value = obj[key];

      // eslint-disable-next-line eqeqeq
      if (value == undefined || value === "") {
        return result;
      }

      result += `${key}:${value}`;
      return result;
    }, "");

  return fnv1a32Hex(objectString);
};
