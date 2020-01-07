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

import chain from "./chain";

/**
 * This augments `chain` with a null check done before running the rightValidator.
 * See chain for more info.
 *
 * For most validators, we want the validation to be optional (i.e. allow null or
 * undefined values). To accomplish this, the validator needs to have a check
 * at the begining of the function, short circuiting the validation logic and
 * returning value if value is null or undefined. `default` and `required` do not
 * want this null check though. Indeed, `default` should return the default value
 * if value is null, and `required` should throw an error if value is null.
 *
 * So to keep from having to have a null check in front of most validators, this
 * function allows you to chain a rightValidator that needs to have a null check.
 */
export default (leftValidator, rightValidator, additionalMethods) => {
  const rightValidatorWithNullCheck = (value, path) =>
    value == null ? value : rightValidator(value, path);
  return chain(leftValidator, rightValidatorWithNullCheck, additionalMethods);
};
