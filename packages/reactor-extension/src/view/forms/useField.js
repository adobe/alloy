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

import { useEffect, useMemo } from "react";
import { getIn } from "formik";
import { useFormSelector, useFormStore } from "./formStore";

/**
 * A drop-in replacement for Formik's useField that re-renders only when this
 * field's value, error, or touched state changes, rather than on every change
 * to the form. Must be rendered inside a FormStoreProvider.
 *
 * See https://formik.org/docs/api/useField for the return shape.
 *
 * @param {string|Object} propsOrFieldName
 */
export default (propsOrFieldName) => {
  const props =
    typeof propsOrFieldName === "object"
      ? propsOrFieldName
      : { name: propsOrFieldName };
  const { name, validate, type, value: valueProp, as, multiple } = props;
  const store = useFormStore();

  const value = useFormSelector((state) => getIn(state.values, name));
  const error = useFormSelector((state) => getIn(state.errors, name));
  const touched = useFormSelector((state) => !!getIn(state.touched, name));
  const initialValue = useFormSelector((state) =>
    getIn(state.initialValues, name),
  );
  const initialTouched = useFormSelector(
    (state) => !!getIn(state.initialTouched, name),
  );
  const initialError = useFormSelector((state) =>
    getIn(state.initialErrors, name),
  );

  useEffect(() => {
    const { registerField, unregisterField } = store.getState();
    registerField(name, { validate });
    return () => unregisterField(name);
  }, [store, name, validate]);

  // Reads Formik at call time so callbacks keep a stable identity.
  const handlers = useMemo(
    () => ({
      onChange: (event) => store.getState().handleChange(event),
      onBlur: (event) => store.getState().handleBlur(event),
      helpers: {
        setValue: (nextValue, shouldValidate) =>
          store.getState().setFieldValue(name, nextValue, shouldValidate),
        setTouched: (nextTouched, shouldValidate) =>
          store.getState().setFieldTouched(name, nextTouched, shouldValidate),
        setError: (nextError) =>
          store.getState().setFieldError(name, nextError),
      },
    }),
    [store, name],
  );

  const field = {
    name,
    value,
    onChange: handlers.onChange,
    onBlur: handlers.onBlur,
  };
  if (type === "checkbox") {
    if (valueProp === undefined) {
      field.checked = !!value;
    } else {
      field.checked = Array.isArray(value) && value.includes(valueProp);
      field.value = valueProp;
    }
  } else if (type === "radio") {
    field.checked = value === valueProp;
    field.value = valueProp;
  } else if (as === "select" && multiple) {
    field.value = value || [];
    field.multiple = true;
  }

  return [
    field,
    { value, error, touched, initialValue, initialTouched, initialError },
    handlers.helpers,
  ];
};
