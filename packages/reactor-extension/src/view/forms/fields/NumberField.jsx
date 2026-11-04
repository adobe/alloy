/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import PropTypes from "prop-types";
import { NumberField } from "@react-spectrum/s2";
import { useFieldError, useFormField } from "../formContext";
import widthStyle from "./widthStyle";

/**
 * @param {Object} params
 * @param {string} params.name
 * @param {string?} params.width
 * @param {(value: T) => undefined | string} params.validate A function that will be called to validate
 * the value entered by the user. The function should return an error message if
 * the value is invalid, or null if the value is valid.
 * @returns {React.Element}
 */
const FormNumberField = ({ name, width, validate, ...otherProps }) => {
  const field = useFormField(name, { validate });
  const error = useFieldError(name);
  const {
    value,
    meta: { isBlurred: touched },
  } = field.state;

  return (
    <NumberField
      {...otherProps}
      value={value === "" ? null : value}
      onChange={(val) => {
        field.handleChange(val);
        field.handleBlur();
      }}
      onBlur={() => {
        field.handleBlur();
      }}
      isInvalid={Boolean(touched && error)}
      errorMessage={error}
      styles={widthStyle(width)}
    />
  );
};

FormNumberField.propTypes = {
  name: PropTypes.string.isRequired,
  width: PropTypes.string,
  validate: PropTypes.func,
};

export default FormNumberField;
