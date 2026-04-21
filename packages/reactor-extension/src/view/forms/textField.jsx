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
import { string } from "yup";
import PropTypes from "prop-types";
import DataElementSelector from "../components/dataElementSelector";
import FormikTextField from "../components/formikReactSpectrum3/formikTextField";

/** @typedef {import("./form").Form} Form */
/**
 * This creates a form field for a text field and supports data elements.
 * @param {object} options - Options for the field.
 * @param {string} options.name - The formik key to use for this field.
 * @param {boolean} [options.isRequired] - Whether or not the field is
 * required.
 * @param {boolean} [options.dataElementSupported] - Whether or not a data
 * element button should be included.
 * @param {string} options.label - The label to use for the field.
 * @param {string} options.description - The description to use for the field.
 * @param options.name
 * @returns {Form} A form field for a text field.
 */
export default function textField({
  name,
  isRequired = false,
  dataElementSupported = true,
  label,
  description,
  width = "size-5000",
  validationSchemaBase = string(),
  ariaLabel = label,
  isDisabled = false,
}) {
  let validationSchema = validationSchemaBase;
  if (isRequired) {
    validationSchema = validationSchema.required(
      `Please provide a ${label.toLowerCase()}.`,
    );
  }

  let Component;
  if (dataElementSupported) {
    const ComponentWithDataElement = ({
      namePrefix = "",
      hideLabel = false,
    }) => {
      return (
        <DataElementSelector>
          <FormikTextField
            data-test-id={`${namePrefix}${name}TextField`}
            name={`${namePrefix}${name}`}
            label={hideLabel ? undefined : label}
            aria-label={ariaLabel}
            isRequired={isRequired}
            description={description}
            width={width}
            isDisabled={isDisabled}
          />
        </DataElementSelector>
      );
    };
    ComponentWithDataElement.propTypes = {
      namePrefix: PropTypes.string,
      hideLabel: PropTypes.bool,
    };
    Component = ComponentWithDataElement;
  } else {
    const ComponentWithoutDataElement = ({
      namePrefix = "",
      hideLabel = false,
    }) => {
      return (
        <FormikTextField
          data-test-id={`${namePrefix}${name}TextField`}
          name={`${namePrefix}${name}`}
          label={hideLabel ? undefined : label}
          aria-label={label}
          isRequired={isRequired}
          description={description}
          width={width}
          isDisabled={isDisabled}
        />
      );
    };
    ComponentWithoutDataElement.propTypes = {
      namePrefix: PropTypes.string,
      hideLabel: PropTypes.bool,
    };
    Component = ComponentWithoutDataElement;
  }

  return {
    getInitialValues({ initInfo }) {
      const { [name]: value = "" } = initInfo.settings || {};
      return { [name]: value };
    },
    getSettings({ values }) {
      const { [name]: value } = values;
      const settings = {};
      if (value) {
        settings[name] = value;
      }
      return settings;
    },
    validationShape: {
      [name]: validationSchema,
    },
    Component,
  };
}
