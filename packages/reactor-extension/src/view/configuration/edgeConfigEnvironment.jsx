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
import PropTypes from "prop-types";
import { useField } from "formik";

import DatastreamSelector from "../components/datastreamSelector";
import { PRODUCTION } from "./constants/environmentType";
import "./style.css";
import FormikPicker from "../components/formikReactSpectrum3/formikPicker";
import sandboxItems from "../components/sandboxItems";

const EdgeConfigEnvironment = ({
  name,
  initInfo,
  environmentType,
  context,
}) => {
  const [{ value: sandboxName }] = useField(`${name}.sandbox`);
  const { current } = context;
  const { sandboxes, datastreams } = current;

  const defaultSandboxOnly = sandboxes.length === 1;

  const selectedSandbox = sandboxes.find(
    (sandbox) => sandbox.name === sandboxName,
  );

  const description = `Choose the ${
    defaultSandboxOnly ? "" : "sandbox and"
  } datastream for the ${environmentType} environment.`;

  return (
    <>
      <FormikPicker
        isHidden={defaultSandboxOnly && environmentType !== PRODUCTION}
        isDisabled={defaultSandboxOnly && environmentType === PRODUCTION}
        isRequired={environmentType === PRODUCTION}
        label={
          defaultSandboxOnly
            ? "Adobe Experience Platform"
            : `${environmentType} environment`
        }
        data-test-id={`${environmentType}SandboxField`}
        UNSAFE_className="CapitalizedLabel"
        description={selectedSandbox ? "" : description}
        name={`${name}.sandbox`}
        items={sandboxes}
        width="size-5000"
        placeholder="Select a sandbox"
      >
        {sandboxItems}
      </FormikPicker>

      {selectedSandbox && (
        <DatastreamSelector
          name={`${name}.datastreamId`}
          selectedSandbox={selectedSandbox}
          initInfo={initInfo}
          items={datastreams}
          environmentType={environmentType}
          defaultSandboxOnly={defaultSandboxOnly}
          description={description}
        />
      )}
    </>
  );
};

EdgeConfigEnvironment.propTypes = {
  name: PropTypes.string.isRequired,
  initInfo: PropTypes.object.isRequired,
  environmentType: PropTypes.string,
  context: PropTypes.object.isRequired,
};

export default EdgeConfigEnvironment;
