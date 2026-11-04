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

import { useEffect, useRef } from "react";
import { Radio } from "@react-spectrum/s2";
import { submitForm, useFormContext } from "./formContext";
import { useFieldValue } from "../utils/useFieldValue";
import PropTypes from "prop-types";
import DataElementSelector from "../components/dataElementSelector";
import singleDataElementRegex from "../constants/singleDataElementRegex";
import FormRadioGroup from "./fields/RadioGroup";
import FieldSubset from "../components/fieldSubset";
import form from "./form";
import FormElementContainer from "../components/formElementContainer";
import FormTextArea from "./fields/TextArea";

import {
  PARTS,
  WHOLE,
} from "../components/objectEditor/constants/populationStrategy";
import { getErrors, isEmpty, parentOf, rule, shape, when } from "./validation";

/** @typedef {import("./form").Form} Form */
/**
 * @property {string} name - The name of the field. This will resolve to one of the following:
 *  - A string containing a data element
 *  - An parsed object from the JSON editor
 *  - An object containing the values of the children fields
 * @property {string} [optionName] - The name of the field that will determine if the user is
 * providing a JSON object or individual fields. Defaults to `${name}Option`.
 * @property {string} label - The label for the field.
 * @property {string} [aria-label] - The aria-label for the field.
 * @property {string} [description] - The description for the field.
 * */
export default function jsonOptionalEditor(
  {
    name,
    optionName = `${name}Option`,
    label,
    "aria-label": ariaLabel,
    description,
  },
  children,
) {
  const {
    getInitialValues: getChildrenInitialValues,
    getSettings: getChildrenSettings,
    getValidationShape: childrenGetValidationShape,
    Component: ChildrenComponent,
  } = form({}, children);

  const validationShape = {};
  validationShape[`${name}Whole`] = when(
    (value, ctx) => parentOf(ctx)[optionName] === WHOLE,
    rule((value) => {
      if (isEmpty(value) || singleDataElementRegex.test(value)) {
        return true;
      }
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    }, "Please provide a valid JSON object or a data element."),
  );
  validationShape[name] = shape(
    childrenGetValidationShape({ initInfo: {}, existingValidationShape: {} }),
  );

  const formPart = {
    getInitialValues({ initInfo }) {
      const value = initInfo.settings || {};
      const initialValues = {
        [`${name}Whole`]: "",
        [optionName]: PARTS,
      };
      if (typeof value === "string") {
        initialValues[`${name}Whole`] = value;
        initialValues[optionName] = WHOLE;
      }

      initialValues[name] = getChildrenInitialValues({
        initInfo: { settings: value },
      });
      return initialValues;
    },
    getSettings({ values }) {
      const settings = {};
      if (values[optionName] === WHOLE) {
        if (values[`${name}Whole`].match(singleDataElementRegex)) {
          settings[name] = values[`${name}Whole`];
        } else {
          try {
            settings[name] = JSON.parse(values[`${name}Whole`]);
          } catch {
            // do nothing
          }
        }
      } else if (values[name] !== "") {
        settings[name] = getChildrenSettings({ values: values[name] });
      }
      return settings;
    },
    validationShape,
    Component: ({ namePrefix = "" }) => {
      // We use submitForm so that when you switch population strategies,
      // we can mark all the fields as touched and it will show the errors.
      const form = useFormContext();
      const optionValue = useFieldValue(`${namePrefix}${optionName}`);
      const value = useFieldValue(`${namePrefix}${name}`);
      const wholeValue = useFieldValue(`${namePrefix}${name}Whole`);
      const setValue = (newValue) =>
        form.setFieldValue(`${namePrefix}${name}`, newValue);
      const setWholeValue = (newValue) =>
        form.setFieldValue(`${namePrefix}${name}Whole`, newValue);
      const lastOptionValue = useRef(optionValue);
      useEffect(() => {
        if (optionValue === PARTS && lastOptionValue.current === WHOLE) {
          Promise.resolve()
            .then(() => {
              if (wholeValue !== "") {
                const wholeValueParsed = JSON.parse(wholeValue);

                return setValue(
                  getChildrenInitialValues({
                    initInfo: { settings: wholeValueParsed },
                  }),
                );
              }
              return Promise.resolve();
            })
            .catch(() => {
              return setValue(
                getChildrenInitialValues({ initInfo: { settings: {} } }),
              );
            })
            .then(() => submitForm(form));
        } else if (optionValue === WHOLE && lastOptionValue.current === PARTS) {
          const isValid =
            Object.keys(getErrors(validationShape[name], value)).length === 0;
          const childrenJson = JSON.stringify(
            getChildrenSettings({ values: value }),
            null,
            2,
          );
          if (!isValid) {
            setWholeValue("");
          } else if (childrenJson !== "{}") {
            setWholeValue(childrenJson);
          }
          submitForm(form);
        }
        lastOptionValue.current = optionValue;
      }, [optionValue]);
      return (
        <FormElementContainer>
          <FormRadioGroup
            data-test-id={`${namePrefix}${name}Field`}
            name={`${namePrefix}${optionName}`}
            label={label}
            aria-label={label || ariaLabel}
            orientation="horizontal"
            description={description}
          >
            <Radio
              value={PARTS}
              data-test-id={`${namePrefix}${name}PartsOption`}
            >
              Provide individual attributes
            </Radio>
            <Radio
              value={WHOLE}
              data-test-id={`${namePrefix}${name}WholeOption`}
            >
              Provide JSON or Data Element
            </Radio>
          </FormRadioGroup>
          {optionValue === WHOLE && (
            <FieldSubset>
              <DataElementSelector>
                <FormTextArea
                  data-test-id={`${namePrefix}${name}Whole`}
                  name={`${namePrefix}${name}Whole`}
                  aria-label="Value"
                  description={
                    "You can provide Data Elements for individual fields within the JSON " +
                    '(e.g. "%My Data%") or provide one data element for the entire object.'
                  }
                  width="size-6000"
                />
              </DataElementSelector>
            </FieldSubset>
          )}
          {optionValue === PARTS && (
            <FieldSubset>
              <ChildrenComponent namePrefix={`${namePrefix}${name}.`} />
            </FieldSubset>
          )}
        </FormElementContainer>
      );
    },
  };

  formPart.Component.propTypes = {
    namePrefix: PropTypes.string,
  };

  return formPart;
}
