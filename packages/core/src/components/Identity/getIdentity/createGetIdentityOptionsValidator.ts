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

import { validateConfigOverride } from "../../../utils/index.js";
import { objectOf, enumOf, arrayOf } from "../../../utils/validation/index.js";
import ecidNamespace from "../../../constants/ecidNamespace.js";
import coreNamespace from "../../../constants/coreNamespace.js";

/**
 * Verifies user provided event options.
 * @param {*} options The user event options to validate
 * @returns {*} Validated options
 */

const validator = objectOf({
  namespaces: arrayOf(enumOf(ecidNamespace, coreNamespace))
    .nonEmpty()
    .uniqueItems()
    .default([ecidNamespace]),
  edgeConfigOverrides: validateConfigOverride,
})
  .noUnknownFields()
  .default({
    namespaces: [ecidNamespace],
  });

export default ({ thirdPartyCookiesEnabled }) => {
  return (options) => {
    const validatedOptions = validator(options);
    if (
      !thirdPartyCookiesEnabled &&
      validatedOptions.namespaces.includes(coreNamespace)
    ) {
      throw new Error(
        `namespaces: The ${coreNamespace} namespace cannot be requested when third-party cookies are disabled.`,
      );
    }
    return validatedOptions;
  };
};
