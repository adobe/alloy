/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/**
 * Given a value, return the value with all whitespace trimmed. Supports any
 * data type.
 *
 * Complex objects (arrays and objects) will modified in-place and a reference
 * is returned.
 * If the value is an array, the array will be returned with all whitespace trimmed from each value.
 * If the value is an object, the object will be recursed through and returned
 * with all whitespace trimmed from each value.
 *
 * If the resulting string is empty, the value will be undefined.
 * If the resulting object is empty, the value will be undefined.
 * If the resulting array is empty, the value will be undefined.
 *
 * This is a function statement instead of an arrow function so that it can be
 * recursively called.
 * @param {T} value
 * @returns {T | undefined}
 */
function trimValue(value) {
  if (
    value == null ||
    (typeof value !== "object" && typeof value !== "string")
  ) {
    return value;
  }

  if (typeof value === "string") {
    return value.trim() || undefined;
  }

  if (Array.isArray(value)) {
    const trimmedArray = value
      .map(trimValue)
      .filter((item) => item !== undefined);
    return trimmedArray.length === 0 ? undefined : trimmedArray;
  }

  Object.keys(value).forEach((key) => {
    const trimmedValue = trimValue(value[key]);
    if (trimmedValue === undefined) {
      delete value[key];
    } else {
      value[key] = trimmedValue;
    }
  });
  return Object.keys(value).length === 0 ? undefined : value;
}
export default trimValue;
