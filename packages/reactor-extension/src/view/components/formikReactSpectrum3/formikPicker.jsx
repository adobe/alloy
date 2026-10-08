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

import { Picker, PickerItem, mergeStyles } from "@react-spectrum/s2";
import { css, style } from "@react-spectrum/s2/style" with { type: "macro" };
import { useField } from "formik";
import PropTypes from "prop-types";
import widthStyle from "../widthStyle";
import normalizeCollectionChildren from "./normalizeCollectionChildren";

// The Picker's styles prop only accepts layout properties. Keep the S1 field
// appearance on its enabled trigger using S2 color tokens and a scoped macro
// selector, without overriding the disabled trigger's own colors.
const PICKER_APPEARANCE = mergeStyles(
  style({
    "--pickerBackground": { type: "backgroundColor", value: "gray-25" },
    "--pickerBorder": { type: "borderColor", value: "gray-300" },
  }),
  css(
    `& > * > button:not(:disabled) {
      background-color: var(--pickerBackground);
      box-shadow: inset 0 0 0 1px var(--pickerBorder);
    }`,
    "pickerAppearance",
  ),
);

const FormikPicker = ({
  name,
  width,
  validate,
  onChange,
  children,
  ...otherProps
}) => {
  const [{ value }, { touched, error }, { setValue, setTouched }] = useField({
    name,
    validate,
  });

  return (
    <div className={PICKER_APPEARANCE}>
      <Picker
        value={value}
        onChange={(key) => {
          setValue(key);
          if (onChange) {
            onChange(key);
          }
        }}
        onBlur={() => {
          setTouched(true);
        }}
        isInvalid={Boolean(touched && error)}
        errorMessage={error}
        styles={widthStyle(width)}
        {...otherProps}
      >
        {normalizeCollectionChildren(PickerItem, children)}
      </Picker>
    </div>
  );
};

FormikPicker.propTypes = {
  name: PropTypes.string.isRequired,
  width: PropTypes.string,
  validate: PropTypes.func,
  onChange: PropTypes.func,
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
};

export default FormikPicker;
