/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { useCallback } from "react";
import PropTypes from "prop-types";
import { FieldArray, useField, useFormikContext } from "formik";
import { Radio, ActionButton, Well, Flex } from "@adobe/react-spectrum";
import Delete from "@spectrum-icons/workflow/Delete";
import FormikRadioGroup from "../formikReactSpectrum3/formikRadioGroup";
import FormikTextArea from "../formikReactSpectrum3/formikTextArea";
import FormikTextField from "../formikReactSpectrum3/formikTextField";
import DataElementSelector from "../dataElementSelector";
import { PARTS, WHOLE } from "./constants/populationStrategy";
import FormElementContainer from "../formElementContainer";
import {
  addToEntityFromVariables,
  addToVariablesFromEntity,
} from "./helpers/entityVariablesConverter";

const getEmptyItem = () => ({ key: "", value: "" });

/**
 * Displayed when the WHOLE population strategy is selected.
 * Allows the user to provide a value for the whole array.
 */
const WholePopulationStrategyForm = ({
  displayName,
  fieldName,
  nodeDescription,
}) => {
  return (
    <DataElementSelector clearable>
      <FormikTextArea
        data-test-id="valueField"
        label={displayName}
        name={`${fieldName}.value`}
        aria-label="Value"
        description={
          "You can provide Data Elements for individual fields within the JSON " +
          '(e.g. "%My Data%") or provide one data element for the entire object.'
        }
        width="size-6000"
        marginStart="size-300"
        contextualHelp={nodeDescription}
      />
    </DataElementSelector>
  );
};

WholePopulationStrategyForm.propTypes = {
  displayName: PropTypes.string.isRequired,
  fieldName: PropTypes.string.isRequired,
  nodeDescription: PropTypes.node,
};

/**
 * Displayed when the PARTS population strategy is selected.
 * Allows the user to provide individual items within the array.
 */
const PartsPopulationStrategyForm = ({ fieldName, items }) => (
  <FieldArray
    name={`${fieldName}.items`}
    render={(arrayHelpers) => {
      return (
        <Well
          marginStart="size-300"
          UNSAFE_style={{
            paddingTop: "var(--spectrum-global-dimension-size-100)",
          }}
        >
          <Flex gap="size-100" direction="column" alignItems="start">
            {items.map(({ key, value }, index) => {
              return (
                <Flex key={`${fieldName}.${index}`}>
                  <FormikTextField
                    data-test-id={`keyField${index}`}
                    name={`${fieldName}.items.${index}.key`}
                    aria-label="Key"
                    label={index === 0 ? "Key" : ""}
                    width="size-3000"
                  />

                  <DataElementSelector clearable>
                    <FormikTextField
                      data-test-id={`valueField${index}`}
                      name={`${fieldName}.items.${index}.value`}
                      aria-label="Value"
                      label={index === 0 ? "Value" : ""}
                      width="size-3000"
                      marginStart="size-100"
                    />
                  </DataElementSelector>

                  <ActionButton
                    data-test-id={`item${index}RemoveButton`}
                    isQuiet
                    variant="secondary"
                    aria-label="Delete"
                    isDisabled={items.length === 1 && !key && !value}
                    marginTop={index === 0 ? "size-300" : ""}
                    onPress={() =>
                      items.length > 1
                        ? arrayHelpers.remove(index)
                        : arrayHelpers.replace(index, getEmptyItem())
                    }
                  >
                    <Delete />
                  </ActionButton>
                </Flex>
              );
            })}

            <ActionButton
              data-test-id="addPropertyButton"
              onPress={() => {
                arrayHelpers.push({ key: "", value: "" });
              }}
            >
              Add another property
            </ActionButton>
          </Flex>
        </Well>
      );
    }}
  />
);

PartsPopulationStrategyForm.propTypes = {
  fieldName: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const updateJsonTextarea = ({
  setValue,
  formStateNode: {
    items,
    schema: { expandPaths },
  },
  submitForm,
}) => {
  const nonEmptyItems = items.filter(
    ({ key, value }) => key.trim() !== "" || value.trim() !== "",
  );
  if (nonEmptyItems.length > 0) {
    if (!nonEmptyItems.some(({ key }) => key.trim() === "")) {
      const entity = JSON.stringify(
        addToEntityFromVariables({}, nonEmptyItems, { expandPaths }),
        null,
        2,
      );
      setValue(entity).then(() => submitForm());
    } else {
      setValue("").then(() => submitForm());
    }
  } else {
    Promise.resolve().then(() => submitForm());
  }
};

const updateRows = ({
  setValue,
  formStateNode: {
    value,
    schema: { expandPaths },
  },
  submitForm,
}) => {
  if (value !== "") {
    try {
      const parsedValue = JSON.parse(value);
      if (Object.keys(parsedValue).some((key) => key.trim() === "")) {
        throw new Error("Empty key found in JSON object.");
      }
      const variables = addToVariablesFromEntity([], JSON.parse(value), {
        expandPaths,
      });
      setValue(variables).then(() => submitForm());
    } catch {
      setValue([{ key: "", value: "" }]).then(() => submitForm());
    }
  } else {
    Promise.resolve().then(() => submitForm());
  }
};

/**
 * The form for editing a node that is an object that contains JSON.
 */
const ObjectJsonEdit = (props) => {
  const { submitForm } = useFormikContext();
  const { displayName, fieldName, nodeDescription } = props;
  const [{ value: formStateNode }] = useField(fieldName);
  const [, , { setValue }] = useField(`${fieldName}.value`);
  const [, , { setValue: setItemsValue }] = useField(`${fieldName}.items`);

  const { isPartsPopulationStrategySupported, populationStrategy, items } =
    formStateNode;

  const strategyOnChange = useCallback(
    (currentValue) => {
      if (currentValue === WHOLE) {
        updateJsonTextarea({ setValue, formStateNode, submitForm });
      } else {
        updateRows({ setValue: setItemsValue, formStateNode, submitForm });
      }
    },
    [formStateNode],
  );

  return (
    <FormElementContainer>
      {isPartsPopulationStrategySupported && (
        <FormikRadioGroup
          aria-label="Population strategy"
          label={displayName}
          name={`${fieldName}.populationStrategy`}
          orientation="horizontal"
          contextualHelp={nodeDescription}
          onChange={strategyOnChange}
        >
          <Radio data-test-id="partsPopulationStrategyField" value={PARTS}>
            Provide individual attributes
          </Radio>
          <Radio data-test-id="wholePopulationStrategyField" value={WHOLE}>
            Provide JSON or Data Element
          </Radio>
        </FormikRadioGroup>
      )}
      {populationStrategy === WHOLE ? (
        <WholePopulationStrategyForm
          displayName={isPartsPopulationStrategySupported ? "" : displayName}
          fieldName={fieldName}
          nodeDescription={
            isPartsPopulationStrategySupported ? undefined : nodeDescription
          }
        />
      ) : (
        <PartsPopulationStrategyForm fieldName={fieldName} items={items} />
      )}
    </FormElementContainer>
  );
};

ObjectJsonEdit.propTypes = {
  displayName: PropTypes.string.isRequired,
  fieldName: PropTypes.string.isRequired,
  nodeDescription: PropTypes.node,
};

export default ObjectJsonEdit;
