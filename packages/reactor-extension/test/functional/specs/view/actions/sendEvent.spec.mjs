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

import createExtensionViewFixture from "../../../helpers/createExtensionViewFixture.mjs";
import * as datastreamMocks from "../../../helpers/endpointMocks/datastreamMocks.mjs";
import * as datastreamsMocks from "../../../helpers/endpointMocks/datastreamsMocks.mjs";
import * as sandboxesMocks from "../../../helpers/endpointMocks/sandboxesMocks.mjs";
import extensionViewController from "../../../helpers/extensionViewController.mjs";
import overrideViewSelectors from "../../../helpers/overrideViewSelectors.mjs";
import spectrum from "../../../helpers/spectrum.mjs";
import testInstanceNameOptions from "../../../helpers/testInstanceNameOptions.mjs";
import runCommonExtensionViewTests from "../runCommonExtensionViewTests.mjs";

const instanceNameField = spectrum.picker("instanceNamePicker");
const typeField = spectrum.comboBox("typeField");
const xdmField = spectrum.textField("xdmTextField");
const dataField = spectrum.textField("dataTextField");
const mergeIdField = spectrum.textField("mergeIdTextField");
const documentUnloadingField = spectrum.checkbox("documentUnloadingCheckbox");
const renderDecisionsField = spectrum.checkbox("renderDecisionsCheckbox");
const scopeDataElementField = spectrum.textField(
  "decisionScopesDataElementField",
);
const surfaceDataElementField = spectrum.textField("surfacesDataElementField");
const scopesRadioGroup = {
  dataElement: spectrum.radio("decisionScopesDataElementOption"),
  values: spectrum.radio("decisionScopesFormOption"),
};
const surfacesRadioGroup = {
  dataElement: spectrum.radio("surfacesDataElementOption"),
  values: spectrum.radio("surfacesFormOption"),
};
const advertisingDataRadioGroup = {
  automatic: spectrum.radio("handleAdvertisingDataautoOption"),
  wait: spectrum.radio("handleAdvertisingDatawaitOption"),
  disabled: spectrum.radio("handleAdvertisingDatadisabledOption"),
  dataElement: spectrum.radio("handleAdvertisingDataDataElement"),
};
const advertisingDataElementField = spectrum.textField(
  "handleAdvertisingDataDataElementField",
);
const addDecisionScopeButton = spectrum.button("decisionScopesAddButton");
const addSurfaceButton = spectrum.button("surfacesAddButton");
const scopeArrayValues = [];
const surfaceArrayValues = [];

for (let i = 0; i < 3; i += 1) {
  scopeArrayValues.push({
    value: spectrum.textField(`decisionScopes${i}Field`),
    deleteButton: spectrum.button(`decisionScopes${i}RemoveButton`),
  });
}

for (let i = 0; i < 3; i += 1) {
  surfaceArrayValues.push({
    value: spectrum.textField(`surfaces${i}Field`),
    deleteButton: spectrum.button(`surfaces${i}RemoveButton`),
  });
}

const mockExtensionSettings = {
  instances: [
    {
      name: "alloy1",
      edgeConfigId: "PR123",
    },
    {
      name: "alloy2",
      edgeConfigId: "PR456",
    },
  ],
  components: {
    advertising: true,
  },
};

createExtensionViewFixture({
  title: "Send Event View",
  viewPath: "actions/sendEvent.html",
});

runCommonExtensionViewTests({
  extensionSettings: mockExtensionSettings,
});

test("initializes form fields with full settings, when decision scopes is data element", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
    settings: {
      instanceName: "alloy2",
      type: "myType1",
      xdm: "%myDataLayer%",
      data: "%myData%",
      mergeId: "%myMergeId%",
      personalization: {
        decisionScopes: "%myDecisionScope%",
        surfaces: "%mySurface%",
      },
      documentUnloading: true,
      renderDecisions: true,
      edgeConfigOverrides: {
        production: {
          sandbox: "prod",
          datastreamId: mockExtensionSettings.instances[0].edgeConfigId,
          com_adobe_experience_platform: {
            datasets: {
              event: {
                datasetId: "6336ff95ba16ca1c07b4c0db",
              },
            },
          },
          com_adobe_analytics: {
            reportSuites: ["unifiedjsqeonly2"],
          },
          com_adobe_identity: {
            idSyncContainerId: 23512312,
          },
          com_adobe_target: {
            propertyToken: "01dbc634-07c1-d8f9-ca69-b489a5ac5e94",
          },
        },
        staging: {
          sandbox: "prod",
          datastreamId: mockExtensionSettings.instances[0].edgeConfigId,
          com_adobe_experience_platform: {
            datasets: {
              event: {
                datasetId: "6336ff95ba16ca1c07b4c0db",
              },
            },
          },
          com_adobe_analytics: {
            reportSuites: ["unifiedjsqeonly2"],
          },
          com_adobe_identity: {
            idSyncContainerId: 23512312,
          },
          com_adobe_target: {
            propertyToken: "01dbc634-07c1-d8f9-ca69-b489a5ac5e94",
          },
        },
        development: {
          sandbox: "prod",
          datastreamId: mockExtensionSettings.instances[0].edgeConfigId,
          com_adobe_experience_platform: {
            datasets: {
              event: {
                datasetId: "6336ff95ba16ca1c07b4c0db",
              },
            },
          },
          com_adobe_analytics: {
            reportSuites: ["unifiedjsqeonly2"],
          },
          com_adobe_identity: {
            idSyncContainerId: 23512312,
          },
          com_adobe_target: {
            propertyToken: "01dbc634-07c1-d8f9-ca69-b489a5ac5e94",
          },
        },
      },
    },
  });
  await instanceNameField.expectText("alloy2");
  await typeField.expectText("myType1");
  await xdmField.expectValue("%myDataLayer%");
  await dataField.expectValue("%myData%");
  await mergeIdField.expectValue("%myMergeId%");
  await documentUnloadingField.expectChecked();
  await renderDecisionsField.expectChecked();
  await scopesRadioGroup.dataElement.expectChecked();
  await scopesRadioGroup.values.expectUnchecked();
  await scopeDataElementField.expectValue("%myDecisionScope%");
  await surfacesRadioGroup.dataElement.expectChecked();
  await surfacesRadioGroup.values.expectUnchecked();
  await surfaceDataElementField.expectValue("%mySurface%");

  await overrideViewSelectors.envTabs.production.click();
  await overrideViewSelectors.envTabs.production.expectSelected();
  await overrideViewSelectors.comboBoxes.envEnabled.expectText("Enabled");
  await overrideViewSelectors.sandbox.expectText("PRODUCTION Prod (VA7)");
  await overrideViewSelectors.datastreamInputMethod.freeform.expectChecked();
  await overrideViewSelectors.datastreamIdFreeform.expectValue(
    mockExtensionSettings.instances[0].edgeConfigId,
  );
  await overrideViewSelectors.textFields.eventDatasetOverride.expectValue(
    "6336ff95ba16ca1c07b4c0db",
  );
  await overrideViewSelectors.textFields.idSyncContainerOverride.expectValue(
    "23512312",
  );
  await overrideViewSelectors.textFields.targetPropertyTokenOverride.expectValue(
    "01dbc634-07c1-d8f9-ca69-b489a5ac5e94",
  );
  await overrideViewSelectors.textFields.reportSuiteOverrides[0].expectValue(
    "unifiedjsqeonly2",
  );

  await overrideViewSelectors.envTabs.staging.click();
  await overrideViewSelectors.envTabs.staging.expectSelected();
  await overrideViewSelectors.comboBoxes.envEnabled.expectText("Enabled");
  await overrideViewSelectors.sandbox.expectText("PRODUCTION Prod (VA7)");
  await overrideViewSelectors.datastreamInputMethod.freeform.expectChecked();
  await overrideViewSelectors.datastreamIdFreeform.expectValue(
    mockExtensionSettings.instances[0].edgeConfigId,
  );
  await overrideViewSelectors.textFields.eventDatasetOverride.expectValue(
    "6336ff95ba16ca1c07b4c0db",
  );
  await overrideViewSelectors.textFields.idSyncContainerOverride.expectValue(
    "23512312",
  );
  await overrideViewSelectors.textFields.targetPropertyTokenOverride.expectValue(
    "01dbc634-07c1-d8f9-ca69-b489a5ac5e94",
  );
  await overrideViewSelectors.textFields.reportSuiteOverrides[0].expectValue(
    "unifiedjsqeonly2",
  );

  await overrideViewSelectors.envTabs.development.click();
  await overrideViewSelectors.envTabs.development.expectSelected();
  await overrideViewSelectors.comboBoxes.envEnabled.expectText("Enabled");
  await overrideViewSelectors.sandbox.expectText("PRODUCTION Prod (VA7)");
  await overrideViewSelectors.datastreamInputMethod.freeform.expectChecked();
  await overrideViewSelectors.datastreamIdFreeform.expectValue(
    mockExtensionSettings.instances[0].edgeConfigId,
  );
  await overrideViewSelectors.textFields.eventDatasetOverride.expectValue(
    "6336ff95ba16ca1c07b4c0db",
  );
  await overrideViewSelectors.textFields.idSyncContainerOverride.expectValue(
    "23512312",
  );
  await overrideViewSelectors.textFields.targetPropertyTokenOverride.expectValue(
    "01dbc634-07c1-d8f9-ca69-b489a5ac5e94",
  );
  await overrideViewSelectors.textFields.reportSuiteOverrides[0].expectValue(
    "unifiedjsqeonly2",
  );

  await extensionViewController.expectIsValid();
});

test("initializes legacy decision scopes form fields, when decision scopes is an array of scopes", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
    settings: {
      instanceName: "alloy1",
      decisionScopes: ["foo1", "foo2", "foo3"],
      personalization: {
        surfaces: ["web://bar1", "web://bar2", "web://bar3"],
      },
    },
  });
  await scopesRadioGroup.values.expectChecked();
  await scopeDataElementField.expectError;
  await scopeArrayValues[0].value.expectValue("foo1");
  await scopeArrayValues[1].value.expectValue("foo2");
  await scopeArrayValues[2].value.expectValue("foo3");
  await surfacesRadioGroup.values.expectChecked();
  await surfaceDataElementField.expectError;
  await surfaceArrayValues[0].value.expectValue("web://bar1");
  await surfaceArrayValues[1].value.expectValue("web://bar2");
  await surfaceArrayValues[2].value.expectValue("web://bar3");
});

test("initializes decision scopes and surfaces form fields, when these are arrays", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
    settings: {
      instanceName: "alloy1",
      personalization: {
        decisionScopes: ["foo1", "foo2", "foo3"],
        surfaces: ["web://bar1", "web://bar2", "web://bar3"],
      },
    },
  });
  await scopesRadioGroup.values.expectChecked();
  await scopeDataElementField.expectError;
  await scopeArrayValues[0].value.expectValue("foo1");
  await scopeArrayValues[1].value.expectValue("foo2");
  await scopeArrayValues[2].value.expectValue("foo3");
  await surfacesRadioGroup.values.expectChecked();
  await surfaceDataElementField.expectError;
  await surfaceArrayValues[0].value.expectValue("web://bar1");
  await surfaceArrayValues[1].value.expectValue("web://bar2");
  await surfaceArrayValues[2].value.expectValue("web://bar3");
});

test("initializes form fields with minimal settings", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
    settings: {
      instanceName: "alloy1",
    },
  });
  await instanceNameField.expectText("alloy1");
  await typeField.expectText("");
  await xdmField.expectValue("");
  await dataField.expectValue("");
  await mergeIdField.expectValue("");
  await scopesRadioGroup.values.expectChecked();
  await documentUnloadingField.expectUnchecked();
  await renderDecisionsField.expectUnchecked();
  await scopesRadioGroup.dataElement.expectUnchecked();
  await scopeArrayValues[0].value.expectValue("");
  await surfacesRadioGroup.dataElement.expectUnchecked();
  await surfaceArrayValues[0].value.expectValue("");
});

test("initializes form fields with no settings", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await instanceNameField.expectText("alloy1");
  await typeField.expectText("");
  await xdmField.expectValue("");
  await dataField.expectValue("");
  await mergeIdField.expectValue("");
  await documentUnloadingField.expectUnchecked();
  await renderDecisionsField.expectUnchecked();
  await scopesRadioGroup.values.expectChecked();
  await scopesRadioGroup.dataElement.expectUnchecked();
  await scopeArrayValues[0].value.expectValue("");
  await surfacesRadioGroup.values.expectChecked();
  await surfacesRadioGroup.dataElement.expectUnchecked();
  await surfaceArrayValues[0].value.expectValue("");
  await overrideViewSelectors.comboBoxes.envEnabled.expectText("No override");
});

test("returns minimal valid settings", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });

  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettingsToContain({
    instanceName: "alloy1",
  });
});

test("returns full valid settings with decision scopes as data element", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await instanceNameField.selectOption("alloy2");
  await typeField.enterSearch("mytype1");
  await typeField.pressEnterKey();
  await xdmField.typeText("%myDataLayer%");
  await dataField.typeText("%myData%");
  await mergeIdField.typeText("%myMergeId%");
  await documentUnloadingField.click();
  await renderDecisionsField.click();
  await scopesRadioGroup.dataElement.click();
  await scopeDataElementField.typeText("%myScope%");
  await surfacesRadioGroup.dataElement.click();
  await surfaceDataElementField.typeText("%mySurface%");
  await extensionViewController.expectIsValid();

  await overrideViewSelectors.envTabs.production.expectExists();
  await overrideViewSelectors.envTabs.production.click();
  await overrideViewSelectors.envTabs.production.expectSelected();
  await overrideViewSelectors.comboBoxes.envEnabled.clear();
  await overrideViewSelectors.comboBoxes.envEnabled.enterSearch("Enabled");
  await overrideViewSelectors.datastreamInputMethod.freeform.click();
  await overrideViewSelectors.datastreamIdFreeform.typeText("PR123");
  await overrideViewSelectors.comboBoxes.experiencePlatformEnabled.clear();
  await overrideViewSelectors.comboBoxes.experiencePlatformEnabled.enterSearch(
    "Enabled",
  );
  await overrideViewSelectors.textFields.eventDatasetOverride.typeText(
    "6336ff95ba16ca1c07b4c0db",
  );
  await overrideViewSelectors.textFields.idSyncContainerOverride.typeText(
    "23512312",
  );
  await overrideViewSelectors.comboBoxes.targetEnabled.clear();
  await overrideViewSelectors.comboBoxes.targetEnabled.enterSearch("Enabled");
  await overrideViewSelectors.textFields.targetPropertyTokenOverride.typeText(
    "01dbc634-07c1-d8f9-ca69-b489a5ac5e94",
  );
  await overrideViewSelectors.comboBoxes.analyticsEnabled.clear();
  await overrideViewSelectors.comboBoxes.analyticsEnabled.enterSearch(
    "Enabled",
  );
  await overrideViewSelectors.textFields.reportSuiteOverrides[0].typeText(
    "unifiedjsqeonly2",
  );
  await overrideViewSelectors.addReportSuiteButton.click();
  await overrideViewSelectors.textFields.reportSuiteOverrides[1].typeText(
    "unifiedjsqeonly3",
  );
  await overrideViewSelectors.envTabs.staging.expectExists();
  await overrideViewSelectors.envTabs.staging.click();
  await overrideViewSelectors.envTabs.staging.expectSelected();
  await overrideViewSelectors.comboBoxes.envEnabled.clear();
  await overrideViewSelectors.comboBoxes.envEnabled.enterSearch("Enabled");
  await overrideViewSelectors.datastreamInputMethod.freeform.click();
  await overrideViewSelectors.datastreamIdFreeform.typeText("PR123");
  await overrideViewSelectors.comboBoxes.experiencePlatformEnabled.clear();
  await overrideViewSelectors.comboBoxes.experiencePlatformEnabled.enterSearch(
    "Enabled",
  );
  await overrideViewSelectors.textFields.eventDatasetOverride.typeText(
    "6336ff95ba16ca1c07b4c0db",
  );
  await overrideViewSelectors.textFields.idSyncContainerOverride.typeText(
    "23512312",
  );
  await overrideViewSelectors.comboBoxes.targetEnabled.clear();
  await overrideViewSelectors.comboBoxes.targetEnabled.enterSearch("Enabled");
  await overrideViewSelectors.textFields.targetPropertyTokenOverride.typeText(
    "01dbc634-07c1-d8f9-ca69-b489a5ac5e94",
  );
  await overrideViewSelectors.comboBoxes.analyticsEnabled.clear();
  await overrideViewSelectors.comboBoxes.analyticsEnabled.enterSearch(
    "Enabled",
  );
  await overrideViewSelectors.textFields.reportSuiteOverrides[0].typeText(
    "unifiedjsqeonly2",
  );
  await overrideViewSelectors.addReportSuiteButton.click();
  await overrideViewSelectors.textFields.reportSuiteOverrides[1].typeText(
    "unifiedjsqeonly3",
  );
  await overrideViewSelectors.envTabs.development.expectExists();
  await overrideViewSelectors.envTabs.development.click();
  await overrideViewSelectors.envTabs.development.expectSelected();
  await overrideViewSelectors.comboBoxes.envEnabled.clear();
  await overrideViewSelectors.comboBoxes.envEnabled.enterSearch("Enabled");
  await overrideViewSelectors.datastreamInputMethod.freeform.click();
  await overrideViewSelectors.datastreamIdFreeform.typeText("PR123");
  await overrideViewSelectors.comboBoxes.experiencePlatformEnabled.clear();
  await overrideViewSelectors.comboBoxes.experiencePlatformEnabled.enterSearch(
    "Enabled",
  );
  await overrideViewSelectors.textFields.eventDatasetOverride.typeText(
    "6336ff95ba16ca1c07b4c0db",
  );
  await overrideViewSelectors.textFields.idSyncContainerOverride.typeText(
    "23512312",
  );
  await overrideViewSelectors.comboBoxes.targetEnabled.clear();
  await overrideViewSelectors.comboBoxes.targetEnabled.enterSearch("Enabled");
  await overrideViewSelectors.textFields.targetPropertyTokenOverride.typeText(
    "01dbc634-07c1-d8f9-ca69-b489a5ac5e94",
  );
  await overrideViewSelectors.comboBoxes.analyticsEnabled.clear();
  await overrideViewSelectors.comboBoxes.analyticsEnabled.enterSearch(
    "Enabled",
  );
  await overrideViewSelectors.textFields.reportSuiteOverrides[0].typeText(
    "unifiedjsqeonly2",
  );
  await overrideViewSelectors.addReportSuiteButton.click();
  await overrideViewSelectors.textFields.reportSuiteOverrides[1].typeText(
    "unifiedjsqeonly3",
  );

  await extensionViewController.expectSettings({
    instanceName: "alloy2",
    type: "mytype1",
    xdm: "%myDataLayer%",
    data: "%myData%",
    mergeId: "%myMergeId%",
    documentUnloading: true,
    renderDecisions: true,
    personalization: {
      decisionScopes: "%myScope%",
      surfaces: "%mySurface%",
    },
    edgeConfigOverrides: {
      production: {
        enabled: true,
        sandbox: "prod",
        datastreamId: "PR123",
        com_adobe_experience_platform: {
          datasets: {
            event: {
              datasetId: "6336ff95ba16ca1c07b4c0db",
            },
          },
        },
        com_adobe_analytics: {
          reportSuites: ["unifiedjsqeonly2", "unifiedjsqeonly3"],
        },
        com_adobe_identity: {
          idSyncContainerId: 23512312,
        },
        com_adobe_target: {
          propertyToken: "01dbc634-07c1-d8f9-ca69-b489a5ac5e94",
        },
      },
      staging: {
        enabled: true,
        sandbox: "prod",
        datastreamId: "PR123",
        com_adobe_experience_platform: {
          datasets: {
            event: {
              datasetId: "6336ff95ba16ca1c07b4c0db",
            },
          },
        },
        com_adobe_analytics: {
          reportSuites: ["unifiedjsqeonly2", "unifiedjsqeonly3"],
        },
        com_adobe_identity: {
          idSyncContainerId: 23512312,
        },
        com_adobe_target: {
          propertyToken: "01dbc634-07c1-d8f9-ca69-b489a5ac5e94",
        },
      },
      development: {
        enabled: true,
        sandbox: "prod",
        datastreamId: "PR123",
        com_adobe_experience_platform: {
          datasets: {
            event: {
              datasetId: "6336ff95ba16ca1c07b4c0db",
            },
          },
        },
        com_adobe_analytics: {
          reportSuites: ["unifiedjsqeonly2", "unifiedjsqeonly3"],
        },
        com_adobe_identity: {
          idSyncContainerId: 23512312,
        },
        com_adobe_target: {
          propertyToken: "01dbc634-07c1-d8f9-ca69-b489a5ac5e94",
        },
      },
    },
  });
});

test("shows error for data value that is not a data element", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await dataField.typeText("myData");
  await extensionViewController.expectIsNotValid();
  await dataField.expectError();
});

test("returns decision scopes settings as an array", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await scopesRadioGroup.values.click();
  await scopeArrayValues[0].value.typeText("foo");
  await addDecisionScopeButton.click();
  await scopeArrayValues[1].value.typeText("foo1");
  await addDecisionScopeButton.click();
  await scopeArrayValues[2].value.typeText("foo2");
  await scopeArrayValues[1].deleteButton.click();
  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettings({
    instanceName: "alloy1",
    personalization: {
      decisionScopes: ["foo", "foo2"],
    },
  });
});

test("returns surfaces settings as an array", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await surfacesRadioGroup.values.click();
  await surfaceArrayValues[0].value.typeText("web://foo");
  await addSurfaceButton.click();
  await surfaceArrayValues[1].value.typeText("web://foo1");
  await addSurfaceButton.click();
  await surfaceArrayValues[2].value.typeText("web://foo2");
  await surfaceArrayValues[1].deleteButton.click();
  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettings({
    instanceName: "alloy1",
    personalization: {
      surfaces: ["web://foo", "web://foo2"],
    },
  });
});

test("does not return decision scopes settings when provided with array of empty strings", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await scopesRadioGroup.values.click();
  await addDecisionScopeButton.click();
  await addDecisionScopeButton.click();
  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettings({
    instanceName: "alloy1",
  });
});

test("does not return surface settings when provided with array of empty strings", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await surfacesRadioGroup.values.click();
  await addSurfaceButton.click();
  await addSurfaceButton.click();
  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettings({
    instanceName: "alloy1",
  });
});

test("shows error for xdm value that is not a data element", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await xdmField.typeText("myDataLayer");
  await extensionViewController.expectIsNotValid();
  await xdmField.expectError();
});

test("shows error for data value that is not a data element", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await dataField.typeText("myData");
  await extensionViewController.expectIsNotValid();
  await dataField.expectError();
});

test("shows error for decision scope value that is not a data element", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await scopesRadioGroup.dataElement.click();
  await scopeDataElementField.typeText("fooScope");
  await extensionViewController.expectIsNotValid();
  await scopeDataElementField.expectError();
});

test("shows error for surface value that is not a data element", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await surfacesRadioGroup.dataElement.click();
  await surfaceDataElementField.typeText("fooSurface");
  await extensionViewController.expectIsNotValid();
  await surfaceDataElementField.expectError();
});

test("shows error for data value that is more than one data element", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await dataField.typeText("%a%%b%");
  await extensionViewController.expectIsNotValid();
  await dataField.expectError();
});

test("shows error for xdm value that is more than one data element", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await xdmField.typeText("%a%%b%");
  await extensionViewController.expectIsNotValid();
  await xdmField.expectError();
});

test("shows error for data value that is more than one data element", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await dataField.typeText("%a%%b%");
  await extensionViewController.expectIsNotValid();
  await dataField.expectError();
});

test.requestHooks(
  sandboxesMocks.singleDefault,
  datastreamsMocks.single,
  datastreamMocks.withConfigOverrides,
)("populates overrides dropdowns with Blackbird config data", async () => {
  await extensionViewController.init({
    extensionSettings: {
      instances: [
        {
          name: "alloy",
          edgeConfigId: "aca8c786-4940-442f-ace5-7c4aba02118e",
          sandbox: "prod",
        },
      ],
    },
  });

  await overrideViewSelectors.envTabs.production.click();
  await overrideViewSelectors.envTabs.production.expectSelected();
  await overrideViewSelectors.comboBoxes.envEnabled.clear();
  await overrideViewSelectors.comboBoxes.envEnabled.enterSearch("Enabled");
  await overrideViewSelectors.comboBoxes.experiencePlatformEnabled.clear();
  await overrideViewSelectors.comboBoxes.experiencePlatformEnabled.enterSearch(
    "Enabled",
  );
  await overrideViewSelectors.comboBoxes.eventDatasetOverride.expectExists();
  await overrideViewSelectors.comboBoxes.eventDatasetOverride.openMenu();
  await overrideViewSelectors.comboBoxes.eventDatasetOverride.expectMenuOptionLabels(
    ["6335faf30f5a161c0b4b1444"],
  );
  await overrideViewSelectors.comboBoxes.eventDatasetOverride.selectMenuOption(
    "6335faf30f5a161c0b4b1444",
  );

  await overrideViewSelectors.comboBoxes.idSyncContainerOverride.expectExists();
  await overrideViewSelectors.comboBoxes.idSyncContainerOverride.openMenu();
  await overrideViewSelectors.comboBoxes.idSyncContainerOverride.expectMenuOptionLabels(
    ["107756", "107757"],
  );
  await overrideViewSelectors.comboBoxes.idSyncContainerOverride.selectMenuOption(
    "107756",
  );

  await overrideViewSelectors.comboBoxes.targetEnabled.clear();
  await overrideViewSelectors.comboBoxes.targetEnabled.enterSearch("Enabled");
  await overrideViewSelectors.comboBoxes.targetPropertyTokenOverride.expectExists();
  await overrideViewSelectors.comboBoxes.targetPropertyTokenOverride.openMenu();
  await overrideViewSelectors.comboBoxes.targetPropertyTokenOverride.expectMenuOptionLabels(
    [
      "aba5431a-9f59-f816-7d73-8e40c8f4c4fd",
      "65d186ff-be14-dfa0-75fa-546d93bebf91",
    ],
  );
  await overrideViewSelectors.comboBoxes.targetPropertyTokenOverride.selectMenuOption(
    "aba5431a-9f59-f816-7d73-8e40c8f4c4fd",
  );

  await overrideViewSelectors.comboBoxes.analyticsEnabled.clear();
  await overrideViewSelectors.comboBoxes.analyticsEnabled.enterSearch(
    "Enabled",
  );
  await overrideViewSelectors.comboBoxes.reportSuiteOverrides[0].expectExists();
  await overrideViewSelectors.comboBoxes.reportSuiteOverrides[0].openMenu();
  await overrideViewSelectors.comboBoxes.reportSuiteOverrides[0].expectMenuOptionLabels(
    ["unifiedjsqeonly2", "unifiedjsqeonlylatest", "unifiedjsqeonlymobileweb"],
  );
  await overrideViewSelectors.comboBoxes.reportSuiteOverrides[0].selectMenuOption(
    "unifiedjsqeonlylatest",
  );

  await extensionViewController.expectIsValid();
});

test("can type a datastream overrides", async () => {
  await extensionViewController.init({
    extensionSettings: {
      instances: [
        {
          name: "alloy",
          edgeConfigId: "aca8c786-4940-442f-ace5-7c4aba02118e",
          sandbox: "prod",
        },
      ],
    },
  });

  await overrideViewSelectors.envTabs.production.click();
  await overrideViewSelectors.envTabs.production.expectSelected();
  await overrideViewSelectors.comboBoxes.envEnabled.clear();
  await overrideViewSelectors.comboBoxes.envEnabled.enterSearch("Enabled");
  await overrideViewSelectors.datastreamInputMethod.freeform.click();
  await overrideViewSelectors.datastreamInputMethod.freeform.expectChecked();
  await overrideViewSelectors.datastreamIdFreeform.typeText("1234");

  await extensionViewController.expectIsValid();
});

test.requestHooks(
  sandboxesMocks.multipleWithoutDefault,
  datastreamsMocks.single,
  datastreamMocks.withConfigOverrides,
)(
  "overrides switch to textfields when the second instance is selected",
  async () => {
    await extensionViewController.init({
      extensionSettings: {
        instances: [
          {
            name: "alloy1",
            edgeConfigId: "aca8c786-4940-442f-ace5-7c4aba02118e",
            sandbox: "prod",
            stagingEdgeConfigId: "aca8c786-4940-442f-ace5-7c4aba02118e",
            stagingSandbox: "prod",
            developmentEdgeConfigId: "aca8c786-4940-442f-ace5-7c4aba02118e",
            developmentSandbox: "prod",
          },
          {
            name: "alloy2",
            edgeConfigId: "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83",
            sandbox: "testsandbox1",
            stagingEdgeConfigId: "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83",
            stagingSandbox: "testsandbox1",
            developmentEdgeConfigId: "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83",
            developmentSandbox: "testsandbox1",
          },
        ],
      },
    });

    await instanceNameField.expectText("alloy1");
    await overrideViewSelectors.comboBoxes.envEnabled.clear();
    await overrideViewSelectors.comboBoxes.envEnabled.enterSearch("Enabled");
    await overrideViewSelectors.sandbox.selectOption(
      "PRODUCTION Test Sandbox Prod (VA7)",
    );
    await overrideViewSelectors.datastreamIdDropdown.expectExists();
    await overrideViewSelectors.datastreamIdDropdown.expectIsPicker();
    await overrideViewSelectors.comboBoxes.experiencePlatformEnabled.clear();
    await overrideViewSelectors.comboBoxes.experiencePlatformEnabled.enterSearch(
      "Enabled",
    );
    await overrideViewSelectors.comboBoxes.eventDatasetOverride.expectIsComboBox();

    await instanceNameField.selectOption("alloy2");

    await overrideViewSelectors.comboBoxes.envEnabled.clear();
    await overrideViewSelectors.comboBoxes.envEnabled.enterSearch("Enabled");
    await overrideViewSelectors.datastreamIdFreeform.expectExists();
    await overrideViewSelectors.datastreamIdFreeform.expectIsTextField();
    await overrideViewSelectors.comboBoxes.experiencePlatformEnabled.clear();
    await overrideViewSelectors.comboBoxes.experiencePlatformEnabled.enterSearch(
      "Enabled",
    );
    await overrideViewSelectors.textFields.eventDatasetOverride.expectIsTextField();
  },
);

// Advertising Data Tests
test("initializes advertising field with default disabled value", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await advertisingDataRadioGroup.disabled.expectChecked();
  await advertisingDataRadioGroup.automatic.expectUnchecked();
  await advertisingDataRadioGroup.wait.expectUnchecked();
  await advertisingDataRadioGroup.dataElement.expectUnchecked();
});

test("does not include advertising settings when handleAdvertisingData is disabled (default)", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  // Keep default disabled selection
  await advertisingDataRadioGroup.disabled.expectChecked();

  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettings({
    instanceName: "alloy1",
  });
});

test("includes advertising settings when handleAdvertisingData is set to automatic", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });

  await advertisingDataRadioGroup.automatic.click();
  await advertisingDataRadioGroup.automatic.expectChecked();

  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettings({
    instanceName: "alloy1",
    advertising: {
      handleAdvertisingData: "auto",
    },
  });
});

test("includes advertising settings when handleAdvertisingData is set to wait", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });

  await advertisingDataRadioGroup.wait.click();
  await advertisingDataRadioGroup.wait.expectChecked();

  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettings({
    instanceName: "alloy1",
    advertising: {
      handleAdvertisingData: "wait",
    },
  });
});

test("includes advertising settings when using data element", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });

  await advertisingDataRadioGroup.dataElement.click();
  await advertisingDataRadioGroup.dataElement.expectChecked();
  await advertisingDataElementField.typeText("%myAdvertisingData%");

  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettings({
    instanceName: "alloy1",
    advertising: {
      handleAdvertisingData: "%myAdvertisingData%",
    },
  });
});

test("initializes form with existing advertising settings - automatic", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
    settings: {
      instanceName: "alloy1",
      advertising: {
        handleAdvertisingData: "auto",
      },
    },
  });

  await advertisingDataRadioGroup.automatic.expectChecked();
  await advertisingDataRadioGroup.disabled.expectUnchecked();
  await advertisingDataRadioGroup.wait.expectUnchecked();
  await advertisingDataRadioGroup.dataElement.expectUnchecked();
});

test("initializes form with existing advertising settings - wait", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
    settings: {
      instanceName: "alloy1",
      advertising: {
        handleAdvertisingData: "wait",
      },
    },
  });

  await advertisingDataRadioGroup.wait.expectChecked();
  await advertisingDataRadioGroup.disabled.expectUnchecked();
  await advertisingDataRadioGroup.automatic.expectUnchecked();
  await advertisingDataRadioGroup.dataElement.expectUnchecked();
});

test("initializes form with existing advertising settings - data element", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
    settings: {
      instanceName: "alloy1",
      advertising: {
        handleAdvertisingData: "%myAdvertisingData%",
      },
    },
  });

  await advertisingDataRadioGroup.dataElement.expectChecked();
  await advertisingDataElementField.expectValue("%myAdvertisingData%");
  await advertisingDataRadioGroup.disabled.expectUnchecked();
  await advertisingDataRadioGroup.automatic.expectUnchecked();
  await advertisingDataRadioGroup.wait.expectUnchecked();
});

test("does not include advertising when switching back to disabled", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });

  // First set to automatic
  await advertisingDataRadioGroup.automatic.click();
  await advertisingDataRadioGroup.automatic.expectChecked();

  // Then switch back to disabled
  await advertisingDataRadioGroup.disabled.click();
  await advertisingDataRadioGroup.disabled.expectChecked();

  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettings({
    instanceName: "alloy1",
  });
});

test("shows error for advertising data element value that is not a data element", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });

  await advertisingDataRadioGroup.dataElement.click();
  await advertisingDataElementField.typeText("notADataElement");

  await extensionViewController.expectIsNotValid();
  await advertisingDataElementField.expectError();
});

test("allows advertising settings with other personalization settings", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });

  await advertisingDataRadioGroup.automatic.click();
  await renderDecisionsField.click();
  await scopesRadioGroup.dataElement.click();
  await scopeDataElementField.typeText("%myScopes%");

  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettings({
    instanceName: "alloy1",
    renderDecisions: true,
    personalization: {
      decisionScopes: "%myScopes%",
    },
    advertising: {
      handleAdvertisingData: "auto",
    },
  });
});

testInstanceNameOptions(extensionViewController, instanceNameField);
