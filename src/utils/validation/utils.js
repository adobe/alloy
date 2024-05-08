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

// This is used to add methods onto a function.
import assign from "../assign.js";

/**
 * Wraps a validator returning the value if it is null or undefined, otherwise
 * it will call the original validator and return the result.
 *
 * @param {function} validator - the validator to call if the value is not null
 */
const skipIfNull = validator =>
  function skipIfNullValidator(value, path) {
    return value == null ? value : validator.call(this, value, path);
  };

/**
 * Returns a new validator that calls the first validator and then calls the second
 * validator with the result of the first validator. The result of the second validator
 * is returned.
 *
 * @param {function} firstValidator - validator to call first
 * @param {function} secondValidator - validator to call second
 * @returns {function} - a new validator that calls the first and second validators
 */
const callSequentially = (firstValidator, secondValidator) =>
  function callSequentiallyValidator(value, path) {
    return secondValidator.call(
      this,
      firstValidator.call(this, value, path),
      path
    );
  };

/**
 * Just like callSequentially, but if either validator throws an error, the errors
 * are collected and thrown at the end.
 *
 * @param {function} firstValidator
 * @param {function} secondValidator
 * @returns {function}
 */
const callSequentiallyJoinErrors = (firstValidator, secondValidator) =>
  function callSequentiallyJoinErrorsValidator(value, path) {
    const errors = [];
    const newValue = [firstValidator, secondValidator].reduce(
      (memo, validator) => {
        try {
          return validator.call(this, memo, path);
        } catch (e) {
          errors.push(e);
          return memo;
        }
      },
      value
    );
    if (errors.length) {
      throw new Error(errors.join("\n"));
    }
    return newValue;
  };

/**
 * Chains two validators together. In addition to calling the validators in
 * sequence, this will also copy over methods from the base validator to the
 * resulting validator and include any additional methods.
 *
 * @param {function} baseValidator - This validator will be called first, and its
 * methods will be copied over to the returned validator.
 * @param {function} newValidator - This validator will be called second.
 * @param {object} additionalMethods - Additional methods to include on the returned
 * validator.
 * @returns {function}
 */
export const chain = (baseValidator, newValidator, additionalMethods) => {
  return assign(
    callSequentially(baseValidator, newValidator),
    baseValidator,
    additionalMethods
  );
};

/**
 * Chains two validators together, but skips the second validator if the value
 * is null. In addition to calling the validators in sequence, this will also
 * copy over methods from the base validator to the resulting validator and
 * include any additional methods.
 *
 * @param {function} baseValidator - This validator will be called first, and its
 * methods will be copied over to the returned validator.
 * @param {function} newValidator - This validator will be called second. If the value
 * is null after the first validator is called, this validator will not be
 * called.
 * @param {object} additionalMethods - Additional methods to include on the returned
 * validator.
 * @returns {function}
 */
export const nullSafeChain = (
  baseValidator,
  newValidator,
  additionalMethods
) => {
  return assign(
    callSequentially(baseValidator, skipIfNull(newValidator)),
    baseValidator,
    additionalMethods
  );
};

/**
 * Same as nullSafeChain, but calls the new validator first.
 *
 * @param {function} baseValidator - This validator will be called second, and its
 * methods will be copied over to the returned validator.
 * @param {function} newValidator - This validator will be called first. If the value
 * is null, this validator will not be called.
 * @param {function} additionalMethods - Additional methods to include on the returned
 * validator.
 * @returns {function}
 */
export const reverseNullSafeChainJoinErrors = (
  baseValidator,
  newValidator,
  additionalMethods
) => {
  return assign(
    callSequentiallyJoinErrors(skipIfNull(newValidator), baseValidator),
    baseValidator,
    additionalMethods
  );
};

/**
 * Throws an error if the value is not valid.
 *
 * @param {boolean} isValid - Whether or not the value is valid.
 * @param {*} value - The value to validate.
 * @param {string} path - The path to the value.
 * @param {string} message - The expected part of the error message.
 * @throws {Error} - Throws an error if the value is not valid.
 * @returns {void}
 */
export const assertValid = (isValid, value, path, message) => {
  if (!isValid) {
    throw new Error(
      `'${path}': Expected ${message}, but got ${JSON.stringify(value)}.`
    );
  }
};
