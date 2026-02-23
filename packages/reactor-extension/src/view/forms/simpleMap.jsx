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
import { array, object, string } from "yup";
import { FieldArray, useField } from "formik";
import { Well, Radio, Flex, Button } from "@adobe/react-spectrum";
import PropTypes from "prop-types";
import FormikTextField from "../components/formikReactSpectrum3/formikTextField";
import FormikRadioGroup from "../components/formikReactSpectrum3/formikRadioGroup";
import DataElementSelector from "../components/dataElementSelector";
import singleDataElementRegex from "../constants/singleDataElementRegex";
import { DATA_ELEMENT_REQUIRED } from "../constants/validationErrorMessages";
import FormElementContainer from "../components/formElementContainer";
import BetaBadge from "../components/betaBadge";

const FORM = "form";
const DATA_ELEMENT = "dataElement";

/** @typedef {import("./form").Form} Form */
/**
 * This creates a form that builds an object with key value pairs.
 * @param {object} options - Options for the field.
 * @param {string} options.name - The formik key to use for this field.
 * - `${key}` will be used to store the object.
 * - `${key}InputMethod` will be used to determine whether or not to use a data
 *   element.
 * - `${key}DataElement` will be used to store the data element value.
 * @param {string} options.label - The label to use for the field.
 * @param {string} options.singularLabel - The singular label to use for the add
 * button. (i.e. "entry" for "Add entry")
 * @param {string} options.description - The description to use for the field.
 * This appears just below the radio buttons and above the array items.
 * @param {string} [options.dataElementDescription] - The description to use for
 * the data element field. Usually you would use this to describe the type the
 * data element should be.
 * @param {string} [options.keyLabel] - The label to use for the key field.
 * @param {string} [options.keyDescription] - The description to use for the key
 * field.
 * @param {string} [options.valueLabel] - The label to use for the value field.
 * @param {string} [options.valueDescription] - The description to use for the
 * value field.
 * @param {boolean} [options.beta] - If true, a beta badge will be shown next to
 * the label.
 * @returns {Form} A form field for an array of strings.
 */
export default function simpleMap({
  name,
  label,
  singularLabel,
  description,
  dataElementDescription,
  keyLabel,
  keyLabelPlural,
  keyDescription,
  valueLabel,
  valueDescription,
  beta,
}) {
  const itemSchema = object()
    .shape({
      key: string(),
      value: string(),
    })
    .test(
      "Map key unique and present",
      `Duplicate ${keyLabelPlural.toLowerCase()} are not allowed`,
      (item, context) => {
        const { key, value } = item || {};
        if (!key && !value) {
          return true;
        }

        if (!key && value) {
          throw context.createError({
            path: `${context.path}.key`,
            message: `Please provide a ${keyLabel.toLowerCase()}.`,
          });
        }

        const { path, parent } = context;
        const items = [...parent];
        const currentIndex = items.indexOf(item);
        const previousItems = items.slice(0, currentIndex);
        if (previousItems.some(({ key: previousKey }) => key === previousKey)) {
          throw context.createError({
            path: `${path}.key`,
            message: `Duplicate ${keyLabelPlural.toLowerCase()} are not allowed`,
          });
        }

        return true;
      },
    );

  const validationShape = {
    [name]: array().when(`${name}InputMethod`, {
      is: FORM,
      then: (schema) => schema.of(itemSchema),
    }),
  };

  validationShape[`${name}DataElement`] = string().when(`${name}InputMethod`, {
    is: DATA_ELEMENT,
    then: (schema) =>
      schema
        .matches(singleDataElementRegex, DATA_ELEMENT_REQUIRED)
        .required(DATA_ELEMENT_REQUIRED),
  });

  const part = {
    getInitialValues({ initInfo }) {
      const { [name]: value } = initInfo.settings || {};

      const initialValues = {
        [`${name}InputMethod`]: FORM,
        [`${name}DataElement`]: "",
      };

      if (typeof value === "string") {
        initialValues[name] = [{ key: "", value: "" }];
        initialValues[`${name}InputMethod`] = DATA_ELEMENT;
        initialValues[`${name}DataElement`] = value;
      } else if (value) {
        initialValues[name] = Object.keys(value).map((key) => ({
          key,
          value: value[key] || "",
        }));
      } else {
        initialValues[name] = [{ key: "", value: "" }];
      }
      return initialValues;
    },
    getSettings({ values }) {
      const settings = {};
      if (values[`${name}InputMethod`] === FORM) {
        const filteredValues = values[name].filter(({ key }) => key);
        if (filteredValues.length > 0) {
          settings[name] = filteredValues.reduce((obj, { key, value }) => {
            obj[key] = value;
            return obj;
          }, {});
        }
      } else {
        settings[name] = values[`${name}DataElement`];
      }
      return settings;
    },
    validationShape,
    Component: ({ namePrefix = "" }) => {
      const [{ value: inputMethod }] = useField(
        `${namePrefix}${name}InputMethod`,
      );
      const [{ value: items }, , { setValue: setItems }] = useField(
        `${namePrefix}${name}`,
      );
      const labelElement = (
        <>
          {label}
          {beta && <BetaBadge />}
        </>
      );
      return (
        <>
          <FormikRadioGroup
            name={`${namePrefix}${name}InputMethod`}
            orientation="horizontal"
            label={labelElement}
            description={description}
          >
            <Radio data-test-id={`${namePrefix}${name}FormOption`} value={FORM}>
              Manually enter {label.toLowerCase()}.
            </Radio>
            <Radio
              data-test-id={`${namePrefix}${name}DataElementOption`}
              value={DATA_ELEMENT}
            >
              Provide a data element.
            </Radio>
          </FormikRadioGroup>
          {inputMethod === FORM && (
            <FieldArray
              name={name}
              render={(arrayHelpers) => {
                return (
                  <>
                    {items.map((__, index) => {
                      return (
                        <Well
                          key={index}
                          alignSelf="flex-start"
                          direction="column"
                          gap="size-100"
                        >
                          <FormElementContainer>
                            <DataElementSelector>
                              <FormikTextField
                                data-test-id={`${namePrefix}Key${index}Field`}
                                label={keyLabel}
                                name={`${namePrefix}${name}.${index}.key`}
                                width="size-5000"
                                marginTop="size-0"
                                description={keyDescription}
                                isRequired
                              />
                            </DataElementSelector>
                            <DataElementSelector>
                              <FormikTextField
                                data-test-id={`${namePrefix}Value${index}Field`}
                                label={valueLabel}
                                name={`${namePrefix}${name}.${index}.value`}
                                width="size-5000"
                                marginTop="size-0"
                                description={valueDescription}
                              />
                            </DataElementSelector>
                          </FormElementContainer>
                          <Flex direction="row">
                            <Button
                              variant="secondary"
                              data-test-id={`${namePrefix}${name}${index}RemoveButton`}
                              isDisabled={items.length === 1}
                              onPress={() => {
                                // using arrayHelpers.remove mangles the error message
                                setItems(items.filter((_, i) => i !== index));
                              }}
                              marginStart="auto"
                            >
                              Remove {singularLabel.toLowerCase()}
                            </Button>
                          </Flex>
                        </Well>
                      );
                    })}
                    <div>
                      <Button
                        variant="secondary"
                        data-test-id={`${namePrefix}${name}AddButton`}
                        onPress={() =>
                          arrayHelpers.push({ key: "", value: "" })
                        }
                      >
                        Add {singularLabel.toLowerCase()}
                      </Button>
                    </div>
                  </>
                );
              }}
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
  part.Component.propTypes = {
    namePrefix: PropTypes.string,
  };
  return part;
}
