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
import { TextField } from "@adobe/react-spectrum";
import PropTypes from "prop-types";

/** @typedef {import("./form").Form} Form */
/**
 * Form builder for a disabled text field. When getSettings is called, this always returns the same value.
 * @param {object} options - Options for the field.
 * @param {string} options.name - The name of the field to include in settings.
 * @param {string} options.value - The value of the field to include in settings.
 * @param {string} options.valueLabel - The value to display in the text field.
 * @param {boolean} [options.isRequired] - If true, an asterisk is added
 * to the label, and the schema is updated to require the field.
 * @param {string} options.label - The label for the field.
 * @param {string} [options.description] - The description text to put under the
 * combo box.
 * @returns {Form} A disabled text field form.
 */
export default function disabledTextField({
  name,
  value,
  valueLabel,
  isRequired = false,
  label,
  description = "",
}) {
  const Component = ({ namePrefix = "" }) => {
    return (
      <TextField
        data-test-id={`${namePrefix}${name}DisabledField`}
        value={valueLabel}
        width="size-5000"
        label={label}
        isRequired={isRequired}
        description={description}
        isDisabled
      />
    );
  };
  Component.propTypes = {
    namePrefix: PropTypes.string,
  };

  return {
    getSettings() {
      return {
        [name]: value,
      };
    },
    Component,
  };
}
