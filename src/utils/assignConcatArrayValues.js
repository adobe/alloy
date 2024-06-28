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
import isObject from "./isObject.js";

export default (...values) => {
  if (values.length < 2) {
    // if the number of args is 0 or 1, just use the default behavior from Object.assign
    return Object.assign(...values);
  }
  return values.reduce((accumulator, currentValue) => {
    if (isObject(currentValue)) {
      Object.keys(currentValue).forEach((key) => {
        if (Array.isArray(currentValue[key])) {
          if (Array.isArray(accumulator[key])) {
            accumulator[key].push(...currentValue[key]);
          } else {
            // clone the array so the original isn't modified.
            accumulator[key] = [...currentValue[key]];
          }
        } else {
          accumulator[key] = currentValue[key];
        }
      });
    }
    return accumulator;
  }); // no default value to pass into reduce because we want to skip the first value
};
