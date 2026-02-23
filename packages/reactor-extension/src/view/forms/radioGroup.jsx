/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { string } from "yup";
import { Radio } from "@adobe/react-spectrum";
import { useField } from "formik";
import PropTypes from "prop-types";
import DataElementSelector from "../components/dataElementSelector";
import singleDataElementRegex from "../constants/singleDataElementRegex";
import FormikRadioGroup from "../components/formikReactSpectrum3/formikRadioGroup";
import { DATA_ELEMENT_REQUIRED } from "../constants/validationErrorMessages";
import FormikTextField from "../components/formikReactSpectrum3/formikTextField";
import FieldSubset from "../components/fieldSubset";
import BetaBadge from "../components/betaBadge";

/** @typedef {import("./form").Form} Form */
/**
 * This creates a form field for a radio group and supports data elements.
 * @param {object} options - Options for the radio group.
 * @param {string} options.name - The formik key to use for this field. The
 * following formik keys will be used:
 *  - `${name}` - The radio group field.
 *  - `${name}DataElement` - The data element field.
 * @param {boolean} [options.isRequired] - Whether or not the field is required.
 * @param {boolean} [options.dataElementSupported] - Whether or not a "Provide a
 * data element" option should be available.
 * @param {string} options.label - The label to use for the field.
 * @param {string} [options.defaultValue] - The default value to use for the radio
 * group.
 * @param {string} [options.dataElementDescription] - The description to use for
 * the data element field. Usually you would use this to describe the values the
 * data element could resolve to.
 * @param {{ value: string, label: string }[]} options.items - The items to use for the radio group.
 * @param {string} [options.description] - The description to use for the radio group.
 * @param {boolean} [options.beta] - If true, a beta badge will be shown next to the
 * radio group label.
 * @returns {Form} A form field for a radio group.
 */
export default function radioGroup({
  name,
  isRequired = false,
  dataElementSupported = true,
  label,
  dataElementDescription,
  items,
  defaultValue = "",
  description,
  beta,
  orientation = "vertical",
}) {
  const validationShape = {};
  if (isRequired) {
    validationShape[name] = string().required("Please select an option.");
  }
  if (dataElementSupported) {
    validationShape[`${name}DataElement`] = string().when(name, {
      is: "dataElement",
      then: (schema) =>
        schema
          .matches(singleDataElementRegex, DATA_ELEMENT_REQUIRED)
          .required(DATA_ELEMENT_REQUIRED),
    });
  }

  const labelElement = (
    <>
      {label}
      {beta && <BetaBadge />}
    </>
  );

  const formPart = {
    getInitialValues({ initInfo }) {
      const { [name]: value = defaultValue } = initInfo.settings || {};
      const initialValues = {
        [name]: value,
        [`${name}DataElement`]: "",
      };
      if (dataElementSupported) {
        initialValues[`${name}DataElement`] = "";
        if (value.match(singleDataElementRegex)) {
          initialValues[`${name}DataElement`] = value;
          initialValues[name] = "dataElement";
        }
      }
      return initialValues;
    },
    getSettings({ values }) {
      const settings = {};
      if (values[name] === "dataElement") {
        settings[name] = values[`${name}DataElement`];
      } else if (values[name] !== defaultValue) {
        settings[name] = values[name];
      }
      return settings;
    },
    validationShape,
    Component: ({ namePrefix = "" }) => {
      const [{ value }] = useField(`${namePrefix}${name}`);
      return (
        <>
          <FormikRadioGroup
            data-test-id={`${namePrefix}${name}Field`}
            name={`${namePrefix}${name}`}
            label={labelElement}
            isRequired={isRequired}
            width="size-5000"
            description={description}
            orientation={orientation}
          >
            <>
              {items.map((item) => (
                <Radio
                  value={item.value}
                  key={item.value}
                  data-test-id={`${namePrefix}${name}${item.value}Option`}
                >
                  {item.label}
                </Radio>
              ))}
              {dataElementSupported && (
                <Radio
                  value="dataElement"
                  data-test-id={`${namePrefix}${name}DataElement`}
                >
                  Provide a data element
                </Radio>
              )}
            </>
          </FormikRadioGroup>
          {dataElementSupported && value === "dataElement" && (
            <FieldSubset>
              <DataElementSelector>
                <FormikTextField
                  data-test-id={`${namePrefix}${name}DataElementField`}
                  name={`${namePrefix}${name}DataElement`}
                  aria-label={`${label} data element`}
                  description={dataElementDescription}
                  width="size-5000"
                />
              </DataElementSelector>
            </FieldSubset>
          )}
        </>
      );
    },
  };

  formPart.Component.propTypes = {
    namePrefix: PropTypes.string,
  };

  return formPart;
}
