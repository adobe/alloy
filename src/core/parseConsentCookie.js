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

import { stringToBoolean } from "../utils";

/**
 * Parses a consent cookie.
 * @param {string} cookieValue Must be in the format a=b;c=d
 * @returns {Object} An object where the keys are purpose names and the values
 * are whether the user consented to those purposes.
 */
export default cookieValue => {
  const categoryPairs = cookieValue.split(";");
  return categoryPairs.reduce((preferencesByPurpose, categoryPair) => {
    const [name, value] = categoryPair.split("=");
    if (!name || (value !== "true" && value !== "false")) {
      throw new Error(`Invalid consent cookie value: ${cookieValue}`);
    }
    preferencesByPurpose[name] = stringToBoolean(value);
    return preferencesByPurpose;
  }, {});
};
