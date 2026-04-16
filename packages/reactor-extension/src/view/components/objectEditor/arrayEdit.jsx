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

import PropTypes from "prop-types";
import { FieldArray, useField } from "formik";
import { Radio, Button, ActionButton, Flex } from "@adobe/react-spectrum";
import Delete from "@spectrum-icons/workflow/Delete";
import FormikRadioGroup from "../formikReactSpectrum3/formikRadioGroup";
import FormikTextField from "../formikReactSpectrum3/formikTextField";
import DataElementSelector from "../dataElementSelector";
import getInitialFormState, {
  formStateNodePropTypes,
} from "./helpers/getInitialFormState";
import { PARTS, WHOLE } from "./constants/populationStrategy";
import { ARRAY, OBJECT } from "./constants/schemaType";
import FormElementContainer from "../formElementContainer";

/**
 * Displayed when the WHOLE population strategy is selected.
 * Allows the user to provide a value for the whole array.
 */
const WholePopulationStrategyForm = ({ fieldName }) => {
  return (
    <DataElementSelector clearable>
      <FormikTextField
        data-test-id="valueField"
        name={`${fieldName}.value`}
        description="This data element should resolve to an array."
        width="size-5000"
      />
    </DataElementSelector>
  );
};

WholePopulationStrategyForm.propTypes = {
  fieldName: PropTypes.string.isRequired,
};

/**
 * Displayed when the PARTS population strategy is selected.
 * Allows the user to provide individual items within the array.
 */
const PartsPopulationStrategyForm = ({
  fieldName,
  schema,
  items,
  onNodeSelect,
  updateMode,
}) => {
  return (
    <FieldArray
      name={`${fieldName}.items`}
      render={(arrayHelpers) => {
        return (
          <Flex gap="size-200" direction="column" alignItems="start">
            {items.map((itemNode, index) => {
              return (
                <Flex gap="size-200" key={`${fieldName}.${index}`}>
                  <Button
                    data-test-id={`item${index}SelectButton`}
                    isQuiet
                    variant="secondary"
                    onPress={() => onNodeSelect(itemNode.id)}
                  >
                    Item {index + 1}
                  </Button>
                  <ActionButton
                    data-test-id={`item${index}RemoveButton`}
                    isQuiet
                    variant="secondary"
                    minWidth={0}
                    aria-label="Delete"
                    onPress={() => arrayHelpers.remove(index)}
                  >
                    <Delete />
                  </ActionButton>
                </Flex>
              );
            })}
            <Button
              data-test-id="addItemButton"
              onPress={() => {
                const itemSchema = schema.items;
                let defaultValue;

                if (itemSchema.type === OBJECT) {
                  defaultValue = {};
                } else if (itemSchema.type === ARRAY) {
                  defaultValue = [];
                } else {
                  defaultValue = "";
                }

                const itemNodePath = fieldName
                  ? `${fieldName}.items.${items.length}`
                  : `items.${items.length}`;

                const itemFormStateNode = getInitialFormState({
                  schema: itemSchema,
                  value: defaultValue,
                  updateMode,
                  nodePath: itemNodePath,
                });
                arrayHelpers.push(itemFormStateNode);
              }}
              variant="primary"
            >
              Add item
            </Button>
          </Flex>
        );
      }}
    />
  );
};

PartsPopulationStrategyForm.propTypes = {
  fieldName: PropTypes.string.isRequired,
  schema: PropTypes.object.isRequired,
  items: PropTypes.arrayOf(formStateNodePropTypes).isRequired,
  onNodeSelect: PropTypes.func.isRequired,
  updateMode: PropTypes.bool.isRequired,
};

/**
 * The form for editing a node that is an array type.
 */
const ArrayEdit = (props) => {
  const { displayName, fieldName, onNodeSelect, nodeDescription } = props;
  const [{ value: formStateNode }] = useField(fieldName);

  const {
    isPartsPopulationStrategySupported,
    populationStrategy,
    schema,
    items,
    updateMode,
  } = formStateNode;

  return (
    <FormElementContainer>
      {isPartsPopulationStrategySupported && (
        <FormikRadioGroup
          label={displayName}
          name={`${fieldName}.populationStrategy`}
          orientation="horizontal"
          contextualHelp={nodeDescription}
        >
          <Radio data-test-id="partsPopulationStrategyField" value={PARTS}>
            Provide individual items
          </Radio>
          <Radio data-test-id="wholePopulationStrategyField" value={WHOLE}>
            Provide entire array
          </Radio>
        </FormikRadioGroup>
      )}
      <div>
        {populationStrategy === WHOLE ? (
          <WholePopulationStrategyForm fieldName={fieldName} />
        ) : (
          <PartsPopulationStrategyForm
            fieldName={fieldName}
            schema={schema}
            items={items}
            onNodeSelect={onNodeSelect}
            updateMode={updateMode}
          />
        )}
      </div>
    </FormElementContainer>
  );
};

ArrayEdit.propTypes = {
  displayName: PropTypes.string.isRequired,
  fieldName: PropTypes.string.isRequired,
  onNodeSelect: PropTypes.func.isRequired,
  nodeDescription: PropTypes.node,
};

export default ArrayEdit;
