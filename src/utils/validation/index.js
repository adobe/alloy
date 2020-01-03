import chain from "./chain";

import booleanValidator from "./booleanValidator";
import callbackValidator from "./callbackValidator";
import createArrayOfValidator from "./createArrayOfValidator";
import createDefaultValidator from "./createDefaultValidator";
import createMinimumValidator from "./createMinimumValidator";
import createObjectOfValidator from "./createObjectOfValidator";
import createUniqueValidator from "./createUniqueValidator";
import domainValidator from "./domainValidator";
import integerValidator from "./integerValidator";
import nonEmptyValidator from "./nonEmptyValidator";
import numberValidator from "./numberValidator";
import regexpValidator from "./regexpValidator";
import requiredValidator from "./requiredValidator";
import stringValidator from "./stringValidator";

const base = value => value;
const optionalChain = (first, second, additionalMethods) => {
  const secondWithNullCheck = (value, path) =>
    value == null ? value : second(value, path);
  return chain(first, secondWithNullCheck, additionalMethods);
};

base.default = function _default(defaultValue) {
  return chain(this, createDefaultValidator(defaultValue));
};
base.required = function required() {
  return chain(this, requiredValidator);
};

// helper validators
const domain = function domain() {
  return optionalChain(this, domainValidator);
};
const minimumInteger = function minimumInteger(minValue) {
  return optionalChain(this, createMinimumValidator("an integer", minValue));
};
const minimumNumber = function minimumNumber(minValue) {
  return optionalChain(this, createMinimumValidator("a number", minValue));
};
const integer = function integer() {
  return optionalChain(this, integerValidator, { minimum: minimumInteger });
};
const nonEmpty = function nonEmpty() {
  return optionalChain(this, nonEmptyValidator);
};
const regexp = function regexp() {
  return optionalChain(this, regexpValidator);
};
const unique = function createUnique() {
  return optionalChain(this, createUniqueValidator());
};

// exposed validators
const arrayOf = function arrayOf(elementValidator) {
  return optionalChain(this, createArrayOfValidator(elementValidator));
};
const boolean = function boolean() {
  return optionalChain(this, booleanValidator);
};
const callback = function callback() {
  return optionalChain(this, callbackValidator);
};
const number = function number() {
  return optionalChain(this, numberValidator, {
    minimum: minimumNumber,
    integer,
    unique
  });
};
const objectOf = function objectOf(schema) {
  return optionalChain(this, createObjectOfValidator(schema));
};
const string = function string() {
  return optionalChain(this, stringValidator, {
    regexp,
    domain,
    nonEmpty,
    unique
  });
};

const boundArrayOf = arrayOf.bind(base);
const boundBoolean = boolean.bind(base);
const boundCallback = callback.bind(base);
const boundNumber = number.bind(base);
const boundObjectOf = objectOf.bind(base);
const boundString = string.bind(base);

export {
  boundArrayOf as arrayOf,
  boundBoolean as boolean,
  boundCallback as callback,
  boundNumber as number,
  boundObjectOf as objectOf,
  boundString as string
};
