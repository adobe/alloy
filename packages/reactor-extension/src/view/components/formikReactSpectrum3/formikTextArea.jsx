/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import PropTypes from "prop-types";
import { TextArea } from "@adobe/react-spectrum";
import { useField } from "formik";

/**
 * @param {Object} params
 * @param {string} params.name
 * @param {string?} params.width
 * @param {(value: T) => undefined | string} params.validate A function that will be called to validate
 * the value entered by the user. The function should return an error message if
 * the value is invalid, or null if the value is valid.
 * @returns {React.Element}
 */
const FormikTextField = ({ name, width, validate, onBlur, ...otherProps }) => {
  const [
    { value },
    { touched: fieldTouched, error: fieldError },
    { setValue, setTouched },
  ] = useField({
    name,
    validate,
  });

  const touched = otherProps.touched || fieldTouched;
  const error = otherProps.error === "" ? "" : otherProps.error || fieldError;
  const validationState =
    otherProps.invalid || (touched && error) ? "invalid" : undefined;

  return (
    <TextArea
      {...otherProps}
      value={value}
      onChange={(newValue) => {
        setValue(newValue);
      }}
      onBlur={() => {
        setTouched(true);
        if (onBlur) {
          onBlur();
        }
      }}
      validationState={validationState}
      errorMessage={error}
      width={width}
      UNSAFE_className="formik-field"
    />
  );
};

FormikTextField.propTypes = {
  name: PropTypes.string.isRequired,
  width: PropTypes.string,
  validate: PropTypes.func,
  onBlur: PropTypes.func,
};

export default FormikTextField;
