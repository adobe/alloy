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
import { ComboBox } from "@react-spectrum/s2";
import { useField } from "formik";

/**
 * @param {object} params
 * @param {string} params.name
 * @param {string?} params.width
 * @param {Function?} params.onBlur
 * @param {(value: T) => undefined | string} params.validate A function that will be called to validate
 * the value entered by the user. The function should return an error message if
 * the value is invalid, or null if the value is valid.
 * @returns {React.Element}
 */
const FormikComboBox = ({
  name,
  width,
  validate,
  onBlur = () => {},
  ...otherProps
}) => {
  const [{ value }, { touched, error }, { setValue, setTouched }] = useField({
    name,
    validate,
  });
  return (
    <ComboBox
      // TODO(S2-upgrade): check this spread for style props
      {...otherProps}
      inputValue={value}
      onInputChange={setValue}
      onBlur={(...args) => {
        onBlur(...args);
        setTouched(true);
      }}
      isInvalid={Boolean(touched && error)}
      name={name}
      // TODO(S2-upgrade): update this style prop
      width={width}
      errorMessage={error}
    />
  );
};

FormikComboBox.propTypes = {
  name: PropTypes.string.isRequired,
  onBlur: PropTypes.func,
  validate: PropTypes.func,
  width: PropTypes.string,
};

export default FormikComboBox;
