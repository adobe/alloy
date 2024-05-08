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

import deepAssign from "./deepAssign.js";

/**
 * Creates a function that, when passed an object of updates, will merge
 * the updates onto the current value of a payload property.
 * @param {Object} content The base object to modify
 * @param {String } key The property to merge updates into. This
 * can be a dot-notation property path.
 * @returns {Function}
 */
export default (content, key) => updates => {
  const propertyPath = key.split(".");
  const hostObjectForUpdates = propertyPath.reduce((obj, propertyName) => {
    obj[propertyName] = obj[propertyName] || {};
    return obj[propertyName];
  }, content);
  deepAssign(hostObjectForUpdates, updates);
};
