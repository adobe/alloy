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
import { NumberField } from "@adobe/react-spectrum";
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
const FormikNumberField = ({ name, width, validate, ...otherProps }) => {
  const [{ value }, { touched, error }, { setValue, setTouched }] = useField({
    name,
    validate,
  });

  return (
    <NumberField
      {...otherProps}
      value={value === "" ? null : value}
      onChange={(val) => {
        setValue(val).then(() => {
          setTouched(true);
        });
      }}
      onBlur={() => {
        setTouched(true);
      }}
      validationState={touched && error ? "invalid" : undefined}
      errorMessage={error}
      width={width}
    />
  );
};

FormikNumberField.propTypes = {
  name: PropTypes.string.isRequired,
  width: PropTypes.string,
  validate: PropTypes.func,
};

export default FormikNumberField;
