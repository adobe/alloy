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

import assign from "../assign";

/**
 * Chains two validators together.
 *
 * Validators are functions of two parameters (value and path) that return the computed value if
 * the input is valid, or throw an exception if the input is invalid. In most cases the returned
 * value is the same as the input value; however, reference createDefaultValidator.js
 * to see an example where the computed value is different from the input. Additionally, if we ever
 * wanted to coerce types (i.e. parse string values into integers) as part of the validation process
 * we could use the computed value to accomplish that.
 *
 * The path parameter is used to generate informative error messages. It is created by the objectOf, and
 * arrayOf validators so that any error message can describe which key within the object or array is
 * invalid.
 *
 * The validators also have methods to chain additional validation logic. For example, when you call
 * `string()` to start a validator chain, it returns a validator function but it also has methods
 * like `required` and `nonEmpty`. In action.js you can see that these methods are actually calling `chain`.
 * Specifically in this function, the leftValidator is called first and then the return value of that is
 * sent to the rightValidator. For example, when calling `string().nonEmpty().required()` the following
 * chain is built up:
 * ```
 *              *
 *            /   \
 *          *     required
 *        /   \
 *      *     nonEmpty
 *    /   \
 * base   string
 * ```
 * Where every * is a call to chain where the two are combined. The individual validators are called from
 * left to right in the above tree. The base validator is simply the identity function `value => value`,
 * representing an optional value.
 *
 * After combining the validators, the new validator function is then augmented with the methods from the
 * leftValidator and from the additionalMethods parameter. For example, when the string() function is called
 * it chains to the base validator, but also adds additional methods like (`regexp`, `domain`, `nonEmpty`,
 * and `unique`). When `nonEmpty` is called, which calls chain again, the additional methods are carried
 * forward because they are already defined on the leftValidator.
 *
 * The base validator also contains the two methods `required` and `default`, so these can be used anywhere
 * after any of the exposed validator functions are called.
 */
export default (leftValidator, rightValidator, additionalMethods = {}) => {
  // combine the two validators, calling left first and then right.
  // pass the return value from left into right.
  const combinedValidator = (value, path) => {
    return rightValidator(leftValidator(value, path), path);
  };
  // add the methods already defined on the left validator, and the additionalMethods
  // to the new combined validator function.
  assign(combinedValidator, leftValidator, additionalMethods);
  return combinedValidator;
};
