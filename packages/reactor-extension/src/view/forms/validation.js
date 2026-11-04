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

import { type } from "arktype";
import { getBy } from "@tanstack/react-form";
import singleDataElementRegex from "../constants/singleDataElementRegex";
import { DATA_ELEMENT_REQUIRED } from "../constants/validationErrorMessages";

export const isEmpty = (value) =>
  value === undefined || value === null || value === "";

export const parentOf = (ctx) => getBy(ctx.root, ctx.path.slice(0, -1));

// For a field of an array item, the items before the one being validated.
export const previousItems = (ctx) =>
  getBy(ctx.root, ctx.path.slice(0, -2)).slice(0, ctx.path.at(-2));

// ArkType skips an object's own predicates when one of its properties fails,
// so rules that depend on other fields are attached to the field they report
// on, and read the other values through `parentOf(ctx)` or `ctx.root`.
export const rule = (check, message) =>
  type("unknown").narrow(
    (value, ctx) =>
      check(value, ctx) ||
      ctx.reject({
        message: typeof message === "function" ? message(value, ctx) : message,
      }),
  );

export const required = (message) => rule((value) => !isEmpty(value), message);

export const matches = (regex, message) =>
  rule(
    (value) => isEmpty(value) || String(value).search(regex) !== -1,
    message,
  );

const alwaysChecked = new WeakSet();

// Fails even when the field has no value, e.g. to block saving a view whose
// required component is disabled.
export const invalid = (message) => {
  const schema = rule(() => false, message);
  alwaysChecked.add(schema);
  return schema;
};

// Validating with `schema(value)` would start a new traversal rooted at the
// value, hiding the rest of the form from rules that read `ctx.root` or
// sibling values, so nested schemas are applied within the current traversal.
const applySchema = (schema, value, ctx) => {
  const errorCount = ctx.currentErrorCount;
  schema.internal.traverseApply(value, ctx);
  return ctx.currentErrorCount === errorCount;
};

export const all = (...schemas) =>
  type("unknown").narrow((value, ctx) =>
    schemas.every((schema) => applySchema(schema, value, ctx)),
  );

export const when = (predicate, then, otherwise) =>
  type("unknown").narrow((value, ctx) => {
    const schema = predicate(value, ctx) ? then : otherwise;
    return !schema || applySchema(schema, value, ctx);
  });

// Fields missing from the values are not validated.
export const shape = (fields) =>
  type(
    Object.fromEntries(
      Object.entries(fields).map(([key, schema]) => [
        alwaysChecked.has(schema) ? key : `${key}?`,
        schema,
      ]),
    ),
  );

export const getErrors = (schema, values) => {
  const result = schema(values);
  if (!(result instanceof type.errors)) {
    return {};
  }
  return result.reduce((errors, { path, message }) => {
    const key = path.join(".");
    return key in errors ? errors : { ...errors, [key]: message };
  }, {});
};

// Keys nested errors, such as those returned by a view's `validateFormState`,
// by dot-delimited field path.
export const flattenErrors = (errors, path = "", flat = {}) => {
  if (typeof errors === "string") {
    flat[path] = errors;
  } else if (errors && typeof errors === "object") {
    Object.entries(errors).forEach(([key, value]) =>
      flattenErrors(value, path ? `${path}.${key}` : key, flat),
    );
  }
  return flat;
};

export const dataElementRequired = all(
  required(DATA_ELEMENT_REQUIRED),
  matches(singleDataElementRegex, DATA_ELEMENT_REQUIRED),
);
