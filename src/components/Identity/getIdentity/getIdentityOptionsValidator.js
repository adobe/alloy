/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { objectOf, literal, arrayOf } from "../../../utils/validation";
/**
 * Verifies user provided event options.
 * @param {*} options The user event options to validate
 * @returns {*} Validated options
 */
export default options => {
  const getIdentityOptionsValidator = objectOf({
    namespaces: arrayOf(literal("ECID"))
      .nonEmpty()
      .uniqueItems()
  }).noUnknownFields();
  getIdentityOptionsValidator(options);
  // Return default options for now
  // To-Do: Accept namespace from given options
  return {
    namespaces: ["ECID"]
  };
};
