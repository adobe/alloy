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
import { getIn, setIn } from "formik";
import { useFormSelector, useGetFormState } from "./formStore";

const withoutIndex = (array, index) => {
  if (!array) {
    return array;
  }
  // Spreading keeps the positions of holes in sparse error/touched arrays.
  const copy = [...array];
  copy.splice(index, 1);
  return copy.length ? copy : undefined;
};

/**
 * Replaces Formik's FieldArray. Re-renders only when the array's length
 * changes, so items should read their own values with useField.
 *
 * @param {string} name
 * @returns {{ length: number, push: Function, remove: Function }}
 */
export default (name) => {
  const getFormState = useGetFormState();
  const length = useFormSelector(
    (state) => getIn(state.values, name)?.length ?? 0,
  );

  const helpers = useMemo(() => {
    // Mirrors FieldArray: errors and touched shift with removed items, and the
    // form re-validates after the array changes.
    const update = (updateArray, alterErrorsAndTouched) => {
      const { setFormikState, validateForm, validateOnChange } = getFormState();
      let values;
      setFormikState((state) => {
        values = setIn(
          state.values,
          name,
          updateArray(getIn(state.values, name)),
        );
        if (!alterErrorsAndTouched) {
          return { ...state, values };
        }
        return {
          ...state,
          values,
          errors: setIn(
            state.errors,
            name,
            updateArray(getIn(state.errors, name), true),
          ),
          touched: setIn(
            state.touched,
            name,
            updateArray(getIn(state.touched, name), true),
          ),
        };
      });
      if (validateOnChange !== false) {
        validateForm(values);
      }
    };
    return {
      push: (item) => update((array = []) => [...array, item], false),
      remove: (index) =>
        update(
          (array, isMeta) =>
            isMeta
              ? withoutIndex(array, index)
              : array.filter((_, i) => i !== index),
          true,
        ),
    };
  }, [getFormState, name]);

  return { length, ...helpers };
};
