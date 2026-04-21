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
import { array, string, object } from "yup";
import { FieldArray, useField } from "formik";
import { Flex, Radio, Button, Well, ActionButton } from "@adobe/react-spectrum";
import PropTypes from "prop-types";
import Delete from "@spectrum-icons/workflow/Delete";
import FormikRadioGroup from "../components/formikReactSpectrum3/formikRadioGroup";
import FormikTextField from "../components/formikReactSpectrum3/formikTextField";
import DataElementSelector from "../components/dataElementSelector";
import singleDataElementRegex from "../constants/singleDataElementRegex";
import { DATA_ELEMENT_REQUIRED } from "../constants/validationErrorMessages";
import form from "./form";
import numberAwareCompareFunction from "../utils/numberAwareCompareFunction";
import FormElementContainer from "../components/formElementContainer";

const FORM = "form";
const DATA_ELEMENT = "dataElement";

const lowerInitialLetters = (s) => {
  return s
    .split(" ")
    .map((word) => word.charAt(0).toLowerCase() + word.slice(1))
    .join(" ");
};

const ObjectArrayContainer = ({ horizontal, children }) => {
  if (horizontal) {
    return (
      <Well
        UNSAFE_style={{
          paddingTop: "var(--spectrum-global-dimension-size-100)",
        }}
      >
        <FormElementContainer>{children}</FormElementContainer>
      </Well>
    );
  }
  return children;
};

ObjectArrayContainer.propTypes = {
  horizontal: PropTypes.bool,
  children: PropTypes.node,
};

/** @typedef {import("./form").Form} Form */
/**
 * This creates a form element that allows the user to create an array of
 * objects, or an object with string keys and object values. Any items with no
 * values filled in will be removed from the final settings.
 * @param {object} options - Options for the field.
 * @param {string} options.name - The formik key to use for this field.
 *  - `${key}` will be used to store the array of objects.
 *  - `${key}InputMethod` will be used to determine whether or not to use a data
 *    element.
 *  - `${key}DataElement` will be used to store the data element value.
 * @param {string} options.label - The label to use for the field.
 * @param {string} options.singularLabel - The singular label to use for the add
 * button.
 * @param {string} [options.dataElementDescription] - The description to use for
 * the data element field. Usually you would use this to describe the type the
 * data element should be.
 * @param {string} [options.objectKey] - If you want to create an object, use
 * this to specify the Formik key to use for the keys of the object. If you want
 * to create an array of objects, omit this.
 * @param {string} [options.objectLabelPlural] - If you have set `objectKey`,
 * this will be used to describe the object keys in the validation error message
 * to make sure they are unique.
 * @param {Form[]} children - The Form parts to use for the object. These will
 * be used to create the form for each object in the array. When rendering the
 * components, the `prefixName` prop will be set to `${name}.${index}.`
 * @returns {Form} A form element that allows the user to create an array of
 * objects, or an object with string keys and object values.
 */
export default function objectArray(
  {
    name,
    label,
    ariaLabel,
    singularLabel,
    dataElementDescription,
    objectKey,
    objectLabelPlural,
    dataElementSupported = true,
    horizontal = false,
    compareFunction = numberAwareCompareFunction,
    isRowEmpty = () => true,
  },
  children = [],
) {
  const {
    getInitialValues: getItemInitialValues,
    getSettings: getItemSettings,
    getValidationShape: getItemValidationShape,
    Component: ItemComponent,
  } = form({}, children);

  const buildDefaultItem = () =>
    getItemInitialValues({ initInfo: { settings: null } });

  const formPart = {
    getInitialValues({ initInfo }) {
      const { [name]: value } = initInfo.settings || {};

      let transformedValue = value;
      if (transformedValue && objectKey) {
        transformedValue = Object.keys(transformedValue)
          .sort(compareFunction)
          .reduce((acc, k) => {
            acc.push({ [objectKey]: k, ...transformedValue[k] });
            return acc;
          }, []);
      }
      if (transformedValue && Array.isArray(transformedValue)) {
        transformedValue = transformedValue.map((item) =>
          getItemInitialValues({ initInfo: { settings: item } }),
        );
      } else {
        transformedValue = [buildDefaultItem()];
      }

      const initialValues = {
        [name]: transformedValue,
        [`${name}InputMethod`]: FORM,
        [`${name}DataElement`]: "",
      };

      if (typeof value === "string") {
        initialValues[name] = [""];
        initialValues[`${name}InputMethod`] = DATA_ELEMENT;
        initialValues[`${name}DataElement`] = value;
      }
      return initialValues;
    },
    getSettings({ values }) {
      const settings = {};
      if (values[`${name}InputMethod`] === FORM) {
        const itemSettings = values[name].map((item) =>
          getItemSettings({ values: item }),
        );
        const filteredItems = itemSettings.filter((item) =>
          objectKey ? item[objectKey] : Object.keys(item).length > 0,
        );
        if (filteredItems.length > 0) {
          if (objectKey) {
            settings[name] = filteredItems.reduce((acc, item) => {
              const { [objectKey]: settingKey, ...rest } = item;
              acc[settingKey] = rest;
              return acc;
            }, {});
          } else {
            settings[name] = filteredItems;
          }
        }
      } else {
        settings[name] = values[`${name}DataElement`];
      }
      return settings;
    },
    getValidationShape({ initInfo, existingValidationShape }) {
      let itemSchema = object().shape(
        getItemValidationShape({ initInfo, existingValidationShape: {} }),
      );

      if (objectKey) {
        itemSchema = itemSchema
          .test(
            "unique",
            `Duplicate ${lowerInitialLetters(objectLabelPlural)} are not allowed`,
            (value, context) => {
              if (!value || !value[objectKey]) {
                return true;
              }

              const { path, parent } = context;
              const items = [...parent];
              const currentIndex = items.indexOf(value);
              const previousItems = items.slice(0, currentIndex);

              if (
                previousItems.some(
                  (item) => item[objectKey] === value[objectKey],
                )
              ) {
                throw context.createError({
                  path: `${path}.${objectKey}`,
                  message: `Duplicate ${lowerInitialLetters(
                    objectLabelPlural,
                  )} are not allowed`,
                });
              }

              return true;
            },
          )
          .test(
            "key-required-when-values-present",
            `Please provide a ${lowerInitialLetters(singularLabel)}.`,
            (value, context) => {
              if (
                value[objectKey] === undefined &&
                Object.keys(value).length !== 0
              ) {
                throw context.createError({
                  path: `${context.path}.${objectKey}`,
                  message: `Please provide a ${lowerInitialLetters(singularLabel)}.`,
                });
              }
              return true;
            },
          );
      }

      const validationShape = {};
      validationShape[name] = array()
        .compact(
          (item) => Object.keys(getItemSettings({ values: item })).length === 0,
        )
        .when(`${name}InputMethod`, {
          is: FORM,
          then: (schema) => schema.of(itemSchema),
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
      return {
        ...existingValidationShape,
        ...validationShape,
      };
    },
    Component: ({ namePrefix = "", ...props }) => {
      const [{ value: inputMethod }] = useField(
        `${namePrefix}${name}InputMethod`,
      );
      const [{ value: items }, , { setValue: setItems }] = useField(
        `${namePrefix}${name}`,
      );

      return (
        <ObjectArrayContainer horizontal={horizontal}>
          {dataElementSupported && (
            <FormikRadioGroup
              name={`${namePrefix}${name}InputMethod`}
              orientation="horizontal"
              label={label}
              aria-label={ariaLabel}
            >
              <Radio
                data-test-id={`${namePrefix}${name}FormOption`}
                value={FORM}
              >
                Use a form.
              </Radio>
              <Radio
                data-test-id={`${namePrefix}${name}DataElementOption`}
                value={DATA_ELEMENT}
              >
                Provide a data element.
              </Radio>
            </FormikRadioGroup>
          )}
          {inputMethod === FORM && (
            <FieldArray
              name={`${namePrefix}${name}`}
              render={(arrayHelpers) => {
                return (
                  <>
                    {items.map((item, index) => {
                      return (
                        <div key={index}>
                          {!horizontal && (
                            <Well
                              alignSelf="flex-start"
                              direction="column"
                              gap="size-100"
                            >
                              <ItemComponent
                                namePrefix={`${namePrefix}${name}.${index}.`}
                                {...props}
                              />
                              <Flex direction="row">
                                <Button
                                  variant="secondary"
                                  data-test-id={`${namePrefix}${name}${index}RemoveButton`}
                                  onPress={() => {
                                    // using arrayHelpers.remove mangles the error message
                                    setItems(
                                      items.filter((_, i) => i !== index),
                                    );
                                  }}
                                  isDisabled={
                                    items.length === 1 && isRowEmpty(item)
                                  }
                                  marginStart="auto"
                                >
                                  Remove {lowerInitialLetters(singularLabel)}
                                </Button>
                              </Flex>
                            </Well>
                          )}
                          {horizontal && (
                            <Flex direction="row">
                              <ItemComponent
                                namePrefix={`${namePrefix}${name}.${index}.`}
                                hideLabel={index > 0}
                                horizontal
                                {...props}
                              />
                              <ActionButton
                                isQuiet
                                variant="secondary"
                                data-test-id={`${namePrefix}${name}${index}RemoveButton`}
                                onPress={() =>
                                  // using arrayHelpers.remove mangles the error message
                                  items.length > 1
                                    ? setItems(
                                        items.filter((_, i) => i !== index),
                                      )
                                    : setItems([buildDefaultItem()])
                                }
                                isDisabled={
                                  items.length === 1 && isRowEmpty(item)
                                }
                                marginTop={index === 0 ? "size-300" : 0}
                              >
                                <Delete />
                              </ActionButton>
                            </Flex>
                          )}
                        </div>
                      );
                    })}
                    <div>
                      <ActionButton
                        data-test-id={`${namePrefix}${name}AddButton`}
                        onPress={() => arrayHelpers.push(buildDefaultItem())}
                      >
                        Add another {lowerInitialLetters(singularLabel)}
                      </ActionButton>
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
        </ObjectArrayContainer>
      );
    },
  };
  formPart.Component.propTypes = {
    namePrefix: PropTypes.string,
  };
  return formPart;
}
