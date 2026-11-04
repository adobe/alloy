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
import { CheckboxGroup, Checkbox } from "@react-spectrum/s2";
import { useFieldError, useFormField } from "../formContext";
import FieldDescriptionAndError from "../../components/fieldDescriptionAndError";
import widthStyle from "./widthStyle";
import normalizeGroupChildren from "./normalizeGroupChildren";

const FormikCheckboxGroup = ({
  name,
  children,
  description,
  width,
  ...otherProps
}) => {
  const field = useFormField(name);
  const error = useFieldError(name);
  const {
    value,
    meta: { isBlurred: touched },
  } = field.state;

  return (
    <FieldDescriptionAndError
      description={description}
      error={touched && error ? error : undefined}
      width={width}
    >
      <CheckboxGroup
        {...otherProps}
        value={value}
        onChange={field.handleChange}
        onBlur={() => field.handleBlur()}
        isInvalid={Boolean(touched && error)}
        styles={widthStyle(width)}
      >
        {normalizeGroupChildren(Checkbox, children)}
      </CheckboxGroup>
    </FieldDescriptionAndError>
  );
};

FormikCheckboxGroup.propTypes = {
  name: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  description: PropTypes.string,
  width: PropTypes.string,
};

export default FormikCheckboxGroup;
