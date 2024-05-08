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

import {
  chain,
  nullSafeChain,
  reverseNullSafeChainJoinErrors,
} from "./utils.js";

import booleanValidator from "./booleanValidator.js";
import callbackValidator from "./callbackValidator.js";
import createArrayOfValidator from "./createArrayOfValidator.js";
import createDefaultValidator from "./createDefaultValidator.js";
import createDeprecatedValidator from "./createDeprecatedValidator.js";
import createLiteralValidator from "./createLiteralValidator.js";
import createMapOfValuesValidator from "./createMapOfValuesValidator.js";
import createMinimumValidator from "./createMinimumValidator.js";
import createNoUnknownFieldsValidator from "./createNoUnknownFieldsValidator.js";
import createNonEmptyValidator from "./createNonEmptyValidator.js";
import createObjectOfValidator from "./createObjectOfValidator.js";
import createAnyOfValidator from "./createAnyOfValidator.js";
import createUniqueValidator from "./createUniqueValidator.js";
import createUniqueItemsValidator from "./createUniqueItemsValidator.js";
import domainValidator from "./domainValidator.js";
import integerValidator from "./integerValidator.js";
import numberValidator from "./numberValidator.js";
import regexpValidator from "./regexpValidator.js";
import requiredValidator from "./requiredValidator.js";
import stringValidator from "./stringValidator.js";

// The base validator does no validation and just returns the value unchanged
const base = (value) => value;

// The 'default', 'required', and 'deprecated' methods are available after any
// data-type method. Don't use the nullSafeChain on 'default' or 'required'
// because they need to handle the null or undefined case
base.default = function _default(defaultValue) {
  return chain(this, createDefaultValidator(defaultValue));
};
base.required = function required() {
  return chain(this, requiredValidator);
};

// helper validators
const domain = function domain() {
  return nullSafeChain(this, domainValidator);
};
const minimumInteger = function minimumInteger(minValue) {
  return nullSafeChain(this, createMinimumValidator("an integer", minValue));
};
const minimumNumber = function minimumNumber(minValue) {
  return nullSafeChain(this, createMinimumValidator("a number", minValue));
};
const integer = function integer() {
  return nullSafeChain(this, integerValidator, { minimum: minimumInteger });
};
const nonEmptyString = function nonEmptyString() {
  return nullSafeChain(this, createNonEmptyValidator("a non-empty string"));
};
const nonEmptyArray = function nonEmptyArray() {
  return nullSafeChain(this, createNonEmptyValidator("a non-empty array"));
};
const nonEmptyObject = function nonEmptyObject() {
  return nullSafeChain(this, createNonEmptyValidator("a non-empty object"));
};
const regexp = function regexp() {
  return nullSafeChain(this, regexpValidator);
};
const unique = function createUnique() {
  return nullSafeChain(this, createUniqueValidator());
};
const uniqueItems = function createUniqueItems() {
  return nullSafeChain(this, createUniqueItemsValidator());
};

// top-level validators.  These are the first functions that are called to create a validator.
const anyOf = function anyOf(validators, message) {
  // use chain here because we don't want to accept null or undefined unless at least
  // one of the validators accept null or undefined.
  return chain(this, createAnyOfValidator(validators, message));
};
const anything = function anything() {
  return this;
};
const arrayOf = function arrayOf(elementValidator) {
  return nullSafeChain(this, createArrayOfValidator(elementValidator), {
    nonEmpty: nonEmptyArray,
    uniqueItems,
  });
};
const boolean = function boolean() {
  return nullSafeChain(this, booleanValidator);
};
const callback = function callback() {
  return nullSafeChain(this, callbackValidator);
};
const literal = function literal(literalValue) {
  return nullSafeChain(this, createLiteralValidator(literalValue));
};
const number = function number() {
  return nullSafeChain(this, numberValidator, {
    minimum: minimumNumber,
    integer,
    unique,
  });
};
const mapOfValues = function mapOfValues(valuesValidator) {
  return nullSafeChain(this, createMapOfValuesValidator(valuesValidator), {
    nonEmpty: nonEmptyObject,
  });
};
const createObjectOfAdditionalProperties = (schema) => ({
  noUnknownFields: function noUnknownFields() {
    return nullSafeChain(this, createNoUnknownFieldsValidator(schema));
  },
  nonEmpty: nonEmptyObject,
  concat: function concat(otherObjectOfValidator) {
    // combine the schema so that noUnknownFields, and concat have the combined schema
    const newSchema = { ...schema, ...otherObjectOfValidator.schema };
    return nullSafeChain(
      this,
      otherObjectOfValidator,
      createObjectOfAdditionalProperties(newSchema),
    );
  },
  deprecated: function deprecated(oldField, oldSchema, newField) {
    // Run the deprecated validator first so that the deprecated field is removed
    // before the objectOf validator runs.
    return reverseNullSafeChainJoinErrors(
      this,
      createDeprecatedValidator(oldField, oldSchema, newField),
    );
  },
  schema,
});
const objectOf = function objectOf(schema) {
  return nullSafeChain(
    this,
    createObjectOfValidator(schema),
    createObjectOfAdditionalProperties(schema),
  );
};
const string = function string() {
  return nullSafeChain(this, stringValidator, {
    regexp,
    domain,
    nonEmpty: nonEmptyString,
    unique,
  });
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
const boundEnumOf = function boundEnumOf(...values) {
  return boundAnyOf(
    values.map(boundLiteral),
    `one of these values: [${JSON.stringify(values)}]`,
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
