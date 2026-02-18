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
 * Copies properties from one object to another, but only if the value
 * doesn't match the default value.
 * @param {Object} options
 * @param {Object} options.toObj Object to which properties should be copied.
 * @param {Object} options.fromObj Object from which properties should be copied.
 * @param {Object} options.defaultsObj Default values for each property.
 * @param {Array} options.keys The top-level keys of the properties that should be attempted
 * to be copied. Does not apply to nested keys
 */
export default function copyPropertiesIfValueDifferentThanDefault({
  toObj,
  fromObj,
  defaultsObj,
  keys,
}) {
  keys.forEach((key) => {
    const fromValue = fromObj[key];
    const defaultValue = defaultsObj[key];

    if (Array.isArray(fromValue) && Array.from(defaultValue)) {
      if (fromValue.length !== defaultValue.length) {
        toObj[key] = fromValue;
        return;
      }
      // does not support arrays of objects
      // do no mutate the original array
      const sortedFromValue = fromValue.slice().sort();
      const sortedDefaultValue = defaultValue.slice().sort();
      if (
        sortedFromValue.some(
          (value, index) => value !== sortedDefaultValue[index],
        )
      ) {
        toObj[key] = fromValue;
      }
    } else if (
      fromValue != null &&
      defaultValue != null &&
      typeof fromValue === "object" &&
      typeof defaultValue === "object"
    ) {
      // recurse for nested objects
      const nestedToObj = {};
      copyPropertiesIfValueDifferentThanDefault({
        toObj: nestedToObj,
        fromObj: fromValue,
        defaultsObj: defaultValue,
        keys: Object.keys(fromValue),
      });
      if (Object.keys(nestedToObj).length > 0) {
        toObj[key] = nestedToObj;
      }
    } else if (fromValue !== defaultValue) {
      toObj[key] = fromValue;
    }
  });
}
