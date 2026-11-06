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

import { useFieldValue } from "../utils/useFieldValue";
import { Radio } from "@react-spectrum/s2";
import PropTypes from "prop-types";
import FormTextField from "./fields/TextField";
import FormRadioGroup from "./fields/RadioGroup";
import DataElementSelector from "../components/dataElementSelector";
import singleDataElementRegex from "../constants/singleDataElementRegex";
import { DATA_ELEMENT_REQUIRED } from "../constants/validationErrorMessages";
import FormNumberField from "./fields/NumberField";
import isNonEmptyString from "../utils/isNonEmptyString";
import {
  all,
  dataElementRequired,
  isEmpty,
  matches,
  parentOf,
  rule,
  when,
} from "./validation";

const NUMBER = "number";
const DATA_ELEMENT = "dataElement";

/** @typedef {import("./form").Form} Form */
/**
 * This creates a form that just supports an array of strings. Any fields not
 * filled in will be removed from the array. Each item in the array can be a
 * data element or the entire array can be a data element.
 * @param {object} options - Options for the field.
 * @param {string} options.name - The form key to use for this field.
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
  const numberMessage = `Please provide the ${label.toLowerCase()} as a number.`;
  const inputMethodIs = (inputMethod) => (value, ctx) =>
    parentOf(ctx)[`${name}InputMethod`] === inputMethod;
  const isNumber = rule(
    (value) => isEmpty(value) || !Number.isNaN(Number(value)),
    numberMessage,
  );
  const validationShape = {
    [name]: isRequired
      ? all(
          when(
            inputMethodIs(NUMBER),
            rule((value) => !isEmpty(value), numberMessage),
          ),
          isNumber,
          rule(
            (value) => isEmpty(value) || Number(value) >= 0,
            `${label} must be greater than or equal to 0`,
          ),
        )
      : isNumber,
    [`${name}DataElement`]: when(
      inputMethodIs(DATA_ELEMENT),
      isRequired
        ? dataElementRequired
        : matches(singleDataElementRegex, DATA_ELEMENT_REQUIRED),
    ),
  };
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
      const inputMethod = useFieldValue(`${namePrefix}${name}InputMethod`);

      return (
        <>
          <FormRadioGroup
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
          </FormRadioGroup>
          {inputMethod === NUMBER && (
            <FormNumberField
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
              <FormTextField
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
