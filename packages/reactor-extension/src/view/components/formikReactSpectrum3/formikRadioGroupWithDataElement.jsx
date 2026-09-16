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

import { Children } from "react";
import PropTypes from "prop-types";
import { RadioGroup, Radio, TextField } from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import { useField } from "formik";
import { string } from "yup";
import RawDataElementSelector from "../rawDataElementSelector";
import singleDataElementRegex from "../../constants/singleDataElementRegex";
import { DATA_ELEMENT_REQUIRED } from "../../constants/validationErrorMessages";
import FieldSubset from "../fieldSubset";
import normalizeGroupChildren from "./normalizeGroupChildren";

export const createRadioGroupWithDataElementValidationSchema = (name) => {
  return string().when([`${name}DataElement`], {
    is: ({ isDataElement } = {}) => isDataElement,
    then: (schema) =>
      schema
        .required(DATA_ELEMENT_REQUIRED)
        .matches(singleDataElementRegex, DATA_ELEMENT_REQUIRED),
  });
};

const FormikRadioGroupWithDataElement = ({
  name,
  children,
  dataElementDescription,
  dataTestIdPrefix = name,
  ...otherProps
}) => {
  const options = Children.map(children, (child) => {
    const { value } = child.props;
    return value;
  });
  const [{ value }, { error }, { setValue, setTouched }] = useField(name);
  const [
    { value: dataElementValue },
    { touched: dataElementTouched },
    { setValue: dataElementSetValue, setTouched: dataElementSetTouched },
  ] = useField(`${name}DataElement`);

  let radioValue;
  let dataElementText;
  if (
    dataElementValue === undefined &&
    options.some((option) => option === value)
  ) {
    // We haven't ever called setValue so we don't have a dataElementValue yet,
    // but the value matches one of the options.
    radioValue = value;
    dataElementText = "";
  } else if (
    dataElementValue !== undefined &&
    !dataElementValue.isDataElement
  ) {
    radioValue = value;
    dataElementText = dataElementValue.dataElement;
  } else {
    radioValue = "dataElement";
    dataElementText = value;
  }

  const setValues = (newRadioValue, newDataElement) => {
    // set the dataElement value first because the main field validation uses it
    dataElementSetValue(
      {
        isDataElement: newRadioValue === "dataElement",
        dataElement: newDataElement,
      },
      false,
    );
    setValue(newRadioValue === "dataElement" ? newDataElement : newRadioValue);
  };

  return (
    <div>
      <RadioGroup
        {...otherProps}
        value={radioValue}
        onChange={(newValue) => {
          setValues(newValue, dataElementText);
        }}
        onBlur={() => setTouched(true)}
      >
        {normalizeGroupChildren(Radio, children)}
        <Radio
          data-test-id={`${dataTestIdPrefix}DataElementRadio`}
          value="dataElement"
        >
          Provide a data element
        </Radio>
      </RadioGroup>

      {radioValue === "dataElement" && (
        <FieldSubset>
          <RawDataElementSelector
            adjustForLabel
            onChange={(newValue) => {
              setValues("dataElement", newValue);
              dataElementSetTouched(true);
            }}
          >
            <TextField
              label="Data element"
              value={dataElementText}
              data-test-id={`${dataTestIdPrefix}DataElementField`}
              onChange={(newValue) => setValues("dataElement", newValue)}
              onBlur={() => dataElementSetTouched(true)}
              description={dataElementDescription}
              isInvalid={Boolean(dataElementTouched && error)}
              errorMessage={error}
              isRequired
              styles={style({
                width: 400,
              })}
            />
          </RawDataElementSelector>
        </FieldSubset>
      )}
    </div>
  );
};

FormikRadioGroupWithDataElement.propTypes = {
  name: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  description: PropTypes.string,
  dataElementDescription: PropTypes.string,
  width: PropTypes.string,
  dataTestIdPrefix: PropTypes.string,
};

export default FormikRadioGroupWithDataElement;
