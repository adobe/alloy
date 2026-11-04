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

/**
 * Returns the reactive value of a form field without registering the field.
 *
 * @param {string} fieldName
 * @returns {any} The value of the field.
 */
export const useFieldValue = (fieldName) => {
  const form = useFormContext();
  return useStore(form.store, (state) => getBy(state.values, fieldName));
};
