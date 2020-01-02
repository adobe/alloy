import chain from "./chain";

import booleanTransformer from "./boolean";
import callbackTransformer from "./callback";
import createArrayOfTransformer from "./createArrayOf";
import createDefaultTransformer from "./createDefault";
import createMinimumTransformer from "./createMinimum";
import createObjectOfTransformer from "./createObjectOf";
import createUniqueTransformer from "./createUnique";
import domainTransformer from "./domain";
import integerTransformer from "./integer";
import nonEmptyTransformer from "./nonEmpty";
import numberTransformer from "./number";
import regexpTransformer from "./regexp";
import requiredTransformer from "./required";
import stringTransformer from "./string";

const base = (_, value) => value;

base.default = function _default(defaultValue) {
  return chain(this, createDefaultTransformer(defaultValue));
};
base.required = function required() {
  return chain(this, requiredTransformer);
};

// helper validators
const domain = function domain() {
  return chain(this, domainTransformer);
};
const minimumInteger = function minimumInteger(minValue) {
  return chain(this, createMinimumTransformer("an integer", minValue));
};
const minimumNumber = function minimumNumber(minValue) {
  return chain(this, createMinimumTransformer("a number", minValue));
};
const integer = function integer() {
  return chain(this, integerTransformer, { minimum: minimumInteger });
};
const nonEmpty = function nonEmpty() {
  return chain(this, nonEmptyTransformer);
};
const regexp = function regexp() {
  return chain(this, regexpTransformer);
};
const unique = function createUnique() {
  return chain(this, createUniqueTransformer());
};

// exposed validators
const arrayOf = function arrayOf(elementValidator) {
  return chain(this, createArrayOfTransformer(elementValidator));
};
const boolean = function boolean() {
  return chain(this, booleanTransformer);
};
const callback = function callback() {
  return chain(this, callbackTransformer);
};
const number = function number() {
  return chain(this, numberTransformer, {
    minimum: minimumNumber,
    integer,
    unique
  });
};
const objectOf = function objectOf(schema) {
  return chain(this, createObjectOfTransformer(schema));
};
const string = function string() {
  return chain(this, stringTransformer, { regexp, domain, nonEmpty, unique });
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
