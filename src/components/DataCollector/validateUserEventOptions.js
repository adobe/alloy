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

import { string, objectOf, boolean, arrayOf } from "../../utils/validation";

/**
 * @typedef {Object} OptionsValidationResults
 * @property {Array} errors - Errors from invalid options
 * @property {Array} warnings - Warnings from invalid options
 */

/**
 * Verifies user provided event options.
 * @param {*} options The user event options to validate
 * @returns {OptionsValidationResults} Errors and warnings from invalid options
 */
export default options => {
  const eventOptionsErrorValidator = objectOf({
    viewStart: boolean(),
    type: string(),
    xdm: objectOf({
      eventType: string()
    }),
    data: objectOf({}),
    scopes: arrayOf(string())
  }).required();
  const errors = [];
  try {
    eventOptionsErrorValidator(options);
  } catch (e) {
    errors.push(e);
  }
  const eventOptionsWarningValidator = objectOf({
    type: string().nonEmpty(),
    xdm: objectOf({
      eventType: string().nonEmpty()
    }).nonEmpty(),
    data: objectOf({}).nonEmpty(),
    scopes: arrayOf(
      string()
        .required()
        .nonEmpty()
    ).nonEmpty()
  }).required();
  const warnings = [];
  try {
    const { type, xdm } = eventOptionsWarningValidator(options);
    if (xdm && !xdm.eventType && !type) {
      warnings.push("No type or xdm.eventType specified.");
    }
  } catch (e) {
    warnings.push(e);
  }
  return { errors, warnings };
};
