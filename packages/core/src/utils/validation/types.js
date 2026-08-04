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
 * computed value if valid, or throws if invalid.
 * @typedef {(value: any, path?: string) => any} ValidatorFn
 */

/**
 * The methods available on every validator, regardless of data type.
 * @typedef {ValidatorFn & {
 *   required: () => AnyValidator,
 *   default: (defaultValue: any) => AnyValidator,
 *   deprecated: (message: string) => AnyValidator,
 * }} AnyValidator
 */

/**
 * @typedef {AnyValidator & {
 *   nonEmpty: () => ArrayValidator,
 *   uniqueItems: () => ArrayValidator,
 *   required: () => ArrayValidator,
 *   default: (defaultValue: any[]) => ArrayValidator,
 *   deprecated: (message: string) => ArrayValidator,
 * }} ArrayValidator
 */

/**
 * @typedef {AnyValidator & {
 *   minimum: (minValue: number) => NumberValidator,
 *   maximum: (maxValue: number) => NumberValidator,
 *   integer: () => NumberValidator,
 *   unique: () => NumberValidator,
 *   required: () => NumberValidator,
 *   default: (defaultValue: number) => NumberValidator,
 *   deprecated: (message: string) => NumberValidator,
 * }} NumberValidator
 */

/**
 * @typedef {AnyValidator & {
 *   nonEmpty: () => MapOfValuesValidator,
 *   required: () => MapOfValuesValidator,
 *   default: (defaultValue: object) => MapOfValuesValidator,
 *   deprecated: (message: string) => MapOfValuesValidator,
 * }} MapOfValuesValidator
 */

/**
 * objectOf's schema is normally a plain map of field name to validator, but
 * it is also idiomatically called with a bare validator (e.g. `objectOf(anything())`)
 * to mean "an object, with no per-field validation."
 * @typedef {Record<string, ValidatorFn> | ValidatorFn} ObjectValidatorSchema
 */

/**
 * @typedef {AnyValidator & {
 *   noUnknownFields: () => ObjectValidator,
 *   nonEmpty: () => ObjectValidator,
 *   concat: (otherObjectOfValidator: ObjectValidator) => ObjectValidator,
 *   renamed: (oldField: string, oldSchema: ValidatorFn, newField: string) => ObjectValidator,
 *   schema: ObjectValidatorSchema,
 *   required: () => ObjectValidator,
 *   default: (defaultValue: object) => ObjectValidator,
 *   deprecated: (message: string) => ObjectValidator,
 * }} ObjectValidator
 */

/**
 * @typedef {AnyValidator & {
 *   regexp: () => StringValidator,
 *   domain: () => StringValidator,
 *   nonEmpty: () => StringValidator,
 *   unique: () => StringValidator,
 *   matches: (pattern: RegExp) => StringValidator,
 *   required: () => StringValidator,
 *   default: (defaultValue: string) => StringValidator,
 *   deprecated: (message: string) => StringValidator,
 * }} StringValidator
 */

export const Types = {};
