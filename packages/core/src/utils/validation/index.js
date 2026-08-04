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

/**
 * Validators are functions of two parameters (value and path) that return the
 * computed value if the input is valid, or throw an exception if the input is
 * invalid. In most cases the returned value is the same as the input value;
 * however, reference createDefaultValidator.js to see an example where the
 * computed value is different from the input. Additionally, if we ever wanted
 * to coerce types (i.e. parse string values into integers) as part of the
 * validation process we could use the computed value to accomplish that.
 *
 * The path parameter is used to generate informative error messages. It is
 * created by the objectOf, and arrayOf validators so that any error message can
 * describe which key within the object or array is invalid.
 *
 * The validators also have methods to chain additional validation logic. For
 * example, when you call `string()` to start a validator chain, it returns a
 * validator function but it also has methods like `required` and `nonEmpty`.
 * Here you can see that these methods are actually calling `chain`.
 * Specifically in this function, the leftValidator is called first and then the
 * return value of that is sent to the rightValidator. For example, when calling
 * `string().nonEmpty().required()` the following chain is built up:
 * ```
 *              *
 *            /   \
 *          *     required
 *        /   \
 *      *     nonEmpty
 *    /   \
 * base   string
 * ```
 * Where every * is a call to chain where the two are combined. The individual
 * validators are called from left to right in the above tree. The base
 * validator is simply the identity function `value => value`, representing an
 * optional value.
 *
 * After combining the validators, the new validator function is then augmented
 * with the methods from the leftValidator and from the additionalMethods
 * parameter. For example, when the string() function is called it chains to the
 * base validator, but also adds additional methods like (`regexp`, `domain`,
 * `nonEmpty`, and `unique`). When `nonEmpty` is called, which calls chain
 * again, the additional methods are carried forward because they are already
 * defined on the leftValidator.
 *
 * The base validator also contains the two methods `required` and `default`, so
 * these can be used anywhere after any of the exposed validator functions are
 * called.
 *
 * For most validators, we want the validation to be optional (i.e. allow null
 * or undefined values). To accomplish this, the validator needs to have a check
 * at the begining of the function, short circuiting the validation logic and
 * returning value if value is null or undefined. `default` and `required` do
 * not want this null check though. Indeed, `default` should return the default
 * value if value is null, and `required` should throw an error if value is
 * null.
 *
 * So to keep from having to have a null check in front of most validators,
 * nullSafeChain allows you to chain a validator in a null-safe way.
 */

/** @import { ValidatorFn, AnyValidator, ArrayValidator, NumberValidator, MapOfValuesValidator, ObjectValidator, ObjectValidatorSchema, StringValidator } from './types.js' */

import {
  chain,
  nullSafeChain,
  reverseNullSafeChainJoinErrors,
} from "./utils.js";

import booleanValidator from "./booleanValidator.js";
import callbackValidator from "./callbackValidator.js";
import createAnyOfValidator from "./createAnyOfValidator.js";
import createArrayOfValidator from "./createArrayOfValidator.js";
import createDefaultValidator from "./createDefaultValidator.js";
import createDeprecatedValidator from "./createDeprecatedValidator.js";
import createLiteralValidator from "./createLiteralValidator.js";
import createMapOfValuesValidator from "./createMapOfValuesValidator.js";
import createMinimumValidator from "./createMinimumValidator.js";
import createMaximumValidator from "./createMaximumValidator.js";
import createNoUnknownFieldsValidator from "./createNoUnknownFieldsValidator.js";
import createNonEmptyValidator from "./createNonEmptyValidator.js";
import createObjectOfValidator from "./createObjectOfValidator.js";
import createRenamedValidator from "./createRenamedValidator.js";
import createUniqueValidator from "./createUniqueValidator.js";
import createUniqueItemsValidator from "./createUniqueItemsValidator.js";
import domainValidator from "./domainValidator.js";
import integerValidator from "./integerValidator.js";
import numberValidator from "./numberValidator.js";
import regexpValidator from "./regexpValidator.js";
import requiredValidator from "./requiredValidator.js";
import stringValidator from "./stringValidator.js";
import matchesRegexpValidator from "./matchesRegexpValidator.js";

// The base validator does no validation and just returns the value unchanged
const base = /** @type {AnyValidator} */ ((value) => value);

// The 'default', 'required', and 'deprecated' methods are available after any
// data-type method. Don't use the nullSafeChain on 'default' or 'required'
// because they need to handle the null or undefined case
/**
 * @this {AnyValidator}
 * @param {any} defaultValue
 * @returns {AnyValidator}
 */
base.default = function _default(defaultValue) {
  return /** @type {AnyValidator} */ (
    chain(this, createDefaultValidator(defaultValue))
  );
};
/**
 * @this {AnyValidator}
 * @returns {AnyValidator}
 */
base.required = function required() {
  return /** @type {AnyValidator} */ (chain(this, requiredValidator));
};
/**
 * @this {AnyValidator}
 * @param {string} message
 * @returns {AnyValidator}
 */
base.deprecated = function deprecated(message) {
  return /** @type {AnyValidator} */ (
    chain(this, createDeprecatedValidator(message))
  );
};

// helper validators
/**
 * @this {StringValidator}
 * @returns {StringValidator}
 */
const domain = function domain() {
  return /** @type {StringValidator} */ (nullSafeChain(this, domainValidator));
};
/**
 * @this {NumberValidator}
 * @param {number} minValue
 * @returns {NumberValidator}
 */
const minimumInteger = function minimumInteger(minValue) {
  return /** @type {NumberValidator} */ (
    nullSafeChain(this, createMinimumValidator("an integer", minValue))
  );
};
/**
 * @this {NumberValidator}
 * @param {number} minValue
 * @returns {NumberValidator}
 */
const minimumNumber = function minimumNumber(minValue) {
  return /** @type {NumberValidator} */ (
    nullSafeChain(this, createMinimumValidator("a number", minValue))
  );
};
/**
 * @this {NumberValidator}
 * @param {number} maxValue
 * @returns {NumberValidator}
 */
const maximumNumber = function maximumNumber(maxValue) {
  return /** @type {NumberValidator} */ (
    nullSafeChain(this, createMaximumValidator("a number", maxValue))
  );
};
/**
 * @this {NumberValidator}
 * @returns {NumberValidator}
 */
const integer = function integer() {
  return /** @type {NumberValidator} */ (
    nullSafeChain(this, integerValidator, { minimum: minimumInteger })
  );
};
/**
 * @this {StringValidator}
 * @returns {StringValidator}
 */
const nonEmptyString = function nonEmptyString() {
  return /** @type {StringValidator} */ (
    nullSafeChain(this, createNonEmptyValidator("a non-empty string"))
  );
};
/**
 * @this {ArrayValidator}
 * @returns {ArrayValidator}
 */
const nonEmptyArray = function nonEmptyArray() {
  return /** @type {ArrayValidator} */ (
    nullSafeChain(this, createNonEmptyValidator("a non-empty array"))
  );
};
/**
 * @this {MapOfValuesValidator | ObjectValidator}
 * @returns {MapOfValuesValidator & ObjectValidator}
 */
const nonEmptyObject = function nonEmptyObject() {
  return /** @type {MapOfValuesValidator & ObjectValidator} */ (
    nullSafeChain(this, createNonEmptyValidator("a non-empty object"))
  );
};
/**
 * @this {StringValidator}
 * @returns {StringValidator}
 */
const regexp = function regexp() {
  return /** @type {StringValidator} */ (nullSafeChain(this, regexpValidator));
};
/**
 * @this {StringValidator}
 * @param {RegExp} regexpPattern
 * @returns {StringValidator}
 */
const matches = function matches(regexpPattern) {
  return /** @type {StringValidator} */ (
    nullSafeChain(this, matchesRegexpValidator(regexpPattern))
  );
};
/**
 * @this {NumberValidator | StringValidator}
 * @returns {NumberValidator & StringValidator}
 */
const unique = function createUnique() {
  return /** @type {NumberValidator & StringValidator} */ (
    nullSafeChain(this, createUniqueValidator())
  );
};
/**
 * @this {ArrayValidator}
 * @returns {ArrayValidator}
 */
const uniqueItems = function createUniqueItems() {
  return /** @type {ArrayValidator} */ (
    nullSafeChain(this, createUniqueItemsValidator())
  );
};

// top-level validators.  These are the first functions that are called to create a validator.
/**
 * @this {AnyValidator}
 * @param {ValidatorFn[]} validators
 * @param {string} [message]
 * @returns {AnyValidator}
 */
const anyOf = function anyOf(validators, message) {
  // use chain here because we don't want to accept null or undefined unless at least
  // one of the validators accept null or undefined.
  return /** @type {AnyValidator} */ (
    chain(this, createAnyOfValidator(validators, message))
  );
};
/**
 * @this {AnyValidator}
 * @returns {AnyValidator}
 */
const anything = function anything() {
  return this;
};
/**
 * @this {AnyValidator}
 * @param {ValidatorFn} elementValidator
 * @returns {ArrayValidator}
 */
const arrayOf = function arrayOf(elementValidator) {
  return /** @type {ArrayValidator} */ (
    nullSafeChain(this, createArrayOfValidator(elementValidator), {
      nonEmpty: nonEmptyArray,
      uniqueItems,
    })
  );
};
/**
 * @this {AnyValidator}
 * @returns {AnyValidator}
 */
const boolean = function boolean() {
  return /** @type {AnyValidator} */ (nullSafeChain(this, booleanValidator));
};
/**
 * @this {AnyValidator}
 * @returns {AnyValidator}
 */
const callback = function callback() {
  return /** @type {AnyValidator} */ (nullSafeChain(this, callbackValidator));
};
/**
 * @this {AnyValidator}
 * @param {any} literalValue
 * @returns {AnyValidator}
 */
const literal = function literal(literalValue) {
  return /** @type {AnyValidator} */ (
    nullSafeChain(this, createLiteralValidator(literalValue))
  );
};
/**
 * @this {AnyValidator}
 * @returns {NumberValidator}
 */
const number = function number() {
  return /** @type {NumberValidator} */ (
    nullSafeChain(this, numberValidator, {
      minimum: minimumNumber,
      maximum: maximumNumber,
      integer,
      unique,
    })
  );
};
/**
 * @this {AnyValidator}
 * @param {ValidatorFn} valuesValidator
 * @returns {MapOfValuesValidator}
 */
const mapOfValues = function mapOfValues(valuesValidator) {
  return /** @type {MapOfValuesValidator} */ (
    nullSafeChain(this, createMapOfValuesValidator(valuesValidator), {
      nonEmpty: nonEmptyObject,
    })
  );
};
/**
 * @param {ObjectValidatorSchema} schema
 */
const createObjectOfAdditionalProperties = (schema) => ({
  /**
   * @this {ObjectValidator}
   * @returns {ObjectValidator}
   */
  noUnknownFields: function noUnknownFields() {
    return /** @type {ObjectValidator} */ (
      nullSafeChain(this, createNoUnknownFieldsValidator(schema))
    );
  },
  nonEmpty: nonEmptyObject,
  /**
   * @this {ObjectValidator}
   * @param {ObjectValidator} otherObjectOfValidator
   * @returns {ObjectValidator}
   */
  concat: function concat(otherObjectOfValidator) {
    // combine the schema so that noUnknownFields, and concat have the combined schema
    const newSchema = { ...schema, ...otherObjectOfValidator.schema };
    return /** @type {ObjectValidator} */ (
      nullSafeChain(
        this,
        otherObjectOfValidator,
        createObjectOfAdditionalProperties(newSchema),
      )
    );
  },
  /**
   * @this {ObjectValidator}
   * @param {string} oldField
   * @param {ValidatorFn} oldSchema
   * @param {string} newField
   * @returns {ObjectValidator}
   */
  renamed: function renamed(oldField, oldSchema, newField) {
    // Run the deprecated validator first so that the deprecated field is removed
    // before the objectOf validator runs.
    return /** @type {ObjectValidator} */ (
      reverseNullSafeChainJoinErrors(
        this,
        createRenamedValidator(oldField, oldSchema, newField),
      )
    );
  },
  schema,
});
/**
 * @this {AnyValidator}
 * @param {ObjectValidatorSchema} schema
 * @returns {ObjectValidator}
 */
const objectOf = function objectOf(schema) {
  return /** @type {ObjectValidator} */ (
    nullSafeChain(
      this,
      createObjectOfValidator(schema),
      createObjectOfAdditionalProperties(schema),
    )
  );
};
/**
 * @this {AnyValidator}
 * @returns {StringValidator}
 */
const string = function string() {
  return /** @type {StringValidator} */ (
    nullSafeChain(this, stringValidator, {
      regexp,
      domain,
      nonEmpty: nonEmptyString,
      unique,
      matches,
    })
  );
};

const boundAnyOf = anyOf.bind(base);
const boundAnything = anything.bind(base);
const boundArrayOf = arrayOf.bind(base);
const boundBoolean = boolean.bind(base);
const boundCallback = callback.bind(base);
const boundLiteral = literal.bind(base);
const boundNumber = number.bind(base);
const boundMapOfValues = mapOfValues.bind(base);
const boundObjectOf = objectOf.bind(base);
const boundString = string.bind(base);

// compound validators
/**
 * @param {...any} values
 * @returns {AnyValidator}
 */
const boundEnumOf = function boundEnumOf(...values) {
  return boundAnyOf(
    values.map(boundLiteral),
    `one of these values: ${JSON.stringify(values)}`,
  );
};

export {
  boundAnyOf as anyOf,
  boundAnything as anything,
  boundArrayOf as arrayOf,
  boundBoolean as boolean,
  boundCallback as callback,
  boundLiteral as literal,
  boundNumber as number,
  boundMapOfValues as mapOfValues,
  boundObjectOf as objectOf,
  boundString as string,
  boundEnumOf as enumOf,
};
