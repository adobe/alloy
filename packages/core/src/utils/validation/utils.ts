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

import type { ValidatorFn } from "./types.js";

/**
 * Wraps a validator returning the value if it is null or undefined, otherwise
 * it will call the original validator and return the result.
 *
 * @param validator - the validator to call if the value is not null
 */
const skipIfNull = (validator: ValidatorFn): ValidatorFn =>
  function skipIfNullValidator(this: unknown, value, path) {
    return value == null ? value : validator.call(this, value, path);
  };

/**
 * Returns a new validator that calls the first validator and then calls the second
 * validator with the result of the first validator. The result of the second validator
 * is returned.
 *
 * @param firstValidator - validator to call first
 * @param secondValidator - validator to call second
 * @returns a new validator that calls the first and second validators
 */
const callSequentially = (
  firstValidator: ValidatorFn,
  secondValidator: ValidatorFn,
): ValidatorFn =>
  function callSequentiallyValidator(this: unknown, value, path) {
    return secondValidator.call(
      this,
      firstValidator.call(this, value, path),
      path,
    );
  };

/**
 * Just like callSequentially, but if either validator throws an error, the errors
 * are collected and thrown at the end.
 *
 */
const callSequentiallyJoinErrors = (
  firstValidator: ValidatorFn,
  secondValidator: ValidatorFn,
): ValidatorFn =>
  function callSequentiallyJoinErrorsValidator(this: unknown, value, path) {
    const errors: unknown[] = [];
    const newValue = [firstValidator, secondValidator].reduce(
      (memo, validator) => {
        try {
          return validator.call(this, memo, path);
        } catch (e) {
          errors.push(e);
          return memo;
        }
      },
      value,
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
 * @param baseValidator - This validator will be called first, and its
 * methods will be copied over to the returned validator.
 * @param newValidator - This validator will be called second.
 * @param additionalMethods - Additional methods to include on the returned
 * validator.
 */
export const chain = (
  baseValidator: ValidatorFn,
  newValidator: ValidatorFn,
  additionalMethods?: object,
): ValidatorFn => {
  return Object.assign(
    callSequentially(baseValidator, newValidator),
    baseValidator,
    additionalMethods,
  );
};

/**
 * Chains two validators together, but skips the second validator if the value
 * is null. In addition to calling the validators in sequence, this will also
 * copy over methods from the base validator to the resulting validator and
 * include any additional methods.
 *
 * @param baseValidator - This validator will be called first, and its
 * methods will be copied over to the returned validator.
 * @param newValidator - This validator will be called second. If the value
 * is null after the first validator is called, this validator will not be
 * called.
 * @param additionalMethods - Additional methods to include on the returned
 * validator.
 */
export const nullSafeChain = (
  baseValidator: ValidatorFn,
  newValidator: ValidatorFn,
  additionalMethods?: object,
): ValidatorFn => {
  return Object.assign(
    callSequentially(baseValidator, skipIfNull(newValidator)),
    baseValidator,
    additionalMethods,
  );
};

/**
 * Same as nullSafeChain, but calls the new validator first.
 *
 * @param baseValidator - This validator will be called second, and its
 * methods will be copied over to the returned validator.
 * @param newValidator - This validator will be called first. If the value
 * is null, this validator will not be called.
 * @param additionalMethods - Additional methods to include on the returned
 * validator.
 */
export const reverseNullSafeChainJoinErrors = (
  baseValidator: ValidatorFn,
  newValidator: ValidatorFn,
  additionalMethods?: object,
): ValidatorFn => {
  return Object.assign(
    callSequentiallyJoinErrors(skipIfNull(newValidator), baseValidator),
    baseValidator,
    additionalMethods,
  );
};

/**
 * Throws an error if the value is not valid.
 *
 * @param isValid - Whether or not the value is valid (truthy).
 * @param value - The value to validate.
 * @param path - The path to the value.
 * @param message - The expected part of the error message.
 * @throws Throws an error if the value is not valid.
 */
export const assertValid = (
  isValid: unknown,
  value: unknown,
  path: string | undefined,
  message: string | undefined,
): void => {
  if (!isValid) {
    throw new Error(
      `'${path}': Expected ${message}, but got ${JSON.stringify(value)}.`,
    );
  }
};
