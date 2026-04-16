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
 * Deletes a deeply nested key from an object. Modifies the object in-place.
 * @param {object} obj the object to delete the property from
 * @param {string} path a dot-delimited path to the property to delete
 * @returns {object} the object with the property removed
 */
const deepDelete = (obj, path) => {
  if (!path) {
    return obj;
  }
  const keys = path.split(".");
  const lastKey = keys.pop();
  const target = keys.reduce((acc, key) => acc?.[key], obj);
  if (target) {
    delete target[lastKey];
  }
  return obj;
};
export default deepDelete;
