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
import { object } from "yup";
import ExtensionView from "../components/extensionView";
import render from "../render";
import useFocusFirstError from "../utils/useFocusFirstError";
import form from "../forms/form";
import notice from "../forms/notice";
import comboBox from "../forms/comboBox";

const monitoringHooks = [
  {
    value: "onInstanceCreated",
    label: "onInstanceCreated",
  },
  {
    value: "onInstanceConfigured",
    label: "onInstanceConfigured",
  },
  {
    value: "onBeforeCommand",
    label: "onBeforeCommand",
  },
  {
    value: "onCommandResolved",
    label: "onCommandResolved",
  },
  {
    value: "onCommandRejected",
    label: "onCommandRejected",
  },
  {
    value: "onBeforeNetworkRequest",
    label: "onBeforeNetworkRequest",
  },
  {
    value: "onNetworkResponse",
    label: "onNetworkResponse",
  },
  {
    value: "onNetworkError",
    label: "onNetworkError",
  },
  {
    value: "onBeforeLog",
    label: "onBeforeLog",
  },
  {
    value: "onContentRendering",
    label: "onContentRendering",
  },
  {
    value: "onContentHiding",
    label: "onContentHiding",
  },
];

const triggerMonitorForm = form({}, [
  notice({
    title: "Monitoring hooks",
    description:
      "This event will trigger the rule whenever the following Web SDK monitoring hook is triggered. Using this event, " +
      "you can monitor the Web SDK's internal behavior and take action based on the monitoring hook payload that is triggered.",
  }),
  comboBox({
    name: "name",
    label: "Monitoring hook",
    description:
      "Select the type of monitoring hook that will trigger the rule.",
    dataElementDescription:
      "Enter a data element that resolves to a string representing the Web SDK monitoring hook.",
    items: monitoringHooks,
    isRequired: true,
  }),
]);

const FormComponent = (props) => {
  useFocusFirstError();
  const { Component } = triggerMonitorForm;
  return <Component {...props} />;
};

FormComponent.propTypes = {
  initInfo: PropTypes.object,
  formikProps: PropTypes.object,
  namePrefix: PropTypes.string,
  horizontal: PropTypes.bool,
};

const FormExtensionView = () => {
  const { getInitialValues, getSettings, getValidationShape } =
    triggerMonitorForm;

  const getValidationSchema = ({ initInfo }) => {
    const shape = getValidationShape({ initInfo, existingValidationShape: {} });
    return object().shape(shape);
  };

  return (
    <ExtensionView
      getInitialValues={getInitialValues}
      getSettings={getSettings}
      getFormikStateValidationSchema={getValidationSchema}
      render={(props) => <FormComponent {...props} />}
    />
  );
};

render(FormExtensionView);
