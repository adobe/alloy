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

import { useEffect } from "react";
import {
  createFormHookContexts,
  getBy,
  useField,
  useStore,
} from "@tanstack/react-form";

export const { formContext, useFormContext } = createFormHookContexts();

const fieldValidatorsByForm = new WeakMap();

const getFieldValidators = (form) => {
  if (!fieldValidatorsByForm.has(form)) {
    fieldValidatorsByForm.set(form, new Map());
  }
  return fieldValidatorsByForm.get(form);
};

// Several components can subscribe to the same field, so a validator is kept
// per form rather than on whichever TanStack field instance mounted last.
export const useFieldValidator = (form, name, validate) => {
  useEffect(() => {
    if (!validate) {
      return undefined;
    }
    const validators = getFieldValidators(form);
    validators.set(name, validate);
    return () => {
      if (validators.get(name) === validate) {
        validators.delete(name);
      }
    };
  }, [form, name, validate]);
};

export const getFieldValidatorErrors = (form, values) =>
  Object.fromEntries(
    [...getFieldValidators(form)]
      .map(([name, validate]) => [name, validate(getBy(values, name))])
      .filter(([, error]) => error),
  );

// Formik ran the whole-form validator on every change, blur and submit, but
// not on mount. TanStack's default logic only runs the validator registered
// for the triggering event, so we register one `onDynamic` validator and run
// it for all three.
export const validateOnChangeBlurAndSubmit = ({
  validators,
  event,
  form,
  runValidation,
}) =>
  runValidation({
    validators:
      event.async || event.type === "mount" || event.type === "server"
        ? []
        : [{ fn: validators?.onDynamic, cause: "dynamic" }],
    form,
  });

const collectPaths = (value, path, paths) => {
  if (path) {
    paths.push(path);
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      collectPaths(item, path ? `${path}.${index}` : `${index}`, paths),
    );
  } else if (value !== null && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) =>
      collectPaths(item, path ? `${path}.${key}` : key, paths),
    );
  }
  return paths;
};

const withBlurred = (meta, isBlurred) => ({
  errorMap: {},
  errorSourceMap: {},
  ...meta,
  isTouched: isBlurred,
  isBlurred,
});

export const setFieldBlurred = (form, name, isBlurred = true) => {
  form.setFieldMeta(name, (meta) => withBlurred(meta, isBlurred));
  if (isBlurred) {
    form.validate("blur");
  }
};

// Fields that are not mounted (other tabs, collapsed sections, unselected
// tree nodes) still need to show their errors once they appear, so every
// value is marked as touched rather than only the registered fields. Arrays
// and objects are included, like Formik, so an empty list shows its error.
export const submitForm = async (form) => {
  form.baseStore.setState((state) => {
    const fieldMetaBase = { ...state.fieldMetaBase };
    collectPaths(state.values, "", []).forEach((path) => {
      fieldMetaBase[path] = withBlurred(fieldMetaBase[path], true);
    });
    return { ...state, fieldMetaBase };
  });
  // The first submit of an already invalid form skips validation, so errors
  // from validators registered since the last change would not show.
  form.validate("submit");
  await form.handleSubmit();
};

// Errors are kept at the form level (keyed by field path) rather than on
// field meta, because TanStack clears a field's errors when it unmounts and
// does not revalidate when it mounts again. Formik kept them, so a field in
// another tab or a collapsed section still shows its error when it reappears.
export const useFieldError = (name) => {
  const form = useFormContext();
  return useStore(form.store, (state) => state.errorMap.onDynamic?.[name]);
};

export const useFormField = (name, { validate, mode } = {}) => {
  const form = useFormContext();
  useFieldValidator(form, name, validate);
  return useField({ form, name, mode });
};

// Formik treated an array or object as touched once any of its children was,
// which array-level errors (e.g. "Please provide at least one item") rely on.
export const useFieldBlurred = (name) => {
  const form = useFormContext();
  return useStore(form.store, (state) =>
    Object.entries(state.fieldMeta).some(
      ([path, meta]) =>
        meta?.isBlurred && (path === name || path.startsWith(`${name}.`)),
    ),
  );
};

const setIn = (target, path, value) => {
  const keys = path.split(".");
  const last = keys.pop();
  const parent = keys.reduce((node, key, index) => {
    if (node[key] === null || typeof node[key] !== "object") {
      node[key] = /^\d+$/.test(keys[index + 1] ?? last) ? [] : {};
    }
    return node[key];
  }, target);
  parent[last] = value;
};

const nest = (entries) =>
  entries.reduce((nested, [path, value]) => {
    if (getBy(nested, path) === undefined) {
      setIn(nested, path, value);
    }
    return nested;
  }, {});

const cachedByState = (compute) => {
  const cache = new WeakMap();
  return (state) => {
    if (!cache.has(state)) {
      cache.set(state, compute(state));
    }
    return cache.get(state);
  };
};

// Errors and blurred flags shaped like the form values, for components that
// walk a whole subtree (e.g. the XDM tree) rather than read single fields.
export const selectErrorTree = cachedByState((state) =>
  nest(Object.entries(state.errorMap.onDynamic ?? {})),
);

export const selectBlurredTree = cachedByState((state) =>
  nest(
    Object.entries(state.fieldMeta)
      .filter(([, meta]) => meta?.isBlurred)
      .map(([path]) => [path, true]),
  ),
);
