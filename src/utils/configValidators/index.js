/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import assign from "../assign";
import booleanValidator from "./boolean";
import chain from "./chain";
import arrayOfValidator from "./arrayOf";
import createMinimumValidator from "./createMinimum";
import createUniqueValidator from "./createUnique";
import domainValidator from "./domain";
import callbackValidator from "./callback";
import integerValidator from "./integer";
import nonEmptyValidator from "./nonEmpty";
import numberValidator from "./number";
import regexpValidator from "./regexp";
import requiredValidator from "./required";
import stringValidator from "./string";
import createExpected from "./createExpected";

// We determine required vs. optional configs by the presense of a default value key.
// If the config is optional and not set, the validation doesn't get called and the
// default value is used.  Therefore, we can assume that when the validator is called
// and the value is null, the config is required.
const baseValidator = (...args) => requiredValidator(...args);

const domain = function domain() {
  return chain(this, domainValidator);
};
const regexp = function regexp() {
  return chain(this, regexpValidator);
};
const nonEmpty = function nonEmpty() {
  return chain(this, nonEmptyValidator);
};
const unique = function createUnique() {
  return chain(this, createUniqueValidator());
};
const minimum = function minimum(minValue) {
  return chain(this, createMinimumValidator(minValue));
};
const integer = function integer() {
  return chain(this, integerValidator);
};

// exposed validators
const boolean = function boolean() {
  return chain(this, booleanValidator);
};
const number = function number() {
  return chain(this, numberValidator, { minimum, integer, unique });
};
const string = function string() {
  return chain(this, stringValidator, { regexp, domain, nonEmpty, unique });
};
const callback = function func() {
  return chain(this, callbackValidator);
};
const arrayOf = function arrayOf(elementValidator) {
  return chain(this, arrayOfValidator(elementValidator));
};

// Use this to change the message that is returned.  This is useful for complex validators
// where you don't want to just tell the user one thing at a time.  For example:
// number().integer().minimum(0)("key", "foo") => "'key': Expected a number, but got 'foo'"
// number().integer().minimum(0).expected("an integer greater than or equal to 0")("key", "foo")
//  => "'key': Expected an integer greater than or equal to 0"
const expected = function expected(message) {
  const e = createExpected(message);
  const validator = this;
  const newValidator = (...args) => {
    return e(!validator(...args), ...args);
  };

  assign(newValidator, validator);
  return newValidator;
};

assign(baseValidator, { expected });

const boundString = string.bind(baseValidator);
const boundBoolean = boolean.bind(baseValidator);
const boundNumber = number.bind(baseValidator);
const boundCallback = callback.bind(baseValidator);
const boundArrayOf = arrayOf.bind(baseValidator);

export {
  boundString as string,
  boundBoolean as boolean,
  boundNumber as number,
  boundCallback as callback,
  boundArrayOf as arrayOf
};
