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
import { reach } from "yup";
import PropTypes from "prop-types";
import Overrides, { bridge as overridesBridge } from "../components/overrides";
import getEdgeConfigIds from "../utils/getEdgeConfigIds";

/** @typedef {import("./form").Form} Form */
/**
 * This creates a form field for edge config overrides.
 * @returns {Form} A config overrides form.
 */
export default function configOverrides(hideFields) {
  const part = {
    getInitialValues({ initInfo }) {
      return overridesBridge.getInitialInstanceValues({
        instanceSettings: initInfo.settings || {},
      });
    },
    getSettings({ values }) {
      return overridesBridge.getInstanceSettings({ instanceValues: values });
    },
    validationShape: {
      edgeConfigOverrides: reach(
        overridesBridge.formikStateValidationSchema,
        "edgeConfigOverrides",
      ),
    },
    Component({ initInfo, formikProps: { values } }) {
      const { instanceName } = values;
      const instanceSettings = initInfo.extensionSettings.instances.find(
        (instance) => instance.name === instanceName,
      );
      const edgeConfigIds = getEdgeConfigIds(instanceSettings);
      const orgId = instanceSettings?.orgId ?? initInfo.company.orgId;
      return (
        <Overrides
          initInfo={initInfo}
          edgeConfigIds={edgeConfigIds}
          configOrgId={orgId}
          hideFields={hideFields}
        />
      );
    },
  };

  part.Component.propTypes = {
    initInfo: PropTypes.object.isRequired,
    formikProps: PropTypes.shape({
      values: PropTypes.object.isRequired,
    }).isRequired,
  };

  return part;
}
