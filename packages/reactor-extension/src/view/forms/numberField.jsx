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
import { number, string } from "yup";
import { useField } from "formik";
import { Radio } from "@adobe/react-spectrum";
import PropTypes from "prop-types";
import FormikTextField from "../components/formikReactSpectrum3/formikTextField";
import FormikRadioGroup from "../components/formikReactSpectrum3/formikRadioGroup";
import DataElementSelector from "../components/dataElementSelector";
import singleDataElementRegex from "../constants/singleDataElementRegex";
import { DATA_ELEMENT_REQUIRED } from "../constants/validationErrorMessages";
import FormikNumberField from "../components/formikReactSpectrum3/formikNumberField";
import isNonEmptyString from "../utils/isNonEmptyString";

const NUMBER = "number";
const DATA_ELEMENT = "dataElement";

/** @typedef {import("./form").Form} Form */
/**
 * This creates a form that just supports an array of strings. Any fields not
 * filled in will be removed from the array. Each item in the array can be a
 * data element or the entire array can be a data element.
 * @param {object} options - Options for the field.
 * @param {string} options.name - The formik key to use for this field.
 * - `${key}InputMethod` will be used to determine whether or not to use a data
 *   element.
 * - `${key}DataElement` will be used to store the data element value.
 * @param {string} options.label - The label to use for the field.
 * @param {string} [options.description] - The description to use for the field.
 * This will appear bellow the last string field.
 * @param {string} [options.dataElementDescription] - The description to use for
 * the data element field. Usually you would use this to describe the type the
 * data element should be.
 * @param {boolean} [options.isRequired] - Whether or not the field is
 * required. When required, the user will need to enter at least one string.

 * @returns {Form} A form field for an array of strings.
 */
export default function numberField({
  name,
  isRequired = false,
  label,
  description,
  dataElementDescription,
}) {
  const validationShape = {
    [name]: number().typeError(
      `Please provide the ${label.toLowerCase()} as a number.`,
    ),
    [`${name}DataElement`]: string().when(`${name}InputMethod`, {
      is: DATA_ELEMENT,
      then: (schema) =>
        schema.matches(singleDataElementRegex, DATA_ELEMENT_REQUIRED),
    }),
  };

  if (isRequired) {
    validationShape[name] = number()
      .min(0)
      .typeError(`Please provide the ${label.toLowerCase()} as a number.`)
      .when(`${name}InputMethod`, {
        is: NUMBER,
        then: (schema) =>
          schema.required(
            `Please provide the ${label.toLowerCase()} as a number.`,
          ),
      });
    validationShape[`${name}DataElement`] = string().when(
      `${name}InputMethod`,
      {
        is: DATA_ELEMENT,
        then: (schema) =>
          schema
            .matches(singleDataElementRegex, DATA_ELEMENT_REQUIRED)
            .required(DATA_ELEMENT_REQUIRED),
      },
    );
  }
  const part = {
    getInitialValues({ initInfo }) {
      const { [name]: value } = initInfo.settings || {};

      const initialValues = {
        [name]: value,
        [`${name}InputMethod`]: NUMBER,
        [`${name}DataElement`]: "",
      };

      if (typeof value === "string") {
        initialValues[name] = undefined;
        initialValues[`${name}InputMethod`] = DATA_ELEMENT;
        initialValues[`${name}DataElement`] = value;
      }
      return initialValues;
    },
    getSettings({ values }) {
      const settings = {};
      if (values[`${name}InputMethod`] === NUMBER) {
        settings[name] = values[name];
      }
      if (
        values[`${name}InputMethod`] === DATA_ELEMENT &&
        isNonEmptyString(values[`${name}DataElement`])
      ) {
        settings[name] = values[`${name}DataElement`];
      }

      return settings;
    },
    validationShape,
    Component: ({ namePrefix = "" }) => {
      const [{ value: inputMethod }] = useField(
        `${namePrefix}${name}InputMethod`,
      );

      return (
        <>
          <FormikRadioGroup
            name={`${namePrefix}${name}InputMethod`}
            orientation="horizontal"
            label={label}
            isRequired={isRequired}
          >
            <Radio
              data-test-id={`${namePrefix}${name}NumberOption`}
              value={NUMBER}
            >
              Manually enter {label.toLowerCase()}.
            </Radio>
            <Radio
              data-test-id={`${namePrefix}${name}DataElementOption`}
              value={DATA_ELEMENT}
            >
              Provide a data element.
            </Radio>
          </FormikRadioGroup>
          {inputMethod === NUMBER && (
            <FormikNumberField
              data-test-id={`${namePrefix}${name}NumberField`}
              name={`${namePrefix}${name}`}
              isRequired={isRequired}
              description={description}
              width="size-5000"
              aria-label={`${label} number field`}
            />
          )}
          {inputMethod === DATA_ELEMENT && (
            <DataElementSelector>
              <FormikTextField
                data-test-id={`${namePrefix}${name}DataElementField`}
                name={`${namePrefix}${name}DataElement`}
                description={dataElementDescription}
                width="size-5000"
                isRequired={isRequired}
                aria-label={`${label} data element`}
              />
            </DataElementSelector>
          )}
        </>
      );
    },
  };
  part.Component.propTypes = {
    namePrefix: PropTypes.string,
  };
  return part;
}
