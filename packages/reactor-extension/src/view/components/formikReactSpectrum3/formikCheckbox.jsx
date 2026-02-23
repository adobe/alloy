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
import { Checkbox } from "@adobe/react-spectrum";
import { useField } from "formik";
import FieldDescriptionAndError from "../fieldDescriptionAndError";

const FormikCheckbox = ({ name, description, width, ...otherProps }) => {
  const [{ value }, { touched, error }, { setValue, setTouched }] =
    useField(name);
  return (
    <FieldDescriptionAndError
      description={description}
      error={touched && error ? error : undefined}
      messagePaddingTop="size-0"
      messagePaddingStart="size-300"
    >
      <Checkbox
        {...otherProps}
        isSelected={value}
        onChange={setValue}
        onBlur={() => {
          setTouched(true);
        }}
        validationState={touched && error ? "invalid" : undefined}
        width={width}
      />
    </FieldDescriptionAndError>
  );
};

FormikCheckbox.propTypes = {
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  width: PropTypes.string,
};

export default FormikCheckbox;
