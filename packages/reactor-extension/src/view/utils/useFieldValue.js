/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { getBy, useStore } from "@tanstack/react-form";
import { useFormContext } from "../forms/formContext";

const identity = (value) => value;

/**
 * Returns the reactive value of a form field without registering the field.
 * Pass `select` to re-render only when a value derived from the field changes.
 *
 * @param {string} fieldName
 * @param {Function} [select]
 * @returns {any} The value of the field, or the selected value.
 */
export const useFieldValue = (fieldName, select = identity) => {
  const form = useFormContext();
  return useStore(form.store, (state) =>
    select(getBy(state.values, fieldName)),
  );
};
