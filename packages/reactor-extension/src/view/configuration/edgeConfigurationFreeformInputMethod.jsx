/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import PropTypes from "prop-types";
import FormikTextField from "../components/formikReactSpectrum3/formikTextField";
import DataElementSelector from "../components/dataElementSelector";

const EdgeConfigurationFreeformInputMethod = ({ name }) => {
  return (
    <>
      <DataElementSelector>
        <FormikTextField
          data-test-id="productionEnvironmentTextfield"
          label="Production environment ID"
          name={`${name}.edgeConfigId`}
          description="This datastream environment will be used when the Launch library is in a production environment."
          isRequired
          width="size-5000"
        />
      </DataElementSelector>
      <DataElementSelector>
        <FormikTextField
          data-test-id="stagingEnvironmentTextfield"
          label="Staging environment ID"
          name={`${name}.stagingEdgeConfigId`}
          description="This datastream environment will be used when the Launch library is in a staging environment."
          width="size-5000"
        />
      </DataElementSelector>
      <DataElementSelector>
        <FormikTextField
          data-test-id="developmentEnvironmentTextfield"
          label="Development environment ID"
          name={`${name}.developmentEdgeConfigId`}
          description="This datastream environment will be used when the Launch library is in a development environment."
          width="size-5000"
        />
      </DataElementSelector>
    </>
  );
};

EdgeConfigurationFreeformInputMethod.propTypes = {
  name: PropTypes.string.isRequired,
};

export default EdgeConfigurationFreeformInputMethod;
