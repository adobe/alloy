/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { useRef } from "react";
import PropTypes from "prop-types";
import { useField } from "formik";
import { Content, Link, Radio } from "@adobe/react-spectrum";
import ExtensionView from "../components/extensionView";
import FormElementContainer from "../components/formElementContainer";
import XdmVariable, {
  bridge as xdmVariableBridge,
} from "./variable/components/xdmVariable";
import DataVariable, {
  bridge as dataVariableBridge,
} from "./variable/components/dataVariable";
import FormikRadioGroup from "../components/formikReactSpectrum3/formikRadioGroup";
import { XDM, DATA } from "./variable/constants/variableTypes";

const getInitialValues =
  ({ xdmVariableContext }) =>
  async ({ initInfo }) => {
    const initialValues = {
      type: initInfo?.settings?.solutions ? DATA : XDM,
      ...(await xdmVariableBridge.getInitialValues({
        initInfo,
        context: xdmVariableContext,
      })),
      ...(await dataVariableBridge.getInitialValues({
        initInfo,
      })),
    };
    return initialValues;
  };

const getSettings = ({ values }) => {
  const settings = {
    ...xdmVariableBridge.getSettings({ values }),
    ...dataVariableBridge.getSettings({ values }),
  };

  return settings;
};

const validateFormikState = ({ values }) => ({
  ...xdmVariableBridge.validateFormikState(values),
  ...dataVariableBridge.validateFormikState(values),
});

const Schema = ({ xdmVariableContext, initInfo }) => {
  const [{ value: type }] = useField("type");

  return (
    <>
      <Content width="size-5000">
        Variable data elements are used to build up an XDM or Data object using
        actions. Variable data elements start out empty, but you can update
        properties using Web SDK update variable actions. You can reference the
        variable data element just like any other data element. For example,
        inside of a send event action you can specify this data element as the
        value for XDM.{" "}
        <Link
          href="https://experienceleague.adobe.com/docs/experience-platform/edge/identity/id-sharing.html#tags-extension"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more about the Variable data element type
        </Link>
        .
      </Content>
      <FormikRadioGroup
        label="Choose the property you want to populate"
        name="type"
        orientation="horizontal"
      >
        <Radio data-test-id="xdmRadioButton" value={XDM}>
          XDM
        </Radio>
        <Radio data-test-id="dataRadioButton" value={DATA}>
          Data
        </Radio>
      </FormikRadioGroup>

      {type === XDM && (
        <XdmVariable context={xdmVariableContext} initInfo={initInfo} />
      )}

      {type === DATA && <DataVariable initInfo={initInfo} />}
    </>
  );
};
Schema.propTypes = {
  xdmVariableContext: PropTypes.object,
  initInfo: PropTypes.object,
};

const VariableView = () => {
  const { current: xdmVariableContext } = useRef({});
  return (
    <ExtensionView
      getInitialValues={getInitialValues({ xdmVariableContext })}
      getSettings={getSettings}
      validateFormikState={validateFormikState}
      render={({ initInfo }) => (
        <FormElementContainer>
          <Schema xdmVariableContext={xdmVariableContext} initInfo={initInfo} />
        </FormElementContainer>
      )}
    />
  );
};

export default VariableView;
