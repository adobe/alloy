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
import PropTypes from "prop-types";
import DataElementSelector from "../components/dataElementSelector";
import FormikTextField from "../components/formikReactSpectrum3/formikTextField";
import singleDataElementRegex from "../constants/singleDataElementRegex";
import { DATA_ELEMENT_REQUIRED } from "../constants/validationErrorMessages";

export default function dataElement({
  name,
  isRequired = false,
  label,
  description,
  tokenize = true,
}) {
  let fieldSchema = string();

  if (tokenize) {
    fieldSchema = fieldSchema.matches(
      singleDataElementRegex,
      DATA_ELEMENT_REQUIRED,
    );
  }

  if (isRequired) {
    fieldSchema = fieldSchema.required(
      `Please provide a ${label.toLowerCase()}.`,
    );
  }

  const part = {
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
      [name]: fieldSchema,
    },
    Component: ({ namePrefix = "" }) => {
      return (
        <DataElementSelector tokenize={tokenize}>
          <FormikTextField
            data-test-id={`${namePrefix}${name}TextField`}
            name={`${namePrefix}${name}`}
            label={label}
            isRequired={isRequired}
            description={description}
            width="size-5000"
          />
        </DataElementSelector>
      );
    },
  };
  part.Component.propTypes = {
    namePrefix: PropTypes.string,
  };

  return part;
}
