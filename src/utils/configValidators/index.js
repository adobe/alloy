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
import createMinimumValidator from "./createMinimum";
import createUniqueValidator from "./createUnique";
import domainValidator from "./domain";
import integerValidator from "./integer";
import nonEmptyValidator from "./nonEmpty";
import requiredValidator from "./required";
import stringValidator from "./string";

// We determine required vs. optional configs by the presense of a default value key.
// If the config is optional and not set, the validation doesn't get called and the
// default value is used.  Therefore, we can assume that when the validator is called
// and the value is null, the config is required.
const baseValidator = (...args) => requiredValidator(...args);

// string validators
const domain = function domain() {
  return chain(this, domainValidator);
};
const nonEmpty = function nonEmpty() {
  return chain(this, nonEmptyValidator);
};

// integer validators
const minimum = function minimum(minValue) {
  return chain(this, createMinimumValidator(minValue));
};

// untyped validators
const boolean = function boolean() {
  return chain(this, booleanValidator);
};
const integer = function integer() {
  return chain(this, integerValidator, { minimum });
};
const string = function string() {
  return chain(this, stringValidator, { domain, nonEmpty });
};
const unique = function unique() {
  return chain(this, createUniqueValidator());
};

assign(baseValidator, { unique, string, boolean, integer });

const boundUnique = unique.bind(baseValidator);
const boundString = string.bind(baseValidator);
const boundBoolean = boolean.bind(baseValidator);
const boundInteger = integer.bind(baseValidator);

export {
  boundUnique as unique,
  boundString as string,
  boundBoolean as boolean,
  boundInteger as integer
};
