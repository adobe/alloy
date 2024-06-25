/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import isNumber from "./isNumber.js";
import isString from "./isString.js";

/*
 * coerce `value` to a number or return `defaultValue` if it cannot be.
 *
 * The coersion is attempted if value is a number or string.
 */
export default (value, defaultValue) => {
  if (isNumber(value) || isString(value)) {
    const n = Math.round(Number(value));
    // eslint-disable-next-line no-restricted-globals
    if (!isNaN(n)) {
      return n;
    }
  }
  return defaultValue;
};
