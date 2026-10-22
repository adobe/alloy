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
 * The methods available on every validator, regardless of data type. `Self`
 * is the validator type the chain continues with, so `string().required()`
 * keeps the string methods. Method syntax keeps `default`'s parameter
 * bivariant, so every validator stays assignable to `AnyValidator`.
 */
export interface BaseValidatorMethods<Self, Default = unknown> {
  required(): Self;
  default(defaultValue: Default): Self;
  deprecated(message: string): Self;
}

export type AnyValidator = AnyValidatorFn & BaseValidatorMethods<AnyValidator>;

export type ArrayValidator = AnyValidatorFn &
  BaseValidatorMethods<ArrayValidator, unknown[]> & {
    nonEmpty(): ArrayValidator;
    uniqueItems(): ArrayValidator;
  };

export type NumberValidator = AnyValidatorFn &
  BaseValidatorMethods<NumberValidator, number> & {
    minimum(minValue: number): NumberValidator;
    maximum(maxValue: number): NumberValidator;
    integer(): NumberValidator;
    unique(): NumberValidator;
  };

export type MapOfValuesValidator = AnyValidatorFn &
  BaseValidatorMethods<MapOfValuesValidator, object> & {
    nonEmpty(): MapOfValuesValidator;
  };

/**
 * objectOf's schema is normally a plain map of field name to validator, but
 * it is also idiomatically called with a bare validator (e.g. `objectOf(anything())`)
 * to mean "an object, with no per-field validation."
 */
export type ObjectValidatorSchema =
  | Record<string, AnyValidatorFn>
  | AnyValidatorFn;

export type ObjectValidator = AnyValidatorFn &
  BaseValidatorMethods<ObjectValidator, object> & {
    noUnknownFields(): ObjectValidator;
    nonEmpty(): ObjectValidator;
    concat(otherObjectOfValidator: ObjectValidator): ObjectValidator;
    renamed(
      oldField: string,
      oldSchema: AnyValidatorFn,
      newField: string,
    ): ObjectValidator;
    schema: ObjectValidatorSchema;
  };

export type StringValidator = AnyValidatorFn &
  BaseValidatorMethods<StringValidator, string> & {
    regexp(): StringValidator;
    domain(): StringValidator;
    nonEmpty(): StringValidator;
    unique(): StringValidator;
    /** `message` is accepted for callers' readability; it is not used. */
    matches(pattern: RegExp, message?: string): StringValidator;
  };

export const Types = {};
