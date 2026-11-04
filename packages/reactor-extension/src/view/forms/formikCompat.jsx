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

import { useMemo } from "react";
import {
  getBy,
  useField as useTanStackField,
  useStore,
} from "@tanstack/react-form";
import { submitForm, useFieldValidator, useFormContext } from "./formContext";

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

const nestedErrors = cachedByState((state) =>
  nest([
    ...Object.entries(state.fieldMeta)
      .filter(([, meta]) => meta?.errors?.length)
      .map(([path, meta]) => [path, meta.errors[0]]),
    ...Object.entries(state.errorMap.onDynamic ?? {}),
  ]),
);

const nestedTouched = cachedByState((state) =>
  nest(
    Object.entries(state.fieldMeta)
      .filter(([, meta]) => meta?.isBlurred)
      .map(([path]) => [path, true]),
  ),
);

const setFieldValue = async (form, name, value) => {
  form.setFieldValue(name, value, { dontUpdateMeta: true, dontValidate: true });
  form.validate("change");
};

const setFieldTouched = async (form, name, touched = true) => {
  form.setFieldMeta(name, (meta) => ({
    errorMap: {},
    errorSourceMap: {},
    ...meta,
    isTouched: touched,
    isBlurred: touched,
  }));
  form.validate("blur");
};

export const useField = (nameOrOptions) => {
  const { name, validate } =
    typeof nameOrOptions === "string" ? { name: nameOrOptions } : nameOrOptions;
  const form = useFormContext();
  const field = useTanStackField({ form, name });
  useFieldValidator(form, name, validate);
  const error = useStore(form.store, (state) =>
    getBy(nestedErrors(state), name),
  );
  const touched = useStore(form.store, (state) =>
    getBy(nestedTouched(state), name),
  );
  const { value } = field.state;
  const helpers = useMemo(
    () => ({
      setValue: (newValue) => setFieldValue(form, name, newValue),
      setTouched: (newTouched = true) =>
        setFieldTouched(form, name, newTouched),
    }),
    [form, name],
  );

  return [{ name, value }, { value, error, touched }, helpers];
};

export const useFormikContext = () => {
  const form = useFormContext();
  const state = useStore(form.store, (s) => s);
  const actions = useMemo(
    () => ({
      setFieldValue: (name, value) => setFieldValue(form, name, value),
      setFieldTouched: (name, touched) => setFieldTouched(form, name, touched),
      submitForm: () => submitForm(form),
    }),
    [form],
  );
  return {
    values: state.values,
    errors: nestedErrors(state),
    touched: nestedTouched(state),
    submitCount: state.submissionAttempts,
    isSubmitting: state.isSubmitting,
    ...actions,
  };
};

export const FieldArray = ({ name, render, children }) => {
  const form = useFormContext();
  useStore(form.store, (state) => getBy(state.values, name));
  const options = { dontUpdateMeta: true, dontValidate: true };
  const arrayHelpers = {
    push: (value) => {
      form.pushFieldValue(name, value, options);
      form.validate("change");
    },
    remove: async (index) => {
      await form.removeFieldValue(name, index, options);
      form.validate("change");
    },
    replace: async (index, value) => {
      await form.replaceFieldValue(name, index, value, options);
      form.validate("change");
    },
  };

  return (render ?? children)(arrayHelpers);
};

export const isEmptyArray = (value) =>
  Array.isArray(value) && value.length === 0;
