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

// See comments on chain and nullSafeChain to understand what is going on here.
import chain from "./chain";
import nullSafeChain from "./nullSafeChain";

import booleanValidator from "./booleanValidator";
import callbackValidator from "./callbackValidator";
import createArrayOfValidator from "./createArrayOfValidator";
import createDefaultValidator from "./createDefaultValidator";
import createLiteralValidator from "./createLiteralValidator";
import createMinimumValidator from "./createMinimumValidator";
import createNoUnknownFieldsValidator from "./createNoUnknownFieldsValidator";
import createNonEmptyValidator from "./createNonEmptyValidator";
import createObjectOfValidator from "./createObjectOfValidator";
import createAnyOfValidator from "./createAnyOfValidator";
import createUniqueValidator from "./createUniqueValidator";
import domainValidator from "./domainValidator";
import integerValidator from "./integerValidator";
import numberValidator from "./numberValidator";
import regexpValidator from "./regexpValidator";
import requiredValidator from "./requiredValidator";
import stringValidator from "./stringValidator";

// The base validator does no validation and just returns the value unchanged
const base = value => value;

// The 'default' and 'required' methods are available after any data-type method
// Don't use the nullSafeChain because they need to handle the null or undefined case
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

// top-level validators.  These are the first functions that are called to create a validator.
const anyOf = function anyOf(validators, message) {
  // use chain here because we don't want to accept null or undefined unless at least
  // one of the validators accept null or undefined.
  return chain(this, createAnyOfValidator(validators, message));
};
const arrayOf = function arrayOf(elementValidator) {
  return nullSafeChain(this, createArrayOfValidator(elementValidator), {
    nonEmpty: nonEmptyArray
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
    unique
  });
};
const objectOf = function objectOf(schema) {
  const noUnknownFields = function noUnknownFields() {
    return nullSafeChain(this, createNoUnknownFieldsValidator(schema));
  };
  return nullSafeChain(this, createObjectOfValidator(schema), {
    noUnknownFields,
    nonEmpty: nonEmptyObject
  });
};
const string = function string() {
  return nullSafeChain(this, stringValidator, {
    regexp,
    domain,
    nonEmpty: nonEmptyString,
    unique
  });
};

const boundAnyOf = anyOf.bind(base);
const boundArrayOf = arrayOf.bind(base);
const boundBoolean = boolean.bind(base);
const boundCallback = callback.bind(base);
const boundLiteral = literal.bind(base);
const boundNumber = number.bind(base);
const boundObjectOf = objectOf.bind(base);
const boundString = string.bind(base);

// compound validators
const boundEnumOf = function boundEnumOf(...values) {
  return boundAnyOf(
    values.map(boundLiteral),
    `one of these values: [${JSON.stringify(values)}]`
  );
};

export {
  boundAnyOf as anyOf,
  boundArrayOf as arrayOf,
  boundBoolean as boolean,
  boundCallback as callback,
  boundLiteral as literal,
  boundNumber as number,
  boundObjectOf as objectOf,
  boundString as string,
  boundEnumOf as enumOf
};
