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
 *
 * `T` is the validated result. `In` is the input: `unknown` (untrusted user
 * config) for validators that start a chain, or a narrower type for
 * validators only chained after one that already checked it (e.g. `domain`
 * after `string`).
 */
export type ValidatorFn<T = unknown, In = unknown> = (
  value: In,
  path?: string,
  ...rest: unknown[]
) => T;

/**
 * Any validator, as accepted by the chaining helpers. Validators are composed
 * at runtime so each stage's input is whatever the previous stage returned;
 * that can't be expressed statically, so the input is `any` here.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- see above
export type AnyValidatorFn = ValidatorFn<unknown, any>;

/**
 * The `this` a validator may be called with; when it has a logger, warnings
 * are reported there.
 */
export type ValidatorContext =
  | { logger?: { warn: (message: string) => void } }
  | undefined;

/**
 * The methods available on every validator, regardless of data type. The
 * data-type validators below list their own methods before `AnyValidator`, so
 * their overloads win and chaining (`string().required().nonEmpty()`) keeps
 * the data-type methods.
 */
export type AnyValidator = AnyValidatorFn & {
  required: () => AnyValidator;
  default: (defaultValue: unknown) => AnyValidator;
  deprecated: (message: string) => AnyValidator;
};

export type ArrayValidator = {
  nonEmpty: () => ArrayValidator;
  uniqueItems: () => ArrayValidator;
  required: () => ArrayValidator;
  default: (defaultValue: unknown[]) => ArrayValidator;
  deprecated: (message: string) => ArrayValidator;
} & AnyValidator;

export type NumberValidator = {
  minimum: (minValue: number) => NumberValidator;
  maximum: (maxValue: number) => NumberValidator;
  integer: () => NumberValidator;
  unique: () => NumberValidator;
  required: () => NumberValidator;
  default: (defaultValue: number) => NumberValidator;
  deprecated: (message: string) => NumberValidator;
} & AnyValidator;

export type MapOfValuesValidator = {
  nonEmpty: () => MapOfValuesValidator;
  required: () => MapOfValuesValidator;
  default: (defaultValue: object) => MapOfValuesValidator;
  deprecated: (message: string) => MapOfValuesValidator;
} & AnyValidator;

/**
 * objectOf's schema is normally a plain map of field name to validator, but
 * it is also idiomatically called with a bare validator (e.g. `objectOf(anything())`)
 * to mean "an object, with no per-field validation."
 */
export type ObjectValidatorSchema =
  | Record<string, AnyValidatorFn>
  | AnyValidatorFn;

export type ObjectValidator = {
  noUnknownFields: () => ObjectValidator;
  nonEmpty: () => ObjectValidator;
  concat: (otherObjectOfValidator: ObjectValidator) => ObjectValidator;
  renamed: (
    oldField: string,
    oldSchema: AnyValidatorFn,
    newField: string,
  ) => ObjectValidator;
  schema: ObjectValidatorSchema;
  required: () => ObjectValidator;
  default: (defaultValue: object) => ObjectValidator;
  deprecated: (message: string) => ObjectValidator;
} & AnyValidator;

export type StringValidator = {
  regexp: () => StringValidator;
  domain: () => StringValidator;
  nonEmpty: () => StringValidator;
  unique: () => StringValidator;
  /** `message` is accepted for readability at call sites; it is not used. */
  matches: (pattern: RegExp, message?: string) => StringValidator;
  required: () => StringValidator;
  default: (defaultValue: string) => StringValidator;
  deprecated: (message: string) => StringValidator;
} & AnyValidator;

export const Types = {};
