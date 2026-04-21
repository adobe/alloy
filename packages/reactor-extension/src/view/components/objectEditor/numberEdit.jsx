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
import FormikTextField from "../formikReactSpectrum3/formikTextField";
import DataElementSelector from "../dataElementSelector";

/**
 * The form for editing a number or integer field.
 */
const NumberOrIntegerEdit = (props) => {
  const { displayName, fieldName, nodeDescription } = props;

  return (
    <div>
      <DataElementSelector clearable>
        <FormikTextField
          data-test-id="valueField"
          name={`${fieldName}.value`}
          label={displayName}
          width="size-5000"
          description="Data element should resolve to a number."
          contextualHelp={nodeDescription}
        />
      </DataElementSelector>
    </div>
  );
};

NumberOrIntegerEdit.propTypes = {
  displayName: PropTypes.string.isRequired,
  fieldName: PropTypes.string.isRequired,
  nodeDescription: PropTypes.node,
};

export default NumberOrIntegerEdit;
