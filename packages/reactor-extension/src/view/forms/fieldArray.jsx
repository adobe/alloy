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
import Delete from "@spectrum-icons/workflow/Delete";
import { array, string } from "yup";
import { FieldArray, useField } from "formik";
import { Flex, Radio, ActionButton, Button, Item } from "@adobe/react-spectrum";
import PropTypes from "prop-types";
import FormikTextField from "../components/formikReactSpectrum3/formikTextField";
import FormikRadioGroup from "../components/formikReactSpectrum3/formikRadioGroup";
import DataElementSelector from "../components/dataElementSelector";
import singleDataElementRegex from "../constants/singleDataElementRegex";
import { DATA_ELEMENT_REQUIRED } from "../constants/validationErrorMessages";
import FormikKeyedComboBox from "../components/formikReactSpectrum3/formikKeyedComboBox";

const FORM = "form";
const DATA_ELEMENT = "dataElement";

const StringItem = ({
  namePrefix,
  name,
  index,
  description,
  error,
  touched,
  isLast,
}) => {
  return (
    <DataElementSelector>
      <FormikTextField
        data-test-id={`${namePrefix}${name}${index}Field`}
        aria-label={`Item ${index + 1}`}
        name={`${namePrefix}${name}.${index}`}
        width="size-5000"
        marginTop="size-0"
        description={isLast ? description : undefined}
        error={isLast ? error : undefined}
        invalid={error && touched}
        touched={touched}
      />
    </DataElementSelector>
  );
};
StringItem.propTypes = {
  namePrefix: PropTypes.string,
  name: PropTypes.string,
  index: PropTypes.number,
  description: PropTypes.string,
  error: PropTypes.string,
  touched: PropTypes.bool,
  isLast: PropTypes.bool,
};

const ComboboxItem = ({
  namePrefix,
  name,
  index,
  description,
  error,
  touched,
  isLast,
  items,
}) => {
  return (
    <DataElementSelector>
      <FormikKeyedComboBox
        data-test-id={`${namePrefix}${name}${index}Field`}
        aria-label={`Item ${index + 1}`}
        name={`${namePrefix}${name}.${index}`}
        width="size-5000"
        marginTop="size-0"
        description={isLast ? description : undefined}
        error={isLast ? error : undefined}
        invalid={error && touched}
        touched={touched}
        items={items}
        getKey={(item) => item.value}
        getLabel={(item) => item.label}
        allowsCustomValue
      >
        {(item) => (
          <Item key={item.value} data-test-id={item.value}>
            {item.label}
          </Item>
        )}
      </FormikKeyedComboBox>
    </DataElementSelector>
  );
};

ComboboxItem.propTypes = {
  namePrefix: PropTypes.string,
  name: PropTypes.string,
  index: PropTypes.number,
  description: PropTypes.string,
  error: PropTypes.string,
  touched: PropTypes.bool,
  isLast: PropTypes.bool,
  items: PropTypes.array,
};

/** @typedef {import("./form").Form} Form */
/**
 * This creates a form that just supports an array of strings. Any fields not
 * filled in will be removed from the array. Each item in the array can be a
 * data element or the entire array can be a data element.
 * @param {object} options - Options for the field.
 * @param {string} options.name - The formik key to use for this field.
 * - `${key}` will be used to store the array of strings.
 * - `${key}InputMethod` will be used to determine whether or not to use a data
 *   element.
 * - `${key}DataElement` will be used to store the data element value.
 * @param {string} options.label - The label to use for the field.
 * @param {string} options.singularLabel - The singular label to use for the add
 * button.
 * @param {string} [options.description] - The description to use for the field.
 * This will appear bellow the last string field.
 * @param {string} [options.dataElementDescription] - The description to use for
 * the data element field. Usually you would use this to describe the type the
 * data element should be.
 * @param {boolean} [options.isRequired] - Whether or not the field is
 * required. When required, the user will need to enter at least one string.
 * @param options.validationSchema - A yup validation schema to use for each
 * string in the array.
 * @param options.fieldItems
 * @returns {Form} A form field for an array of strings.
 */
export default function fieldArray({
  name,
  isRequired = false,
  label,
  singularLabel,
  description,
  dataElementDescription,
  validationSchema,
  fieldItems,
}) {
  const validationShape = {
    [name]: array(),
  };
  if (isRequired) {
    validationShape[name] = validationShape[name]
      .compact()
      .when(`${name}InputMethod`, {
        is: FORM,
        then: (schema) =>
          schema.min(
            1,
            `Please provide at least one ${singularLabel.toLowerCase()}.`,
          ),
      });
  }
  if (validationSchema) {
    validationShape[name] = validationShape[name].when(`${name}InputMethod`, {
      is: FORM,
      then: (schema) => schema.of(validationSchema),
    });
  }
  validationShape[`${name}DataElement`] = string().when(`${name}InputMethod`, {
    is: DATA_ELEMENT,
    then: (schema) =>
      schema
        .matches(singleDataElementRegex, DATA_ELEMENT_REQUIRED)
        .required(DATA_ELEMENT_REQUIRED),
  });

  const FieldItem = fieldItems ? ComboboxItem : StringItem;

  const part = {
    getInitialValues({ initInfo }) {
      const { [name]: value = [""] } = initInfo.settings || {};

      const initialValues = {
        [name]: value,
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
        const filteredValues = values[name].filter((value) => value);
        if (filteredValues.length > 0) {
          settings[name] = filteredValues;
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
      const [
        { value: items },
        { touched: itemsTouched, error: itemsError },
        { setValue: setItems },
      ] = useField(`${namePrefix}${name}`);

      const error = typeof itemsError === "string" ? itemsError : undefined;
      return (
        <>
          <FormikRadioGroup
            name={`${namePrefix}${name}InputMethod`}
            orientation="horizontal"
            label={label}
            isRequired={isRequired}
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
                  <div>
                    <Flex direction="column" gap="size-100" alignItems="start">
                      {items.map((item, index) => {
                        return (
                          <Flex key={index} alignItems="start">
                            <FieldItem
                              namePrefix={namePrefix}
                              name={name}
                              index={index}
                              description={description}
                              error={error}
                              touched={itemsTouched}
                              isLast={index === items.length - 1}
                              items={fieldItems}
                            />
                            <ActionButton
                              data-test-id={`${namePrefix}${name}${index}RemoveButton`}
                              isQuiet
                              variant="secondary"
                              onPress={() => {
                                // using arrayHelpers.remove mangles the error message
                                const newItems = items.filter(
                                  (_, i) => i !== index,
                                );
                                if (newItems.length === 0) {
                                  newItems.push("");
                                }
                                setItems(newItems);
                              }}
                              aria-label={`Remove ${label} ${index + 1}`}
                              marginTop={0}
                            >
                              <Delete />
                            </ActionButton>
                          </Flex>
                        );
                      })}
                    </Flex>
                    <Button
                      variant="secondary"
                      data-test-id={`${namePrefix}${name}AddButton`}
                      onPress={() => arrayHelpers.push("")}
                    >
                      Add {singularLabel.toLowerCase()}
                    </Button>
                  </div>
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
