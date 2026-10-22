/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/**
 * A validator is a function of a value and an optional path that returns the
 * computed value if valid, or throws if invalid. Some validators receive extra
 * context arguments (e.g. arrayOf passes the whole array).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- validators accept and return arbitrary user config values
export type ValidatorFn = (value: any, path?: string, ...rest: any[]) => any;

/**
 * The `this` a validator may be called with; when it has a logger, warnings
 * are reported there.
 */
export type ValidatorContext =
  | { logger?: { warn: (message: string) => void } }
  | undefined;

/**
 * The methods available on every validator, regardless of data type.
 */
export type AnyValidator = ValidatorFn & {
  required: () => AnyValidator;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the default may be any config value
  default: (defaultValue: any) => AnyValidator;
  deprecated: (message: string) => AnyValidator;
};

export type ArrayValidator = AnyValidator & {
  nonEmpty: () => ArrayValidator;
  uniqueItems: () => ArrayValidator;
  required: () => ArrayValidator;
  default: (defaultValue: unknown[]) => ArrayValidator;
  deprecated: (message: string) => ArrayValidator;
};

export type NumberValidator = AnyValidator & {
  minimum: (minValue: number) => NumberValidator;
  maximum: (maxValue: number) => NumberValidator;
  integer: () => NumberValidator;
  unique: () => NumberValidator;
  required: () => NumberValidator;
  default: (defaultValue: number) => NumberValidator;
  deprecated: (message: string) => NumberValidator;
};

export type MapOfValuesValidator = AnyValidator & {
  nonEmpty: () => MapOfValuesValidator;
  required: () => MapOfValuesValidator;
  default: (defaultValue: object) => MapOfValuesValidator;
  deprecated: (message: string) => MapOfValuesValidator;
};

/**
 * objectOf's schema is normally a plain map of field name to validator, but
 * it is also idiomatically called with a bare validator (e.g. `objectOf(anything())`)
 * to mean "an object, with no per-field validation."
 */
export type ObjectValidatorSchema = Record<string, ValidatorFn> | ValidatorFn;

export type ObjectValidator = AnyValidator & {
  noUnknownFields: () => ObjectValidator;
  nonEmpty: () => ObjectValidator;
  concat: (otherObjectOfValidator: ObjectValidator) => ObjectValidator;
  renamed: (
    oldField: string,
    oldSchema: ValidatorFn,
    newField: string,
  ) => ObjectValidator;
  schema: ObjectValidatorSchema;
  required: () => ObjectValidator;
  default: (defaultValue: object) => ObjectValidator;
  deprecated: (message: string) => ObjectValidator;
};

export type StringValidator = AnyValidator & {
  regexp: () => StringValidator;
  domain: () => StringValidator;
  nonEmpty: () => StringValidator;
  unique: () => StringValidator;
  matches: (pattern: RegExp) => StringValidator;
  required: () => StringValidator;
  default: (defaultValue: string) => StringValidator;
  deprecated: (message: string) => StringValidator;
};

export const Types = {};
