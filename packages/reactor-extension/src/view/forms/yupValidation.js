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

import { getBy, setBy } from "@tanstack/react-form";

const isPlainObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  Object.getPrototypeOf(value) === Object.prototype;

// Formik validated a copy of the values with empty strings replaced by
// undefined, which is what our Yup schemas expect.
const prepareDataForValidation = (values) => {
  const prepare = (value) =>
    Array.isArray(value) || isPlainObject(value)
      ? prepareDataForValidation(value)
      : value !== ""
        ? value
        : undefined;
  return Array.isArray(values)
    ? values.map(prepare)
    : Object.fromEntries(
        Object.entries(values).map(([key, value]) => [key, prepare(value)]),
      );
};

const flatten = (errors, path = "", flat = {}) => {
  if (typeof errors === "string") {
    flat[path] = errors;
  } else if (errors && typeof errors === "object") {
    Object.entries(errors).forEach(([key, value]) =>
      flatten(value, path ? `${path}.${key}` : key, flat),
    );
  }
  return flat;
};

const yupErrors = (schema, values) => {
  const prepared = prepareDataForValidation(values);
  try {
    schema.validateSync(prepared, { abortEarly: false, context: prepared });
    return {};
  } catch (error) {
    if (error.name !== "ValidationError") {
      throw error;
    }
    const inner = error.inner.length ? error.inner : [error];
    return inner.reduce(
      (errors, { path, message }) =>
        getBy(errors, path) ? errors : setBy(errors, path, message),
      {},
    );
  }
};

/**
 * Returns the errors Formik would have produced, keyed by field path.
 */
export const getFormErrors = ({ schema, validate, values }) => ({
  ...flatten(yupErrors(schema, values)),
  ...flatten(validate?.({ values })),
});

export const isValidAgainstSchema = (schema, values) => {
  try {
    schema.validateSync(values, { abortEarly: false, context: values });
    return true;
  } catch {
    return false;
  }
};
