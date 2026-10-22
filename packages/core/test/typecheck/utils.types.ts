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

// Compile-time tests for the public types of core utils. Checked by
// `pnpm --filter @adobe/alloy-core run typecheck`; never executed.

/* eslint-disable import/extensions -- `.js` specifiers resolve to `.ts` sources, as in src */
import { expectTypeOf } from "vitest";
import {
  isBoolean,
  isFunction,
  isInteger,
  isNil,
  isNonEmptyArray,
  isNonEmptyString,
  isNumber,
  isObject,
  isString,
  filterObject,
  toArray,
  deepAssign,
  createCallbackAggregator,
} from "../../src/utils/index.js";
import createSubscription from "../../src/utils/createSubscription.js";
import type { Callback } from "../../src/utils/types.js";
import { mergeDecisionsMeta } from "../../src/utils/event.js";
import type { DecisionsMeta } from "../../src/utils/event.js";
import { assertValid } from "../../src/utils/validation/utils.js";
import booleanValidator from "../../src/utils/validation/booleanValidator.js";
import callbackValidator from "../../src/utils/validation/callbackValidator.js";
import domainValidator from "../../src/utils/validation/domainValidator.js";
import integerValidator from "../../src/utils/validation/integerValidator.js";
import numberValidator from "../../src/utils/validation/numberValidator.js";
import regexpValidator from "../../src/utils/validation/regexpValidator.js";
import requiredValidator from "../../src/utils/validation/requiredValidator.js";
import stringValidator from "../../src/utils/validation/stringValidator.js";
import type { ValidatorFn } from "../../src/utils/validation/types.js";

declare const input: unknown;

// Type guards narrow.
if (isBoolean(input)) expectTypeOf(input).toEqualTypeOf<boolean>();
if (isNumber(input)) expectTypeOf(input).toExtend<number>();
if (isInteger(input)) expectTypeOf(input).toExtend<number>();
if (isString(input)) expectTypeOf(input).toEqualTypeOf<string>();
if (isNonEmptyString(input)) expectTypeOf(input).toExtend<string>();
if (isNil(input)) expectTypeOf(input).toEqualTypeOf<null | undefined>();
if (isObject(input)) {
  expectTypeOf(input).toEqualTypeOf<Record<string, unknown>>();
}
if (isNonEmptyArray(input)) expectTypeOf(input).toExtend<unknown[]>();
if (isFunction(input)) expectTypeOf(input).toBeFunction();

// Refining guards narrow only on true: NaN, "" and [] keep the declared type
// in the false branch.
declare const maybeNumber: number | undefined;
if (isNumber(maybeNumber)) {
  expectTypeOf(maybeNumber).toExtend<number>();
  expectTypeOf(maybeNumber + 1).toEqualTypeOf<number>();
} else {
  expectTypeOf(maybeNumber).toEqualTypeOf<number | undefined>();
}
if (isInteger(maybeNumber)) {
  expectTypeOf(maybeNumber).toExtend<number>();
} else {
  expectTypeOf(maybeNumber).toEqualTypeOf<number | undefined>();
}
declare const maybeString: string | null;
if (isNonEmptyString(maybeString)) {
  expectTypeOf(maybeString).toExtend<string>();
  expectTypeOf(maybeString.toLowerCase()).toEqualTypeOf<string>();
} else {
  expectTypeOf(maybeString).toEqualTypeOf<string | null>();
}
declare const maybeArray: string[] | undefined;
if (isNonEmptyArray(maybeArray)) {
  expectTypeOf(maybeArray).toExtend<string[]>();
  expectTypeOf(maybeArray[0]).toEqualTypeOf<string>();
} else {
  expectTypeOf(maybeArray).toEqualTypeOf<string[] | undefined>();
}

// assertValid is an assertion function.
declare const asserted: unknown;
assertValid(isString(asserted), asserted, "p", "a string");
expectTypeOf(asserted).toEqualTypeOf<string>();

// Leaf validators have precise return types.
expectTypeOf(booleanValidator).returns.toEqualTypeOf<boolean>();
expectTypeOf(numberValidator).returns.toEqualTypeOf<number>();
expectTypeOf(integerValidator).returns.toEqualTypeOf<number>();
expectTypeOf(stringValidator).returns.toEqualTypeOf<string>();
expectTypeOf(regexpValidator).returns.toEqualTypeOf<string>();
expectTypeOf(domainValidator).returns.toEqualTypeOf<string>();
expectTypeOf(requiredValidator).returns.toEqualTypeOf<NonNullable<unknown>>();
expectTypeOf(callbackValidator).returns.toBeFunction();
expectTypeOf(booleanValidator).toExtend<ValidatorFn<boolean>>();
expectTypeOf(booleanValidator).parameter(0).toEqualTypeOf<unknown>();

// Generic helpers keep the caller's types.
expectTypeOf(filterObject({ a: 1, b: "x" }, () => true)).toEqualTypeOf<
  Partial<{ a: number; b: string }>
>();
declare const nodes: NodeListOf<HTMLDivElement>;
expectTypeOf(toArray(nodes)).toEqualTypeOf<HTMLDivElement[]>();
expectTypeOf(toArray([1, 2])).toEqualTypeOf<number[]>();
expectTypeOf(deepAssign({ a: 1 }, { b: 2 })).toEqualTypeOf<
  { a: number } & { b: number }
>();

// Callback is shared.
expectTypeOf(createCallbackAggregator().add)
  .parameter(0)
  .toEqualTypeOf<Callback>();
expectTypeOf(createSubscription().add).parameter(0).toEqualTypeOf<Callback>();

// Proposition helpers use the decisioning shape.
expectTypeOf(mergeDecisionsMeta).parameter(1).toEqualTypeOf<DecisionsMeta>();
