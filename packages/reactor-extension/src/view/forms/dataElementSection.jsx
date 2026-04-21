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
import { useField } from "formik";
import { Radio } from "@adobe/react-spectrum";
import PropTypes from "prop-types";
import { object } from "yup";
import FormikRadioGroup from "../components/formikReactSpectrum3/formikRadioGroup";
import FormikTextField from "../components/formikReactSpectrum3/formikTextField";
import DataElementSelector from "../components/dataElementSelector";
import form from "./form";
import SectionHeader from "../components/sectionHeader";

const FORM = "form";
const DATA_ELEMENT = "dataElement";

/** @typedef {import("./form").Form} Form */
/**
 * This creates a form element that allows to create a section with a form or a string data element. Any items with no
 * values filled in will be removed from the final settings.
 * @param {object} options - Options for the field.
 * @param {string} options.name - The formik key to use for this field.
 *  - `${key}` will be used to store the object.
 *  - `${key}InputMethod` will be used to determine whether to use a data
 *    element.
 *  - `${key}DataElement` will be used to store the data element value.
 @param {string} options.label - The label to use for the field.
 * @param {string} options.learnMoreUrl - The URL to learn more information about this section.
 * @param {string} [options.dataElementDescription] - The description to use for
 * the data element field. Usually you would use this to describe the type the
 * data element should be or what object it should return.
 * @param {Form[]} children - The Form parts to use for the object. These will
 * be used to create the form. When rendering the
 * components, the `prefixName` prop will be set to `${name}.`
 * @returns {Form} A form element that allows the user to create an object with string keys and values.
 */
export default function dataElementSection(
  { name, label, learnMoreUrl, dataElementDescription },
  children = [],
) {
  const {
    getSettings: getChildrenSettings,
    getInitialValues: getChildrenInitialValues,
    getValidationShape: getChildrenValidationShape,
    Component,
  } = form({}, children);
  const buildDefaultValues = () =>
    getChildrenInitialValues({ initInfo: { settings: null } });

  const formPart = {
    getInitialValues({ initInfo }) {
      const { [name]: value } = initInfo.settings || {};
      const initialValues = {
        [name]: buildDefaultValues(),
        [`${name}InputMethod`]: FORM,
        [`${name}DataElement`]: "",
      };

      if (typeof value === "object" && value !== null) {
        initialValues[name] = getChildrenInitialValues({
          initInfo: { settings: value },
        });
        initialValues[`${name}InputMethod`] = FORM;
      }

      if (typeof value === "string") {
        initialValues[`${name}InputMethod`] = DATA_ELEMENT;
        initialValues[`${name}DataElement`] = value;
      }
      return initialValues;
    },
    getSettings({ values }) {
      const settings = {};

      if (values[`${name}InputMethod`] === DATA_ELEMENT) {
        settings[name] = values[`${name}DataElement`];
      }

      if (values[`${name}InputMethod`] === FORM) {
        settings[name] = getChildrenSettings({ values: values[name] });
      }
      return settings;
    },
    getValidationShape({ initInfo, existingValidationShape }) {
      return {
        ...existingValidationShape,
        [name]: object().shape({
          ...getChildrenValidationShape({
            initInfo,
            existingValidationShape: {},
          }),
        }),
      };
    },
    Component: ({ namePrefix = "", ...props }) => {
      const [{ value: inputMethod }] = useField(
        `${namePrefix}${name}InputMethod`,
      );

      return (
        <>
          <SectionHeader learnMoreUrl={learnMoreUrl}>{label}</SectionHeader>
          <FormikRadioGroup
            name={`${namePrefix}${name}InputMethod`}
            orientation="horizontal"
            aria-label="Select the input method"
          >
            <Radio data-test-id={`${namePrefix}${name}FormOption`} value={FORM}>
              Enter values manually
            </Radio>
            <Radio
              data-test-id={`${namePrefix}${name}DataElementOption`}
              value={DATA_ELEMENT}
            >
              Provide a data element.
            </Radio>
          </FormikRadioGroup>
          {inputMethod === FORM && (
            <Component
              name={name}
              namePrefix={`${namePrefix}${name}.`}
              {...props}
            />
          )}
          {inputMethod === DATA_ELEMENT && (
            <DataElementSelector>
              <FormikTextField
                data-test-id={`${namePrefix}${name}DataElementField`}
                name={`${namePrefix}${name}DataElement`}
                description={dataElementDescription}
                width="size-5000"
                aria-label={`${label} data element`}
              />
            </DataElementSelector>
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
