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

import isString from "./isString";

/**
 * Sets a nested object specified by the nested object location.
 * @param {Object} obj The object to set the nested object on.
 * @param {String} location Dot notation of the nested object location.
 * @returns {Object} Previous object at the location if already set.
 */
export default (obj, location, nestedObj) => {
  let keys = [location];
  let o = obj;
  if (isString(location)) {
    keys = location.split(".");
  }
  let existingObj;
  for (let i = 0; i < keys.length; i += 1) {
    if (i === keys.length - 1) {
      existingObj = o[keys[i]];
      o[keys[i]] = nestedObj;
    } else if (!o[keys[i]]) {
      o[keys[i]] = {};
    }
    o = o[keys[i]];
  }
  return existingObj;
};
