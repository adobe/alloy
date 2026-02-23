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

import { Picker } from "@adobe/react-spectrum";
import { useField } from "formik";
import PropTypes from "prop-types";

const FormikPicker = ({ name, width, validate, onChange, ...otherProps }) => {
  const [{ value }, { touched, error }, { setValue, setTouched }] = useField({
    name,
    validate,
  });

  return (
    <Picker
      selectedKey={value}
      onSelectionChange={(key) => {
        setValue(key);
        if (onChange) {
          onChange(key);
        }
      }}
      onBlur={() => {
        setTouched(true);
      }}
      validationState={touched && error ? "invalid" : undefined}
      errorMessage={error}
      width={width}
      {...otherProps}
    />
  );
};

FormikPicker.propTypes = {
  name: PropTypes.string.isRequired,
  width: PropTypes.string,
  validate: PropTypes.func,
  onChange: PropTypes.func,
};

export default FormikPicker;
