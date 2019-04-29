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
 * Returns the object specified by the nested object location.
 * @param {Object} obj The object containing the nested object.
 * @param {String} location Dot notation of the nested object location.
 * @param {Object} defaultObj object to return if no object is found at
 * the nested location.
 * @returns {Object}
 */
export default (obj, location, defaultObj) => {
  let keys = [location];
  let o = obj;
  if (isString(location)) {
    keys = location.split(".");
  }
  for (let i = 0; i < keys.length; i += 1) {
    if (!o || !Object.prototype.hasOwnProperty.call(o, keys[i])) {
      return defaultObj;
    }
    o = o[keys[i]];
  }
  return o;
};
