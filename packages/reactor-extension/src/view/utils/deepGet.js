/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
/**
 * Gets a deeply-nested value from an object
 * @param {object} obj the object to retrieve the property from
 * @param {string} path a dot-delimited path to the property to retrieve
 * @returns {any | undefined} the value at the path, or undefined if the path does not exist
 */
const deepGet = (obj, path) => {
  if (!path) {
    return obj;
  }
  const keys = path.split(".");
  return keys.reduce((acc, key) => acc?.[key], obj);
};
export default deepGet;
