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
import { RadioGroup, Radio } from "@react-spectrum/s2";
import { useField } from "formik";
import FieldDescriptionAndError from "../../components/fieldDescriptionAndError";
import widthStyle from "./widthStyle";
import normalizeGroupChildren from "./normalizeGroupChildren";

const FormikRadioGroup = ({
  name,
  children,
  description,
  width,
  onChange,
  ...otherProps
}) => {
  const [{ value }, { touched, error }, { setValue, setTouched }] =
    useField(name);

  return (
    <FieldDescriptionAndError
      description={description}
      error={touched && error ? error : undefined}
      width={width}
    >
      <RadioGroup
        {...otherProps}
        value={value}
        onChange={(currentValue) => {
          setValue(currentValue);
          if (onChange) {
            onChange(currentValue);
          }
        }}
        onBlur={() => setTouched(true)}
        isInvalid={Boolean(touched && error)}
        styles={widthStyle(width)}
      >
        {normalizeGroupChildren(Radio, children)}
      </RadioGroup>
    </FieldDescriptionAndError>
  );
};

FormikRadioGroup.propTypes = {
  name: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  description: PropTypes.string,
  width: PropTypes.string,
  onChange: PropTypes.func,
};

export default FormikRadioGroup;
