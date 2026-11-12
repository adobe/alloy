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
import { useStore } from "@tanstack/react-form";
import { PickerItem, Radio, Button, Text } from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import Delete from "@react-spectrum/s2/icons/Delete";
import ExtensionView from "../components/extensionView";
import { useFormContext } from "../forms/formContext";
import singleDataElementRegex from "../constants/singleDataElementRegex";
import { DATA_ELEMENT_REQUIRED } from "../constants/validationErrorMessages";
import FormRadioGroupWithDataElement, {
  radioGroupWithDataElementSchema,
} from "../forms/fields/RadioGroupWithDataElement";
import FormPicker from "../forms/fields/Picker";
import FormTextField from "../forms/fields/TextField";
import FormRadioGroup from "../forms/fields/RadioGroup";
import DataElementSelector from "../components/dataElementSelector";
import FormElementContainer from "../components/formElementContainer";
import InstanceNamePicker from "../components/instanceNamePicker";
import Overrides, { bridge as overridesBridge } from "../components/overrides";
import getEdgeConfigIds from "../utils/getEdgeConfigIds";
import RequiredComponent from "../components/requiredComponent";
import getRequiredComponentSchema from "../configuration/utils/getRequiredComponentSchema";
import FormEditGroup from "../components/formEditGroup";
import {
  dataElementRequired,
  matches,
  parentOf,
  required,
  shape,
  when,
} from "../forms/validation";

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
      const consentFormValues = createBlankConsentObject();
      if (consentObject.standard === ADOBE.label) {
        consentFormValues.standard = ADOBE.value;
        if (consentObject.version) {
          consentFormValues.adobeVersion = consentObject.version;
        }
        if (consentObject.value && consentObject.value.general) {
          consentFormValues.general = consentObject.value.general;
        } else if (consentObject.value) {
          consentFormValues.value = consentObject.value;
        }
      } else if (consentObject.standard === IAB_TCF.label) {
        consentFormValues.standard = IAB_TCF.value;
        if (consentObject.version) {
          consentFormValues.iabVersion = consentObject.version;
        }
        if (consentObject.value) {
          consentFormValues.iabValue = consentObject.value;
        }
        if (consentObject.gdprApplies != null) {
          consentFormValues.gdprApplies = consentObject.gdprApplies;
        }
        if (consentObject.gdprContainsPersonalData != null) {
          consentFormValues.gdprContainsPersonalData =
            consentObject.gdprContainsPersonalData;
        }
      }
      memo.push(consentFormValues);
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
    settings.consent = consent.reduce((memo, consentFormValues) => {
      if (consentFormValues.standard === ADOBE.value) {
        if (consentFormValues.adobeVersion === "1.0") {
          memo.push({
            standard: ADOBE.label,
            version: consentFormValues.adobeVersion,
            value: {
              general: consentFormValues.general,
            },
          });
        } else {
          memo.push({
            standard: ADOBE.label,
            version: consentFormValues.adobeVersion,
            value: consentFormValues.value,
          });
        }
      } else if (consentFormValues.standard === IAB_TCF.value) {
        memo.push({
          standard: IAB_TCF.label,
          version: consentFormValues.iabVersion,
          value: consentFormValues.iabValue,
          gdprApplies: consentFormValues.gdprApplies,
          gdprContainsPersonalData: consentFormValues.gdprContainsPersonalData,
        });
      }
      return memo;
    }, []);
  }

  return settings;
};

const consentStandardIs =
  (standard, adobeVersionMatches = () => true) =>
  (value, ctx) => {
    const consentObject = parentOf(ctx);
    return (
      consentObject.standard === standard &&
      adobeVersionMatches(consentObject.adobeVersion)
    );
  };

const getValidationSchema = getRequiredComponentSchema("consent", () =>
  shape({
    instanceName: required("instanceName is a required field"),
    identityMap: matches(singleDataElementRegex, DATA_ELEMENT_REQUIRED),
    dataElement: when(
      (value, ctx) => parentOf(ctx).inputMethod === DATA_ELEMENT.value,
      dataElementRequired,
    ),
    consent: when(
      (value, ctx) =>
        parentOf(ctx).inputMethod === FORM.value && Array.isArray(value),
      shape({
        standard: required("Please specify a standard."),
        general: when(
          consentStandardIs(ADOBE.value, (version) => version === "1.0"),
          radioGroupWithDataElementSchema("general"),
        ),
        value: when(
          consentStandardIs(ADOBE.value, (version) => version !== "1.0"),
          dataElementRequired,
        ),
        iabVersion: when(
          consentStandardIs(IAB_TCF.value),
          required("Please specify a version."),
        ),
        iabValue: when(
          consentStandardIs(IAB_TCF.value),
          required("Please specify a value."),
        ),
        gdprApplies: when(
          consentStandardIs(IAB_TCF.value),
          radioGroupWithDataElementSchema("gdprApplies"),
        ),
        gdprContainsPersonalData: when(
          consentStandardIs(IAB_TCF.value),
          radioGroupWithDataElementSchema("gdprContainsPersonalData"),
        ),
      }).array(),
    ),
  }).and(overridesBridge.validationSchema),
);

const ConsentObject = ({ value, index }) => {
  return (
    <>
      <FormPicker
        data-test-id="standardPicker"
        name={`consent.${index}.standard`}
        label="Standard"
        description="The consent standard for this consent object"
        items={[ADOBE, IAB_TCF]}
        width="size-5000"
      >
        {(item) => (
          <PickerItem key={item.value} id={item.value}>
            {item.label}
          </PickerItem>
        )}
      </FormPicker>
      {value.standard === ADOBE.value && (
        <FormPicker
          data-test-id="adobeVersionPicker"
          name={`consent.${index}.adobeVersion`}
          label="Version"
          description="The consent standard version for this consent object"
          items={[VERSION_1_0, VERSION_2_0]}
          width="size-5000"
        >
          {(item) => (
            <PickerItem key={item.value} id={item.value}>
              {item.label}
            </PickerItem>
          )}
        </FormPicker>
      )}
      {value.standard === ADOBE.value &&
        value.adobeVersion === VERSION_1_0.value && (
          <FormRadioGroupWithDataElement
            dataTestIdPrefix="general"
            name={`consent.${index}.general`}
            label="General consent"
            dataElementDescription='This data element should resolve to "in" or "out".'
          >
            <Radio data-test-id="generalInRadio" value="in">
              In
            </Radio>
            <Radio data-test-id="generalOutRadio" value="out">
              Out
            </Radio>
          </FormRadioGroupWithDataElement>
        )}
      {value.standard === ADOBE.value &&
        value.adobeVersion !== VERSION_1_0.value && (
          <DataElementSelector>
            <FormTextField
              data-test-id="valueField"
              name={`consent.${index}.value`}
              label="Value"
              description="Provide a data element containing the Adobe consent XDM object"
              width="size-5000"
              isRequired
            />
          </DataElementSelector>
        )}
      {value.standard === IAB_TCF.value && (
        <>
          <FormTextField
            data-test-id="iabVersionField"
            name={`consent.${index}.iabVersion`}
            label="Version"
            description="The IAB TCF standard version"
            width="size-5000"
            isRequired
          />
          <DataElementSelector>
            <FormTextField
              data-test-id="iabValueField"
              name={`consent.${index}.iabValue`}
              label="Value"
              description="The encoded IAB TCF consent value"
              width="size-5000"
              isRequired
            />
          </DataElementSelector>
          <FormRadioGroupWithDataElement
            dataTestIdPrefix="gdprApplies"
            name={`consent.${index}.gdprApplies`}
            label="Does GDPR apply to this consent value?"
            dataElementDescription="This data element should resolve to true or false."
          >
            <Radio data-test-id="gdprAppliesYesRadio" value>
              Yes
            </Radio>
            <Radio data-test-id="gdprAppliesNoRadio" value={false}>
              No
            </Radio>
          </FormRadioGroupWithDataElement>
          <FormRadioGroupWithDataElement
            dataTestIdPrefix="gdprContainsPersonalData"
            name={`consent.${index}.gdprContainsPersonalData`}
            label="Does the event data associated with this user contain personal data?"
            dataElementDescription="This data element should resolve to true or false."
          >
            <Radio data-test-id="gdprContainsPersonalDataYesRadio" value>
              Yes
            </Radio>
            <Radio data-test-id="gdprContainsPersonalDataNoRadio" value={false}>
              No
            </Radio>
          </FormRadioGroupWithDataElement>
        </>
      )}
    </>
  );
};

ConsentObject.propTypes = {
  value: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
};

const SetConsentForm = ({ initInfo }) => {
  const form = useFormContext();
  const values = useStore(form.store, (state) => state.values);

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
          <FormTextField
            data-test-id="identityMapField"
            name="identityMap"
            label="Identity map"
            description="Provide a data element which returns a custom identity map object as part of the setConsent command."
            width="size-5000"
          />
        </DataElementSelector>
        <FormRadioGroup
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
        </FormRadioGroup>
        {values.inputMethod === FORM.value && (
          <>
            <div
              className={style({
                display: "flex",
                flexDirection: "column",
                gap: 20,
              })}
            >
              {values.consent.map((value, index) => (
                <FormEditGroup
                  data-test-id={`consentObject${index}`}
                  key={`consentObject${index}`}
                  label={`Consent object ${index + 1}`}
                >
                  <FormElementContainer>
                    <ConsentObject value={value} index={index} />
                    {values.consent.length > 1 && (
                      <Button
                        variant="secondary"
                        fillStyle="outline"
                        onPress={() => {
                          form.removeFieldValue("consent", index);
                        }}
                        aria-label="Delete"
                        data-test-id="deleteConsentButton"
                        styles={style({
                          alignSelf: "start",
                        })}
                      >
                        <Delete />
                        <Text>Delete consent object</Text>
                      </Button>
                    )}
                  </FormElementContainer>
                </FormEditGroup>
              ))}
            </div>
            <div>
              <Button
                variant="primary"
                data-test-id="addConsentButton"
                onPress={() => {
                  form.pushFieldValue("consent", createBlankConsentObject());
                }}
              >
                Add consent object
              </Button>
            </div>
          </>
        )}
        {values.inputMethod === DATA_ELEMENT.value && (
          <DataElementSelector>
            <FormTextField
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
};

SetConsentForm.propTypes = {
  initInfo: PropTypes.object.isRequired,
};

const SetConsent = () => {
  return (
    <ExtensionView
      getInitialValues={getInitialValues}
      getSettings={getSettings}
      getValidationSchema={getValidationSchema}
      render={({ initInfo }) => <SetConsentForm initInfo={initInfo} />}
    />
  );
};

export default SetConsent;
