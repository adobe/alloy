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

import extensionViewController from "../../../helpers/extensionViewController.mjs";
import spectrum from "../../../helpers/spectrum.mjs";
import createExtensionViewFixture from "../../../helpers/createExtensionViewFixture.mjs";
import runCommonExtensionViewTests from "../runCommonExtensionViewTests.mjs";
import overrideViewSelectors from "../../../helpers/overrideViewSelectors.mjs";
import * as sandboxesMocks from "../../../helpers/endpointMocks/sandboxesMocks.mjs";
import * as datastreamsMocks from "../../../helpers/endpointMocks/datastreamsMocks.mjs";
import * as datastreamMocks from "../../../helpers/endpointMocks/datastreamMocks.mjs";

const instanceNamePicker = spectrum.picker("instanceNamePicker");

createExtensionViewFixture({
  title: "Redirect with identity",
  viewPath: "actions/redirectWithIdentity.html",
});

runCommonExtensionViewTests();

const extensionSettings = {
  instances: [{ name: "alloy1" }, { name: "alloy2" }],
};

test("initializes form fields with settings", async () => {
  await extensionViewController.init({
    settings: {
      instanceName: "alloy2",
      edgeConfigOverrides: {
        production: {
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
          sandbox: "prod",
        },
        staging: {
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
          sandbox: "prod",
        },
        development: {
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
          sandbox: "prod",
        },
      },
    },
    extensionSettings,
  });
  await instanceNamePicker.expectSelectedOptionLabel("alloy2");

  await overrideViewSelectors.envTabs.production.click();
  await overrideViewSelectors.envTabs.production.expectSelected();
  await overrideViewSelectors.comboBoxes.envEnabled.expectText("Enabled");
  await overrideViewSelectors.comboBoxes.experiencePlatformEnabled.expectText(
    "Enabled",
  );
  await overrideViewSelectors.textFields.eventDatasetOverride.expectValue(
    "6336ff95ba16ca1c07b4c0db",
  );
  await overrideViewSelectors.textFields.idSyncContainerOverride.expectValue(
    "23512312",
  );
  await overrideViewSelectors.comboBoxes.targetEnabled.expectText("Enabled");
  await overrideViewSelectors.textFields.targetPropertyTokenOverride.expectValue(
    "01dbc634-07c1-d8f9-ca69-b489a5ac5e94",
  );
  await overrideViewSelectors.comboBoxes.analyticsEnabled.expectText("Enabled");
  await overrideViewSelectors.textFields.reportSuiteOverrides[0].expectValue(
    "unifiedjsqeonly2",
  );

  await overrideViewSelectors.envTabs.staging.click();
  await overrideViewSelectors.envTabs.staging.expectSelected();
  await overrideViewSelectors.comboBoxes.envEnabled.expectText("Enabled");
  await overrideViewSelectors.comboBoxes.experiencePlatformEnabled.expectText(
    "Enabled",
  );
  await overrideViewSelectors.textFields.eventDatasetOverride.expectValue(
    "6336ff95ba16ca1c07b4c0db",
  );
  await overrideViewSelectors.textFields.idSyncContainerOverride.expectValue(
    "23512312",
  );
  await overrideViewSelectors.comboBoxes.targetEnabled.expectText("Enabled");
  await overrideViewSelectors.textFields.targetPropertyTokenOverride.expectValue(
    "01dbc634-07c1-d8f9-ca69-b489a5ac5e94",
  );
  await overrideViewSelectors.comboBoxes.analyticsEnabled.expectText("Enabled");
  await overrideViewSelectors.textFields.reportSuiteOverrides[0].expectValue(
    "unifiedjsqeonly2",
  );

  await overrideViewSelectors.envTabs.development.click();
  await overrideViewSelectors.envTabs.development.expectSelected();
  await overrideViewSelectors.comboBoxes.envEnabled.expectText("Enabled");
  await overrideViewSelectors.comboBoxes.experiencePlatformEnabled.expectText(
    "Enabled",
  );
  await overrideViewSelectors.textFields.eventDatasetOverride.expectValue(
    "6336ff95ba16ca1c07b4c0db",
  );
  await overrideViewSelectors.textFields.idSyncContainerOverride.expectValue(
    "23512312",
  );
  await overrideViewSelectors.comboBoxes.targetEnabled.expectText("Enabled");
  await overrideViewSelectors.textFields.targetPropertyTokenOverride.expectValue(
    "01dbc634-07c1-d8f9-ca69-b489a5ac5e94",
  );
  await overrideViewSelectors.comboBoxes.analyticsEnabled.expectText("Enabled");
  await overrideViewSelectors.textFields.reportSuiteOverrides[0].expectValue(
    "unifiedjsqeonly2",
  );
});

test("returns valid settings", async () => {
  await extensionViewController.init({ extensionSettings });

  await instanceNamePicker.selectOption("alloy2");

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

  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettings({
    instanceName: "alloy2",
    edgeConfigOverrides: {
      production: {
        enabled: true,
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
        sandbox: "prod",
        datastreamId: "PR123",
      },
      staging: {
        enabled: true,
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
        sandbox: "prod",
        datastreamId: "PR123",
      },
      development: {
        enabled: true,
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
        sandbox: "prod",
        datastreamId: "PR123",
      },
    },
  });
});

test("defaults to the first instance name", async () => {
  await extensionViewController.init({ extensionSettings });
  await instanceNamePicker.expectSelectedOptionLabel("alloy1");
  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettingsToContain({
    instanceName: "alloy1",
  });
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
  await overrideViewSelectors.sandbox.expectText("PRODUCTION Prod (VA7)");
  await overrideViewSelectors.datastreamIdDropdown.expectExists();
  await overrideViewSelectors.datastreamIdDropdown.selectOption(
    "Test Config Overrides",
  );
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

test("can copy override settings between environments", async () => {
  await extensionViewController.init({ extensionSettings });

  await instanceNamePicker.selectOption("alloy2");

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
  await overrideViewSelectors.copyButtons.production.click();
  await overrideViewSelectors.datastreamIdFreeform.expectValue("PR123");
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
  await overrideViewSelectors.textFields.reportSuiteOverrides[1].expectValue(
    "unifiedjsqeonly3",
  );

  await overrideViewSelectors.envTabs.development.expectExists();
  await overrideViewSelectors.envTabs.development.click();
  await overrideViewSelectors.envTabs.development.expectSelected();
  await overrideViewSelectors.copyButtons.staging.click();
  await overrideViewSelectors.datastreamIdFreeform.expectValue("PR123");
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
  await overrideViewSelectors.textFields.reportSuiteOverrides[1].expectValue(
    "unifiedjsqeonly3",
  );

  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettings({
    instanceName: "alloy2",
    edgeConfigOverrides: {
      production: {
        enabled: true,
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
        sandbox: "prod",
        datastreamId: "PR123",
      },
      staging: {
        enabled: true,
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
        sandbox: "prod",
        datastreamId: "PR123",
      },
      development: {
        enabled: true,
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
        sandbox: "prod",
        datastreamId: "PR123",
      },
    },
  });
});
