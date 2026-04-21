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
import { Radio } from "@adobe/react-spectrum";
import { useField } from "formik";
import FormikRadioGroup from "../formikReactSpectrum3/formikRadioGroup";
import FormikTextField from "../formikReactSpectrum3/formikTextField";
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
  const [{ value: formStateNode }] = useField(fieldName);

  const { isPartsPopulationStrategySupported, populationStrategy } =
    formStateNode;

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
            Provide individual attributes
          </Radio>
          <Radio data-test-id="wholePopulationStrategyField" value={WHOLE}>
            Provide entire object
          </Radio>
        </FormikRadioGroup>
      )}
      {populationStrategy === WHOLE ? (
        <DataElementSelector clearable>
          <FormikTextField
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
        <div>
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
