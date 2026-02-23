/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import PropTypes from "prop-types";
import { Item } from "@adobe/react-spectrum";
import FormikKeyedComboBox from "../formikReactSpectrum3/formikKeyedComboBox";
import DataElementSelector from "../dataElementSelector";

/**
 * The form for editing a node that is a string type with an enum property.
 */
const EnumEdit = (props) => {
  const { displayName, fieldName, possibleValues, nodeDescription } = props;

  return (
    <div>
      <DataElementSelector clearable>
        <FormikKeyedComboBox
          data-test-id="valueField"
          label={displayName}
          name={`${fieldName}.value`}
          width="size-5000"
          items={possibleValues}
          getKey={(item) => item.value}
          getLabel={(item) => item.label}
          allowsCustomValue
          description="Type to search or select from the list. Data element should resolve to one of the listed values."
          contextualHelp={nodeDescription}
        >
          {(item) => (
            <Item key={item.value} data-test-id={item.value}>
              {item.label}
            </Item>
          )}
        </FormikKeyedComboBox>
      </DataElementSelector>
    </div>
  );
};

EnumEdit.propTypes = {
  displayName: PropTypes.string.isRequired,
  fieldName: PropTypes.string.isRequired,
  possibleValues: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string))
    .isRequired,
  nodeDescription: PropTypes.node,
};

export default EnumEdit;
