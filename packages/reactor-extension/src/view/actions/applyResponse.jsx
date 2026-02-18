/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import PropTypes from "prop-types";
import { object, string } from "yup";
import FormikTextField from "../components/formikReactSpectrum3/formikTextField";
import FormikCheckbox from "../components/formikReactSpectrum3/formikCheckbox";
import DataElementSelector from "../components/dataElementSelector";
import render from "../render";
import ExtensionView from "../components/extensionView";
import singleDataElementRegex from "../constants/singleDataElementRegex";
import { DATA_ELEMENT_REQUIRED } from "../constants/validationErrorMessages";
import FormElementContainer from "../components/formElementContainer";
import InstanceNamePicker from "../components/instanceNamePicker";
import useFocusFirstError from "../utils/useFocusFirstError";

const getInitialValues = ({ initInfo }) => {
  const {
    instanceName = initInfo.extensionSettings.instances[0].name,
    renderDecisions = false,
    responseHeaders = "",
    responseBody = "",
  } = initInfo.settings || {};

  return {
    instanceName,
    renderDecisions,
    responseHeaders,
    responseBody,
  };
};

const getSettings = ({ values }) => {
  const settings = {
    instanceName: values.instanceName,
  };
  // Only add if the value is different than the default (false).
  if (values.renderDecisions) {
    settings.renderDecisions = true;
  }
  if (values.responseHeaders) {
    settings.responseHeaders = values.responseHeaders;
  }
  if (values.responseBody) {
    settings.responseBody = values.responseBody;
  }
  return settings;
};

const validationSchema = object().shape({
  responseHeaders: string().matches(
    singleDataElementRegex,
    DATA_ELEMENT_REQUIRED,
  ),
  responseBody: string()
    .matches(singleDataElementRegex, DATA_ELEMENT_REQUIRED)
    .required("Please provide a response body."),
});

const FormFields = ({ initInfo }) => {
  useFocusFirstError();

  return (
    <FormElementContainer>
      <InstanceNamePicker
        data-test-id="instanceNameField"
        name="instanceName"
        initInfo={initInfo}
      />
      <DataElementSelector>
        <FormikTextField
          data-test-id="responseHeadersField"
          name="responseHeaders"
          label="Response headers"
          description="Provide a data element which returns an object containing the header keys and values returned from the server-based edge call."
          width="size-5000"
        />
      </DataElementSelector>
      <DataElementSelector>
        <FormikTextField
          data-test-id="responseBodyField"
          name="responseBody"
          label="Response body"
          description="Provide a data element which returns an object containing the parsed JSON payload returned from the server-based edge call."
          width="size-5000"
          isRequired
        />
      </DataElementSelector>
      <FormikCheckbox
        data-test-id="renderDecisionsField"
        name="renderDecisions"
        description="Check this to automatically render personalization and pre-hide the content to prevent flicker."
        width="size-5000"
      >
        Render visual personalization decisions
      </FormikCheckbox>
    </FormElementContainer>
  );
};

FormFields.propTypes = {
  initInfo: PropTypes.object.isRequired,
};

const ApplyResponse = () => {
  return (
    <ExtensionView
      getInitialValues={getInitialValues}
      getSettings={getSettings}
      formikStateValidationSchema={validationSchema}
      render={({ initInfo }) => <FormFields initInfo={initInfo} />}
    />
  );
};

render(ApplyResponse);
