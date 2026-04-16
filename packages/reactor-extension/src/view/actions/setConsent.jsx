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
import { FieldArray } from "formik";
import { object, string, array, mixed } from "yup";
import { Item, Radio, Button, Well, Text, Flex } from "@adobe/react-spectrum";
import Delete from "@spectrum-icons/workflow/Delete";
import render from "../render";
import ExtensionView from "../components/extensionView";
import singleDataElementRegex from "../constants/singleDataElementRegex";
import { DATA_ELEMENT_REQUIRED } from "../constants/validationErrorMessages";
import FormikRadioGroupWithDataElement, {
  createRadioGroupWithDataElementValidationSchema,
} from "../components/formikReactSpectrum3/formikRadioGroupWithDataElement";
import FormikPicker from "../components/formikReactSpectrum3/formikPicker";
import FormikTextField from "../components/formikReactSpectrum3/formikTextField";
import FormikRadioGroup from "../components/formikReactSpectrum3/formikRadioGroup";
import DataElementSelector from "../components/dataElementSelector";
import FormElementContainer from "../components/formElementContainer";
import InstanceNamePicker from "../components/instanceNamePicker";
import Overrides, { bridge as overridesBridge } from "../components/overrides";
import getEdgeConfigIds from "../utils/getEdgeConfigIds";
import RequiredComponent from "../components/requiredComponent";
import getRequiredComponentSchema from "../configuration/utils/getRequiredComponentSchema";

const FORM = { value: "form", label: "Fill out a form" };
const DATA_ELEMENT = { value: "dataElement", label: "Provide a data element" };
const ADOBE = { value: "adobe", label: "Adobe" };
const IAB_TCF = { value: "iab_tcf", label: "IAB TCF" };
const VERSION_1_0 = { value: "1.0", label: "1.0" };
const VERSION_2_0 = { value: "2.0", label: "2.0" };

const createBlankConsentObject = () => {
  return {
    standard: "adobe",
    adobeVersion: "1.0",
    iabVersion: "2.0",
    general: "in",
    value: "",
    iabValue: "",
    gdprApplies: true,
    gdprContainsPersonalData: false,
  };
};

const getInitialValues = ({ initInfo }) => {
  const {
    instanceName = initInfo.extensionSettings?.instances?.[0]?.name,
    identityMap = "",
    consent,
    edgeConfigOverrides,
  } = initInfo.settings || {};

  const initialValues = {
    instanceName,
    identityMap,
    ...overridesBridge.getInitialInstanceValues({
      instanceSettings: { edgeConfigOverrides },
    }),
  };

  if (typeof consent === "string") {
    initialValues.inputMethod = DATA_ELEMENT.value;
    initialValues.dataElement = consent;
    initialValues.consent = [createBlankConsentObject()];
  } else if (Array.isArray(consent)) {
    initialValues.inputMethod = FORM.value;
    initialValues.dataElement = "";
    initialValues.consent = consent.reduce((memo, consentObject) => {
      const formikConsentObject = createBlankConsentObject();
      if (consentObject.standard === ADOBE.label) {
        formikConsentObject.standard = ADOBE.value;
        if (consentObject.version) {
          formikConsentObject.adobeVersion = consentObject.version;
        }
        if (consentObject.value && consentObject.value.general) {
          formikConsentObject.general = consentObject.value.general;
        } else if (consentObject.value) {
          formikConsentObject.value = consentObject.value;
        }
      } else if (consentObject.standard === IAB_TCF.label) {
        formikConsentObject.standard = IAB_TCF.value;
        if (consentObject.version) {
          formikConsentObject.iabVersion = consentObject.version;
        }
        if (consentObject.value) {
          formikConsentObject.iabValue = consentObject.value;
        }
        if (consentObject.gdprApplies != null) {
          formikConsentObject.gdprApplies = consentObject.gdprApplies;
        }
        if (consentObject.gdprContainsPersonalData != null) {
          formikConsentObject.gdprContainsPersonalData =
            consentObject.gdprContainsPersonalData;
        }
      }
      memo.push(formikConsentObject);
      return memo;
    }, []);
  } else {
    initialValues.inputMethod = FORM.value;
    initialValues.dataElement = "";
    initialValues.consent = [createBlankConsentObject()];
  }
  return initialValues;
};

const getSettings = ({ values }) => {
  const { instanceName, identityMap, inputMethod, dataElement, consent } =
    values;

  const settings = {
    instanceName,
  };

  if (identityMap) {
    settings.identityMap = identityMap;
  }

  const { edgeConfigOverrides } = overridesBridge.getInstanceSettings({
    instanceValues: values,
  });

  if (edgeConfigOverrides && Object.keys(edgeConfigOverrides).length > 0) {
    settings.edgeConfigOverrides = edgeConfigOverrides;
  }

  if (inputMethod === DATA_ELEMENT.value) {
    settings.consent = dataElement;
  } else {
    settings.consent = consent.reduce((memo, formikConsentObject) => {
      if (formikConsentObject.standard === ADOBE.value) {
        if (formikConsentObject.adobeVersion === "1.0") {
          memo.push({
            standard: ADOBE.label,
            version: formikConsentObject.adobeVersion,
            value: {
              general: formikConsentObject.general,
            },
          });
        } else {
          memo.push({
            standard: ADOBE.label,
            version: formikConsentObject.adobeVersion,
            value: formikConsentObject.value,
          });
        }
      } else if (formikConsentObject.standard === IAB_TCF.value) {
        memo.push({
          standard: IAB_TCF.label,
          version: formikConsentObject.iabVersion,
          value: formikConsentObject.iabValue,
          gdprApplies: formikConsentObject.gdprApplies,
          gdprContainsPersonalData:
            formikConsentObject.gdprContainsPersonalData,
        });
      }
      return memo;
    }, []);
  }

  return settings;
};

const getValidationSchema = getRequiredComponentSchema("consent", () => {
  return object()
    .shape({
      instanceName: string().required(),
      identityMap: string().matches(
        singleDataElementRegex,
        DATA_ELEMENT_REQUIRED,
      ),
      dataElement: mixed().when("inputMethod", {
        is: DATA_ELEMENT.value,
        then: () =>
          string()
            .matches(singleDataElementRegex, DATA_ELEMENT_REQUIRED)
            .required(DATA_ELEMENT_REQUIRED),
      }),
      consent: array().when("inputMethod", {
        is: FORM.value,
        then: (schema) =>
          schema.of(
            object().shape({
              standard: string().required("Please specify a standard."),
              general: mixed().when(["standard", "adobeVersion"], {
                is: (standard, adobeVersion) =>
                  standard === ADOBE.value && adobeVersion === "1.0",
                then: () =>
                  createRadioGroupWithDataElementValidationSchema("general"),
              }),
              value: mixed().when(["standard", "adobeVersion"], {
                is: (standard, adobeVersion) =>
                  standard === ADOBE.value && adobeVersion !== "1.0",
                then: () =>
                  string()
                    .required(DATA_ELEMENT_REQUIRED)
                    .matches(singleDataElementRegex, DATA_ELEMENT_REQUIRED),
              }),
              iabVersion: mixed().when("standard", {
                is: IAB_TCF.value,
                then: () => string().required("Please specify a version."),
              }),
              iabValue: mixed().when("standard", {
                is: IAB_TCF.value,
                then: () => string().required("Please specify a value."),
              }),
              gdprApplies: mixed().when("standard", {
                is: IAB_TCF.value,
                then: () =>
                  createRadioGroupWithDataElementValidationSchema(
                    "gdprApplies",
                  ),
              }),
              gdprContainsPersonalData: mixed().when("standard", {
                is: IAB_TCF.value,
                then: () =>
                  createRadioGroupWithDataElementValidationSchema(
                    "gdprContainsPersonalData",
                  ),
              }),
            }),
          ),
      }),
    })
    .concat(overridesBridge.formikStateValidationSchema);
});

const ConsentObject = ({ value, index }) => {
  return (
    <>
      <FormikPicker
        data-test-id="standardPicker"
        name={`consent[${index}].standard`}
        label="Standard"
        description="The consent standard for this consent object"
        items={[ADOBE, IAB_TCF]}
        width="size-5000"
      >
        {(item) => <Item key={item.value}>{item.label}</Item>}
      </FormikPicker>
      {value.standard === ADOBE.value && (
        <FormikPicker
          data-test-id="adobeVersionPicker"
          name={`consent[${index}].adobeVersion`}
          label="Version"
          description="The consent standard version for this consent object"
          items={[VERSION_1_0, VERSION_2_0]}
          width="size-5000"
        >
          {(item) => <Item key={item.value}>{item.label}</Item>}
        </FormikPicker>
      )}
      {value.standard === ADOBE.value &&
        value.adobeVersion === VERSION_1_0.value && (
          <FormikRadioGroupWithDataElement
            dataTestIdPrefix="general"
            name={`consent[${index}].general`}
            label="General consent"
            dataElementDescription='This data element should resolve to "in" or "out".'
          >
            <Radio data-test-id="generalInRadio" value="in">
              In
            </Radio>
            <Radio data-test-id="generalOutRadio" value="out">
              Out
            </Radio>
          </FormikRadioGroupWithDataElement>
        )}
      {value.standard === ADOBE.value &&
        value.adobeVersion !== VERSION_1_0.value && (
          <DataElementSelector>
            <FormikTextField
              data-test-id="valueField"
              name={`consent[${index}].value`}
              label="Value"
              description="Provide a data element containing the Adobe consent XDM object"
              width="size-5000"
              isRequired
            />
          </DataElementSelector>
        )}
      {value.standard === IAB_TCF.value && (
        <>
          <FormikTextField
            data-test-id="iabVersionField"
            name={`consent[${index}].iabVersion`}
            label="Version"
            description="The IAB TCF standard version"
            width="size-5000"
            isRequired
          />
          <DataElementSelector>
            <FormikTextField
              data-test-id="iabValueField"
              name={`consent[${index}].iabValue`}
              label="Value"
              description="The encoded IAB TCF consent value"
              width="size-5000"
              isRequired
            />
          </DataElementSelector>
          <FormikRadioGroupWithDataElement
            dataTestIdPrefix="gdprApplies"
            name={`consent[${index}].gdprApplies`}
            label="Does GDPR apply to this consent value?"
            dataElementDescription="This data element should resolve to true or false."
          >
            <Radio data-test-id="gdprAppliesYesRadio" value>
              Yes
            </Radio>
            <Radio data-test-id="gdprAppliesNoRadio" value={false}>
              No
            </Radio>
          </FormikRadioGroupWithDataElement>
          <FormikRadioGroupWithDataElement
            dataTestIdPrefix="gdprContainsPersonalData"
            name={`consent[${index}].gdprContainsPersonalData`}
            label="Does the event data associated with this user contain personal data?"
            dataElementDescription="This data element should resolve to true or false."
          >
            <Radio data-test-id="gdprContainsPersonalDataYesRadio" value>
              Yes
            </Radio>
            <Radio data-test-id="gdprContainsPersonalDataNoRadio" value={false}>
              No
            </Radio>
          </FormikRadioGroupWithDataElement>
        </>
      )}
    </>
  );
};

ConsentObject.propTypes = {
  value: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
};

const SetConsent = () => {
  return (
    <ExtensionView
      getInitialValues={getInitialValues}
      getSettings={getSettings}
      getFormikStateValidationSchema={getValidationSchema}
      render={({ initInfo, formikProps: { values } }) => {
        const { instanceName } = values;
        const instanceSettings = initInfo.extensionSettings?.instances?.find(
          (instance) => instance.name === instanceName,
        );
        const edgeConfigIds = getEdgeConfigIds(instanceSettings);
        const orgId = instanceSettings?.orgId ?? initInfo.company.orgId;
        return (
          <FormElementContainer>
            <RequiredComponent
              initInfo={initInfo}
              requiredComponent="consent"
              title="the Set consent action"
              whole
            >
              <InstanceNamePicker
                data-test-id="instanceNamePicker"
                name="instanceName"
                initInfo={initInfo}
              />
              <DataElementSelector>
                <FormikTextField
                  data-test-id="identityMapField"
                  name="identityMap"
                  label="Identity map"
                  description="Provide a data element which returns a custom identity map object as part of the setConsent command."
                  width="size-5000"
                />
              </DataElementSelector>
              <FormikRadioGroup
                name="inputMethod"
                orientation="horizontal"
                label="Consent information"
              >
                <Radio data-test-id="inputMethodFormRadio" value={FORM.value}>
                  {FORM.label}
                </Radio>
                <Radio
                  data-test-id="inputMethodDataElementRadio"
                  value={DATA_ELEMENT.value}
                >
                  {DATA_ELEMENT.label}
                </Radio>
              </FormikRadioGroup>
              {values.inputMethod === FORM.value && (
                <FieldArray
                  name="consent"
                  render={(arrayHelpers) => (
                    <>
                      <Button
                        variant="primary"
                        data-test-id="addConsentButton"
                        onPress={() => {
                          arrayHelpers.push(createBlankConsentObject());
                        }}
                        marginStart="auto"
                      >
                        Add consent object
                      </Button>
                      <Flex direction="column" gap="size-250">
                        {values.consent.map((value, index) => (
                          <Well
                            data-test-id={`consentObject${index}`}
                            key={`consentObject${index}`}
                          >
                            <FormElementContainer>
                              <ConsentObject value={value} index={index} />
                              {values.consent.length > 1 && (
                                <Button
                                  variant="secondary"
                                  onPress={() => {
                                    arrayHelpers.remove(index);
                                  }}
                                  aria-label="Delete"
                                  data-test-id="deleteConsentButton"
                                  alignSelf="flex-start"
                                >
                                  <Delete />
                                  <Text>Delete consent object</Text>
                                </Button>
                              )}
                            </FormElementContainer>
                          </Well>
                        ))}
                      </Flex>
                    </>
                  )}
                />
              )}
              {values.inputMethod === DATA_ELEMENT.value && (
                <DataElementSelector>
                  <FormikTextField
                    data-test-id="dataElementField"
                    label="Data element"
                    name="dataElement"
                    isRequired
                    width="size-5000"
                  />
                </DataElementSelector>
              )}
              <Overrides
                initInfo={initInfo}
                edgeConfigIds={edgeConfigIds}
                configOrgId={orgId}
              />
            </RequiredComponent>
          </FormElementContainer>
        );
      }}
    />
  );
};

render(SetConsent);
