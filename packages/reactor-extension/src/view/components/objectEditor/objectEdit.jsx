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
import { Radio } from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import { useFieldValue } from "../../utils/useFieldValue";
import FormRadioGroup from "../../forms/fields/RadioGroup";
import FormTextField from "../../forms/fields/TextField";
import DataElementSelector from "../dataElementSelector";
import { PARTS, WHOLE } from "./constants/populationStrategy";
import FormElementContainer from "../formElementContainer";

/**
 * The form for editing a node that is an object type.
 */
const ObjectEdit = ({
  displayName,
  fieldName,
  verticalLayout = false,
  nodeDescription,
}) => {
  const formStateNode = useFieldValue(fieldName);

  const { isPartsPopulationStrategySupported, populationStrategy } =
    formStateNode;

  return (
    <FormElementContainer>
      {isPartsPopulationStrategySupported && (
        <FormRadioGroup
          label={displayName}
          name={`${fieldName}.populationStrategy`}
          orientation="horizontal"
          contextualHelp={nodeDescription}
        >
          <Radio data-test-id="partsPopulationStrategyField" value={PARTS}>
            Provide individual attributes
          </Radio>
          <Radio data-test-id="wholePopulationStrategyField" value={WHOLE}>
            Provide entire object
          </Radio>
        </FormRadioGroup>
      )}
      {populationStrategy === WHOLE ? (
        <DataElementSelector clearable>
          <FormTextField
            data-test-id="valueField"
            name={`${fieldName}.value`}
            label={isPartsPopulationStrategySupported ? "" : displayName}
            description="This data element should resolve to an object."
            width="size-5000"
            contextualHelp={
              isPartsPopulationStrategySupported ? undefined : nodeDescription
            }
          />
        </DataElementSelector>
      ) : (
        <div className={style({ font: "body-sm" })}>
          To provide values for individual attributes, please select the
          attributes in the tree {verticalLayout ? "above" : "on the left"}.
        </div>
      )}
    </FormElementContainer>
  );
};

ObjectEdit.propTypes = {
  displayName: PropTypes.string.isRequired,
  fieldName: PropTypes.string.isRequired,
  verticalLayout: PropTypes.bool,
  nodeDescription: PropTypes.node,
};

export default ObjectEdit;
