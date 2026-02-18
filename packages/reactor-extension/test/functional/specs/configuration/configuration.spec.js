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
/* eslint-disable vitest/expect-expect */
import { t } from "testcafe";
import extensionViewController from "../../helpers/extensionViewController.mjs";
import createExtensionViewFixture from "../../helpers/createExtensionViewFixture.mjs";
import { addInstanceButton, instances } from "../../helpers/viewSelectors.mjs";
import runCommonExtensionViewTests from "../view/runCommonExtensionViewTests.mjs";
import * as sandboxesMocks from "../../helpers/endpointMocks/sandboxesMocks.mjs";
import * as datastreamsMocks from "../../helpers/endpointMocks/datastreamsMocks.mjs";
import * as datastreamMocks from "../../helpers/endpointMocks/datastreamMocks.mjs";

createExtensionViewFixture({
  title: "Extension Configuration View",
  viewPath: "configuration/configuration.html",
  requiresAdobeIOIntegration: true,
});

const defaultDisabledComponents = {
  eventMerge: false,
};

runCommonExtensionViewTests();

test("is able to add and remove report suites from overrides", async () => {
  await extensionViewController.init();

  await instances[0].overrides.envTabs.development.expectSelected();
  await instances[0].overrides.comboBoxes.envEnabled.clear();
  await instances[0].overrides.comboBoxes.envEnabled.enterSearch("Enabled");

  await instances[0].overrides.textFields.reportSuiteOverrides[0].expectExists();
  await instances[0].overrides.textFields.reportSuiteOverrides[0].typeText(
    "test1",
  );

  await instances[0].overrides.addReportSuiteButton.click();
  await instances[0].overrides.textFields.reportSuiteOverrides[1].expectExists();
  await instances[0].overrides.textFields.reportSuiteOverrides[1].typeText(
    "test2",
  );

  await instances[0].overrides.addReportSuiteButton.click();
  await instances[0].overrides.textFields.reportSuiteOverrides[2].expectExists();
  await instances[0].overrides.textFields.reportSuiteOverrides[2].typeText(
    "test3",
  );

  await instances[0].overrides.removeReportSuitesButtons[1].click();

  await extensionViewController.expectSettings({
    components: defaultDisabledComponents,
    instances: [
      {
        name: "alloy",
        edgeConfigOverrides: {
          development: {
            enabled: true,
            com_adobe_analytics: {
              reportSuites: ["test1", "test3"],
            },
          },
        },
      },
    ],
  });
});

test("copies overrides from one environment to another", async () => {
  await extensionViewController.init();

  await instances[0].overrides.envTabs.development.expectExists();
  await instances[0].overrides.envTabs.development.expectSelected();
  await instances[0].overrides.comboBoxes.envEnabled.clear();
  await instances[0].overrides.comboBoxes.envEnabled.enterSearch("Enabled");
  await instances[0].overrides.copyButtons.development.expectNotExists();
  await instances[0].overrides.copyButtons.staging.expectExists();
  await instances[0].overrides.copyButtons.production.expectExists();
  await instances[0].overrides.textFields.eventDatasetOverride.typeText(
    "6336ff95ba16ca1c07b4c0db",
  );
  await instances[0].overrides.textFields.idSyncContainerOverride.typeText(
    "23512312",
  );
  await instances[0].overrides.textFields.targetPropertyTokenOverride.typeText(
    "01dbc634-07c1-d8f9-ca69-b489a5ac5e94",
  );
  await instances[0].overrides.textFields.reportSuiteOverrides[0].typeText(
    "unifiedjsqeonly2",
  );
  await instances[0].overrides.addReportSuiteButton.click();
  await instances[0].overrides.textFields.reportSuiteOverrides[1].typeText(
    "unifiedjsqeonly3",
  );

  await instances[0].overrides.envTabs.staging.click();
  await instances[0].overrides.envTabs.staging.expectSelected();
  await instances[0].overrides.copyButtons.production.expectExists();
  await instances[0].overrides.copyButtons.staging.expectNotExists();
  await instances[0].overrides.copyButtons.development.expectExists();
  await instances[0].overrides.copyButtons.development.click();

  await instances[0].overrides.textFields.eventDatasetOverride.expectValue(
    "6336ff95ba16ca1c07b4c0db",
  );
  await instances[0].overrides.textFields.idSyncContainerOverride.expectValue(
    "23512312",
  );
  await instances[0].overrides.textFields.targetPropertyTokenOverride.expectValue(
    "01dbc634-07c1-d8f9-ca69-b489a5ac5e94",
  );
  await instances[0].overrides.textFields.reportSuiteOverrides[0].expectValue(
    "unifiedjsqeonly2",
  );
  await instances[0].overrides.textFields.reportSuiteOverrides[1].expectValue(
    "unifiedjsqeonly3",
  );

  await instances[0].overrides.envTabs.production.click();
  await instances[0].overrides.envTabs.production.expectSelected();
  await instances[0].overrides.copyButtons.development.expectExists();
  await instances[0].overrides.copyButtons.staging.expectExists();
  await instances[0].overrides.copyButtons.production.expectNotExists();
  await instances[0].overrides.copyButtons.staging.click();
  await instances[0].overrides.textFields.eventDatasetOverride.expectValue(
    "6336ff95ba16ca1c07b4c0db",
  );
  await instances[0].overrides.textFields.idSyncContainerOverride.expectValue(
    "23512312",
  );
  await instances[0].overrides.textFields.targetPropertyTokenOverride.expectValue(
    "01dbc634-07c1-d8f9-ca69-b489a5ac5e94",
  );
  await instances[0].overrides.textFields.reportSuiteOverrides[0].expectValue(
    "unifiedjsqeonly2",
  );
  await instances[0].overrides.textFields.reportSuiteOverrides[1].expectValue(
    "unifiedjsqeonly3",
  );
});

test.requestHooks(
  sandboxesMocks.singleDefault,
  datastreamsMocks.single,
  datastreamMocks.withConfigOverrides,
)("populates overrides dropdowns with Blackbird config data", async () => {
  await extensionViewController.init();

  await instances[0].nameField.expectValue("alloy");
  await instances[0].edgeConfig.inputMethodSelectRadio.expectChecked();
  await instances[0].edgeConfig.inputMethodFreeformRadio.expectUnchecked();
  await instances[0].edgeConfig.inputMethodSelect.production.sandboxField.expectDisabled();
  await instances[0].edgeConfig.inputMethodSelect.production.datastreamField.selectOption(
    "Test Config Overrides",
  );
  await instances[0].edgeConfig.inputMethodSelect.staging.datastreamField.selectOption(
    "Test Config Overrides",
  );
  await instances[0].edgeConfig.inputMethodSelect.development.datastreamField.selectOption(
    "Test Config Overrides",
  );

  await instances[0].overrides.comboBoxes.envEnabled.clear();
  await instances[0].overrides.comboBoxes.envEnabled.enterSearch("Enabled");
  await instances[0].overrides.comboBoxes.eventDatasetOverride.expectExists();
  await instances[0].overrides.comboBoxes.eventDatasetOverride.openMenu();
  await instances[0].overrides.comboBoxes.eventDatasetOverride.expectMenuOptionLabels(
    ["6335faf30f5a161c0b4b1444"],
  );
  await instances[0].overrides.comboBoxes.eventDatasetOverride.selectMenuOption(
    "6335faf30f5a161c0b4b1444",
  );

  await instances[0].overrides.comboBoxes.idSyncContainerOverride.expectExists();
  await instances[0].overrides.comboBoxes.idSyncContainerOverride.openMenu();
  await instances[0].overrides.comboBoxes.idSyncContainerOverride.expectMenuOptionLabels(
    ["107756", "107757"],
  );
  await instances[0].overrides.comboBoxes.idSyncContainerOverride.selectMenuOption(
    "107756",
  );

  await instances[0].overrides.comboBoxes.targetPropertyTokenOverride.expectExists();
  await instances[0].overrides.comboBoxes.targetPropertyTokenOverride.openMenu();
  await instances[0].overrides.comboBoxes.targetPropertyTokenOverride.expectMenuOptionLabels(
    [
      "aba5431a-9f59-f816-7d73-8e40c8f4c4fd",
      "65d186ff-be14-dfa0-75fa-546d93bebf91",
    ],
  );
  await instances[0].overrides.comboBoxes.targetPropertyTokenOverride.selectMenuOption(
    "aba5431a-9f59-f816-7d73-8e40c8f4c4fd",
  );

  await instances[0].overrides.comboBoxes.reportSuiteOverrides[0].expectExists();
  await instances[0].overrides.comboBoxes.reportSuiteOverrides[0].openMenu();
  await instances[0].overrides.comboBoxes.reportSuiteOverrides[0].expectMenuOptionLabels(
    ["unifiedjsqeonly2", "unifiedjsqeonlylatest", "unifiedjsqeonlymobileweb"],
  );
  await instances[0].overrides.comboBoxes.reportSuiteOverrides[0].selectMenuOption(
    "unifiedjsqeonlylatest",
  );

  await extensionViewController.expectIsValid();
});

test.requestHooks(
  sandboxesMocks.singleDefault,
  datastreamsMocks.single,
  datastreamMocks.withConfigOverrides,
)(
  "shows an error for custom overrides that are not in the dropdown",
  async () => {
    await extensionViewController.init();

    await instances[0].nameField.expectValue("alloy");
    await instances[0].edgeConfig.inputMethodSelectRadio.expectChecked();
    await instances[0].edgeConfig.inputMethodFreeformRadio.expectUnchecked();
    await instances[0].edgeConfig.inputMethodSelect.production.sandboxField.expectDisabled();
    await instances[0].edgeConfig.inputMethodSelect.production.datastreamField.selectOption(
      "Test Config Overrides",
    );
    await instances[0].edgeConfig.inputMethodSelect.staging.datastreamField.selectOption(
      "Test Config Overrides",
    );
    await instances[0].edgeConfig.inputMethodSelect.development.datastreamField.selectOption(
      "Test Config Overrides",
    );

    await instances[0].overrides.comboBoxes.envEnabled.clear();
    await instances[0].overrides.comboBoxes.envEnabled.enterSearch("Enabled");
    await instances[0].overrides.comboBoxes.eventDatasetOverride.expectExists();
    await instances[0].overrides.comboBoxes.eventDatasetOverride.enterSearch(
      "foo",
    );
    // unblur/deselect the input to trigger validation
    await t.pressKey("tab");
    await instances[0].overrides.comboBoxes.eventDatasetOverride.expectError();
    await instances[0].overrides.comboBoxes.eventDatasetOverride.clear();
    await t.pressKey("tab");
    await instances[0].overrides.comboBoxes.eventDatasetOverride.expectNoError();

    await instances[0].overrides.comboBoxes.idSyncContainerOverride.expectExists();
    await instances[0].overrides.comboBoxes.idSyncContainerOverride.enterSearch(
      "adobe",
    );
    await t.pressKey("tab");
    await instances[0].overrides.comboBoxes.idSyncContainerOverride.expectError();
    await instances[0].overrides.comboBoxes.idSyncContainerOverride.clear();
    await t.pressKey("tab");
    await instances[0].overrides.comboBoxes.idSyncContainerOverride.expectNoError();

    await instances[0].overrides.comboBoxes.targetPropertyTokenOverride.expectExists();
    await instances[0].overrides.comboBoxes.targetPropertyTokenOverride.enterSearch(
      "alloy",
    );
    await t.pressKey("tab");
    await instances[0].overrides.comboBoxes.targetPropertyTokenOverride.expectError();
    await instances[0].overrides.comboBoxes.targetPropertyTokenOverride.clear();
    await t.pressKey("tab");
    await instances[0].overrides.comboBoxes.targetPropertyTokenOverride.expectNoError();

    await instances[0].overrides.comboBoxes.reportSuiteOverrides[0].expectExists();
    await instances[0].overrides.comboBoxes.reportSuiteOverrides[0].enterSearch(
      "functional test",
    );
    await t.pressKey("tab");
    await instances[0].overrides.comboBoxes.reportSuiteOverrides[0].expectError();
    await instances[0].overrides.comboBoxes.reportSuiteOverrides[0].clear();
    await t.pressKey("tab");
    await instances[0].overrides.comboBoxes.reportSuiteOverrides[0].expectNoError();
    // make sure that comma-separated lists are validated correctly.
    await instances[0].overrides.comboBoxes.reportSuiteOverrides[0].enterSearch(
      "unifiedjsqeonly2,unifiedjsqeonlylatest",
    );
    await t.pressKey("tab");
    await instances[0].overrides.comboBoxes.reportSuiteOverrides[0].expectNoError();
  },
);

test.requestHooks(
  sandboxesMocks.singleDefault,
  datastreamsMocks.single,
  datastreamMocks.withConfigOverrides,
)("does not show an error for overrides that are data elements", async () => {
  await extensionViewController.init();

  await instances[0].nameField.expectValue("alloy");
  await instances[0].edgeConfig.inputMethodSelectRadio.expectChecked();
  await instances[0].edgeConfig.inputMethodFreeformRadio.expectUnchecked();
  await instances[0].edgeConfig.inputMethodSelect.production.sandboxField.expectDisabled();
  await instances[0].edgeConfig.inputMethodSelect.production.datastreamField.selectOption(
    "Test Config Overrides",
  );
  await instances[0].edgeConfig.inputMethodSelect.staging.datastreamField.selectOption(
    "Test Config Overrides",
  );
  await instances[0].edgeConfig.inputMethodSelect.development.datastreamField.selectOption(
    "Test Config Overrides",
  );

  await instances[0].overrides.comboBoxes.envEnabled.clear();
  await instances[0].overrides.comboBoxes.envEnabled.enterSearch("Enabled");
  await instances[0].overrides.comboBoxes.eventDatasetOverride.expectExists();
  await instances[0].overrides.comboBoxes.eventDatasetOverride.enterSearch(
    "%Alloy Data Element%",
  );
  // unblur/deselect the input to trigger validation
  await t.pressKey("tab");
  await instances[0].overrides.comboBoxes.eventDatasetOverride.expectNoError();

  await instances[0].overrides.comboBoxes.idSyncContainerOverride.expectExists();
  await instances[0].overrides.comboBoxes.idSyncContainerOverride.enterSearch(
    "%Alloy Data Element%",
  );
  await t.pressKey("tab");
  await instances[0].overrides.comboBoxes.idSyncContainerOverride.expectNoError();

  await instances[0].overrides.comboBoxes.targetPropertyTokenOverride.expectExists();
  await instances[0].overrides.comboBoxes.targetPropertyTokenOverride.enterSearch(
    "%Alloy Data Element%",
  );
  await t.pressKey("tab");
  await instances[0].overrides.comboBoxes.targetPropertyTokenOverride.expectNoError();

  await instances[0].overrides.comboBoxes.reportSuiteOverrides[0].expectExists();
  await instances[0].overrides.comboBoxes.reportSuiteOverrides[0].enterSearch(
    "unifiedjsqeonly2, %Alloy Data Element%",
  );
  await t.pressKey("tab");
  await instances[0].overrides.comboBoxes.reportSuiteOverrides[0].expectNoError();
});

test.requestHooks(
  sandboxesMocks.singleDefault,
  datastreamsMocks.single,
  datastreamMocks.withConfigOverrides,
)(
  "does not populate override dropdowns after switching instances (because of different orgIDs)",
  async () => {
    await extensionViewController.init();

    await instances[0].nameField.expectValue("alloy");
    await instances[0].edgeConfig.inputMethodSelectRadio.expectChecked();
    await instances[0].edgeConfig.inputMethodFreeformRadio.expectUnchecked();
    await instances[0].edgeConfig.inputMethodSelect.development.datastreamField.selectOption(
      "Test Config Overrides",
    );
    await instances[0].edgeConfig.inputMethodSelect.production.sandboxField.expectDisabled();
    await instances[0].edgeConfig.inputMethodSelect.production.datastreamField.expectExists();
    await instances[0].overrides.comboBoxes.envEnabled.clear();
    await instances[0].overrides.comboBoxes.envEnabled.enterSearch("Enabled");
    await instances[0].overrides.comboBoxes.eventDatasetOverride.expectExists();
    await instances[0].overrides.comboBoxes.eventDatasetOverride.expectIsComboBox();
    await instances[0].overrides.comboBoxes.idSyncContainerOverride.expectExists();
    await instances[0].overrides.comboBoxes.idSyncContainerOverride.expectIsComboBox();
    await instances[0].overrides.comboBoxes.targetPropertyTokenOverride.expectExists();
    await instances[0].overrides.comboBoxes.targetPropertyTokenOverride.expectIsComboBox();
    await instances[0].overrides.comboBoxes.reportSuiteOverrides[0].expectExists();
    await instances[0].overrides.comboBoxes.reportSuiteOverrides[0].expectIsComboBox();

    await addInstanceButton.click();
    await instances[0].overrides.comboBoxes.envEnabled.clear();
    await instances[0].overrides.comboBoxes.envEnabled.enterSearch("Enabled");
    await instances[1].overrides.textFields.eventDatasetOverride.expectExists();
    await instances[1].overrides.textFields.eventDatasetOverride.expectIsTextField();
    await instances[1].overrides.textFields.idSyncContainerOverride.expectExists();
    await instances[1].overrides.textFields.idSyncContainerOverride.expectIsTextField();
    await instances[1].overrides.textFields.targetPropertyTokenOverride.expectExists();
    await instances[1].overrides.textFields.targetPropertyTokenOverride.expectIsTextField();
    await instances[1].overrides.textFields.reportSuiteOverrides[0].expectExists();
    await instances[1].overrides.textFields.reportSuiteOverrides[0].expectIsTextField();
  },
);

test("allows the setting of overrides in only a single environment", async () => {
  await extensionViewController.init();
  await instances[0].edgeConfig.inputMethodFreeformRadio.click();
  await instances[0].edgeConfig.inputMethodFreeform.productionEnvironmentField.typeText(
    "PR123",
  );
  await instances[0].overrides.envTabs.development.click();

  await instances[0].overrides.comboBoxes.envEnabled.clear();
  await instances[0].overrides.comboBoxes.envEnabled.enterSearch("Enabled");
  await instances[0].overrides.textFields.eventDatasetOverride.typeText(
    "6336ff95ba16ca1c07b4c0db",
  );
  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettings({
    components: defaultDisabledComponents,
    instances: [
      {
        edgeConfigId: "PR123",
        name: "alloy",
        edgeConfigOverrides: {
          development: {
            enabled: true,
            com_adobe_experience_platform: {
              datasets: {
                event: {
                  datasetId: "6336ff95ba16ca1c07b4c0db",
                },
              },
            },
          },
        },
      },
    ],
  });
});

test("allows the load of the view with overrides settings in only a single environment", async () => {
  await extensionViewController.init({
    settings: {
      components: {
        eventMerge: false,
      },
      instances: [
        {
          name: "alloy1",
          edgeConfigId: "PR123",
          edgeConfigOverrides: {
            development: {
              enabled: true,
              com_adobe_experience_platform: {
                datasets: {
                  event: {
                    datasetId: "6336ff95ba16ca1c07b4c0db",
                  },
                },
              },
            },
          },
        },
      ],
    },
  });

  await instances[0].overrides.envTabs.development.expectExists();
});
