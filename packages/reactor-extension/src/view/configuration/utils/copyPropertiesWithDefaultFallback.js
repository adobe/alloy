/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
/**
 * Copies properties from one object to another, but if the property doesn't
 * exist in the source object, copy the default value instead.
 * @param {Object} options
 * @param {Object} options.toObj Object to which properties should be copied.
 * @param {Object} options.fromObj Object from which properties should be copied.
 * @param {Object} options.defaultsObj Default values for each property.
 * @param {string[]} options.keys The top level keys of the properties that should be copied.
 */
export default function copyPropertiesWithDefaultFallback({
  toObj,
  fromObj,
  defaultsObj,
  keys,
}) {
  keys.forEach((key) => {
    if (
      typeof fromObj[key] === "object" &&
      fromObj[key] !== null &&
      !Array.isArray(fromObj[key])
    ) {
      toObj[key] = toObj[key] ?? {};
      copyPropertiesWithDefaultFallback({
        toObj: toObj[key],
        fromObj: fromObj[key],
        defaultsObj: defaultsObj[key],
        keys: Object.keys(defaultsObj[key]),
      });
      return;
    }
    toObj[key] = fromObj[key] ?? defaultsObj[key];
  });
}
