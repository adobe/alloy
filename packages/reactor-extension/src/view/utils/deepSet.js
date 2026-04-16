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
 * Sets a deeply-nested value in an object.
 * @param {} obj
 * @param {*} path
 * @param {*} value
 */
const deepSet = (obj, path, value) => {
  const keys = path.split(".");
  const lastKey = keys.pop();
  const target = keys.reduce((acc, key) => {
    if (!acc[key]) {
      acc[key] = {};
    }
    return acc[key];
  }, obj);
  target[lastKey] = value;
};

export default deepSet;
