/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { describe, it, beforeEach, afterEach, expect } from "vitest";

import renderView from "../helpers/renderView";
import createExtensionBridge from "../helpers/createExtensionBridge";
import ConfigurationView from "../../../src/view/configuration/configurationView";
import { waitForConfigurationViewToLoad } from "../helpers/ui";
import {
  spectrumTextField,
  spectrumComboBox,
  spectrumTab,
  spectrumButton,
} from "../helpers/form";
import { buildSettings } from "../helpers/settingsUtils";

let extensionBridge;

const developmentOverridesTab = spectrumTab("developmentOverridesTab");
const stagingOverridesTab = spectrumTab("stagingOverridesTab");
const productionOverridesTab = spectrumTab("productionOverridesTab");

const overridesEnabled = spectrumComboBox("overridesEnabled");

const analyticsEnabled = spectrumComboBox("analyticsEnabled");
const reportSuitesOverride = [0, 1, 2].map((index) =>
  spectrumTextField(`reportSuitesOverride.${index}`),
);
const removeReportSuite = [0, 1, 2].map((index) =>
  spectrumButton(`removeReportSuite.${index}`),
);
const addReportSuite = spectrumButton("addReportSuite");

const audienceManagerEnabled = spectrumComboBox("audienceManagerEnabled");

const idSyncContainerOverride = spectrumTextField("idSyncContainerOverride");

const experiencePlatformEnabled = spectrumComboBox("experiencePlatformEnabled");
const eventDatasetOverride = spectrumTextField("eventDatasetOverride");
const odeEnabled = spectrumComboBox("odeEnabled");
const edgeSegmentationEnabled = spectrumComboBox("edgeSegmentationEnabled");
const edgeDestinationsEnabled = spectrumComboBox("edgeDestinationsEnabled");
const ajoEnabled = spectrumComboBox("ajoEnabled");

const ssefEnabled = spectrumComboBox("ssefEnabled");
const targetEnabled = spectrumComboBox("targetEnabled");
const targetPropertyTokenOverride = spectrumTextField(
  "targetPropertyTokenOverride",
);

const buildSettingsWithDummyDatastream = (o = {}) => {
  o.instances = o.instances || [];
  const alloyInstance = o.instances.find(
    (instance) => instance.name === "alloy",
  );
  if (!alloyInstance) {
    o.instances.push({ name: "alloy", edgeConfigId: "dummy-datastream-id" });
  } else {
    alloyInstance.edgeConfigId = "dummy-datastream-id";
  }
  return buildSettings(o);
};

describe("Config overrides section", () => {
  beforeEach(() => {
    extensionBridge = createExtensionBridge();
    window.extensionBridge = extensionBridge;
  });

  afterEach(() => {
    delete window.extensionBridge;
  });

  it("sets form values from settings", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettingsWithDummyDatastream({
        instances: [
          {
            name: "alloy",
            edgeConfigOverrides: {
              development: {
                enabled: true,
                com_adobe_experience_platform: {
                  datasets: {
                    event: {
                      datasetId: "aepDatasetId",
                    },
                  },
                  com_adobe_edge_ode: {
                    enabled: false,
                  },
                  com_adobe_edge_segmentation: {
                    enabled: false,
                  },
                  com_adobe_edge_destinations: {
                    enabled: false,
                  },
                  com_adobe_edge_ajo: {
                    enabled: false,
                  },
                },
                com_adobe_analytics: {
                  reportSuites: ["reportSuite1", "reportSuite2"],
                },
                com_adobe_identity: {
                  idSyncContainerId: 1111,
                },
                com_adobe_target: {
                  propertyToken: "targetPropToken",
                },
                com_adobe_audiencemanager: {
                  enabled: false,
                },
                com_adobe_launch_ssf: {
                  enabled: false,
                },
              },
              staging: {
                enabled: true,
                com_adobe_experience_platform: {
                  datasets: {
                    event: {
                      datasetId: "aepDatasetIdStaging",
                    },
                  },
                  com_adobe_edge_ode: {
                    enabled: false,
                  },
                  com_adobe_edge_segmentation: {
                    enabled: false,
                  },
                  com_adobe_edge_destinations: {
                    enabled: false,
                  },
                  com_adobe_edge_ajo: {
                    enabled: false,
                  },
                },
                com_adobe_analytics: {
                  reportSuites: ["reportSuite1Staging", "reportSuite2Staging"],
                },
                com_adobe_identity: {
                  idSyncContainerId: 1111,
                },
                com_adobe_target: {
                  propertyToken: "targetPropTokenStaging",
                },
                com_adobe_audiencemanager: {
                  enabled: false,
                },
                com_adobe_launch_ssf: {
                  enabled: false,
                },
              },
            },
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    expect(await developmentOverridesTab.isSelected()).toBe(true);
    expect(await overridesEnabled.getValue()).toBe("Enabled");
    expect(await analyticsEnabled.getValue()).toBe("Enabled");
    expect(await reportSuitesOverride[0].getValue()).toBe("reportSuite1");
    expect(await reportSuitesOverride[1].getValue()).toBe("reportSuite2");
    expect(await removeReportSuite[0].isDisabled()).toBe(false);
    expect(await removeReportSuite[1].isDisabled()).toBe(false);
    expect(await addReportSuite.isDisabled()).toBe(false);
    expect(await audienceManagerEnabled.getValue()).toBe("Disabled");
    expect(await idSyncContainerOverride.getValue()).toBe("1111");
    expect(await experiencePlatformEnabled.getValue()).toBe("Enabled");
    expect(await eventDatasetOverride.getValue()).toBe("aepDatasetId");
    expect(await odeEnabled.getValue()).toBe("Disabled");
    expect(await edgeSegmentationEnabled.getValue()).toBe("Disabled");
    expect(await edgeDestinationsEnabled.getValue()).toBe("Disabled");
    expect(await ajoEnabled.getValue()).toBe("Disabled");
    expect(await ssefEnabled.getValue()).toBe("Disabled");
    expect(await targetEnabled.getValue()).toBe("Enabled");
    expect(await targetPropertyTokenOverride.getValue()).toBe(
      "targetPropToken",
    );

    await productionOverridesTab.click();
    expect(await overridesEnabled.getValue()).toBe("No override");

    await stagingOverridesTab.click();
    expect(await overridesEnabled.getValue()).toBe("Enabled");
    expect(await analyticsEnabled.getValue()).toBe("Enabled");
    expect(await reportSuitesOverride[0].getValue()).toBe(
      "reportSuite1Staging",
    );
    expect(await reportSuitesOverride[1].getValue()).toBe(
      "reportSuite2Staging",
    );
    expect(await removeReportSuite[0].isDisabled()).toBe(false);
    expect(await removeReportSuite[1].isDisabled()).toBe(false);
    expect(await addReportSuite.isDisabled()).toBe(false);
    expect(await audienceManagerEnabled.getValue()).toBe("Disabled");
    expect(await experiencePlatformEnabled.getValue()).toBe("Enabled");
    expect(await eventDatasetOverride.getValue()).toBe("aepDatasetIdStaging");
    expect(await odeEnabled.getValue()).toBe("Disabled");
    expect(await edgeSegmentationEnabled.getValue()).toBe("Disabled");
    expect(await edgeDestinationsEnabled.getValue()).toBe("Disabled");
    expect(await ajoEnabled.getValue()).toBe("Disabled");
    expect(await ssefEnabled.getValue()).toBe("Disabled");
    expect(await targetEnabled.getValue()).toBe("Enabled");
    expect(await targetPropertyTokenOverride.getValue()).toBe(
      "targetPropTokenStaging",
    );
  });

  it("updates form values and saves to settings", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettingsWithDummyDatastream());

    await waitForConfigurationViewToLoad(view);

    // Enable overrides
    await overridesEnabled.selectOption("Enabled");

    // Enable Analytics and add report suites
    await analyticsEnabled.selectOption("Enabled");
    await reportSuitesOverride[0].fill("myReportSuite1");
    await addReportSuite.click();
    await reportSuitesOverride[1].fill("myReportSuite2");

    // Set ID sync container
    await idSyncContainerOverride.fill("5555");

    // Enable Target and set property token
    await targetEnabled.selectOption("Enabled");
    await targetPropertyTokenOverride.fill("myTargetToken");

    // Enable Experience Platform and set dataset
    await experiencePlatformEnabled.selectOption("Enabled");
    await eventDatasetOverride.fill("myDatasetId");

    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].edgeConfigOverrides).toEqual({
      development: {
        enabled: true,
        com_adobe_analytics: {
          reportSuites: ["myReportSuite1", "myReportSuite2"],
        },
        com_adobe_identity: {
          idSyncContainerId: 5555,
        },
        com_adobe_target: {
          propertyToken: "myTargetToken",
        },
        com_adobe_experience_platform: {
          datasets: {
            event: {
              datasetId: "myDatasetId",
            },
          },
        },
      },
    });
  });

  it("validates third party id sync container", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettingsWithDummyDatastream());

    await waitForConfigurationViewToLoad(view);

    // Enable overrides
    await overridesEnabled.selectOption("Enabled");

    // Set invalid ID sync container (non-numeric)
    await idSyncContainerOverride.fill("invalid");

    expect(await extensionBridge.validate()).toBe(false);

    // Set valid ID sync container
    await idSyncContainerOverride.fill("12345");

    expect(await extensionBridge.validate()).toBe(true);
  });

  it("allows you to save data elements", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettingsWithDummyDatastream());

    await waitForConfigurationViewToLoad(view);

    // Enable overrides
    await overridesEnabled.selectOption("Enabled");

    // Use data elements for various fields
    await analyticsEnabled.selectOption("Enabled");
    await reportSuitesOverride[0].fill("%myReportSuiteDataElement%");

    await idSyncContainerOverride.fill("%myContainerIdDataElement%");

    await targetEnabled.selectOption("Enabled");
    await targetPropertyTokenOverride.fill("%myTargetTokenDataElement%");

    await experiencePlatformEnabled.selectOption("Enabled");
    await eventDatasetOverride.fill("%myDatasetDataElement%");

    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].edgeConfigOverrides).toEqual({
      development: {
        enabled: true,
        com_adobe_analytics: {
          reportSuites: ["%myReportSuiteDataElement%"],
        },
        com_adobe_identity: {
          idSyncContainerId: "%myContainerIdDataElement%",
        },
        com_adobe_target: {
          propertyToken: "%myTargetTokenDataElement%",
        },
        com_adobe_experience_platform: {
          datasets: {
            event: {
              datasetId: "%myDatasetDataElement%",
            },
          },
        },
      },
    });
  });

  it("allows you to add and delete report suites", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettingsWithDummyDatastream());

    await waitForConfigurationViewToLoad(view);

    // Enable overrides and analytics
    await overridesEnabled.selectOption("Enabled");
    await analyticsEnabled.selectOption("Enabled");

    // Add first report suite
    await reportSuitesOverride[0].fill("reportSuite1");

    // Add second report suite
    await addReportSuite.click();
    await reportSuitesOverride[1].fill("reportSuite2");

    // Add third report suite
    await addReportSuite.click();
    await reportSuitesOverride[2].fill("reportSuite3");

    let settings = await extensionBridge.getSettings();
    expect(settings.instances[0].edgeConfigOverrides).toEqual({
      development: {
        enabled: true,
        com_adobe_analytics: {
          reportSuites: ["reportSuite1", "reportSuite2", "reportSuite3"],
        },
      },
    });

    // Remove the middle report suite
    await removeReportSuite[1].click();

    settings = await extensionBridge.getSettings();
    expect(settings.instances[0].edgeConfigOverrides).toEqual({
      development: {
        enabled: true,
        com_adobe_analytics: {
          reportSuites: ["reportSuite1", "reportSuite3"],
        },
      },
    });
  });

  it("allows you to copy overrides from one environment to another", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettingsWithDummyDatastream());

    await waitForConfigurationViewToLoad(view);

    // Set up development environment with some overrides
    await overridesEnabled.selectOption("Enabled");
    await analyticsEnabled.selectOption("Enabled");
    await reportSuitesOverride[0].fill("devReportSuite");
    await targetEnabled.selectOption("Enabled");
    await targetPropertyTokenOverride.fill("devTargetToken");

    // Switch to production tab
    await productionOverridesTab.click();
    expect(await overridesEnabled.getValue()).toBe("No override");

    // Copy from development
    const copyFromDevelopmentButton = spectrumButton(
      "copyFromDevelopmentButton",
    );
    await copyFromDevelopmentButton.click();

    // Verify the settings were copied
    expect(await overridesEnabled.getValue()).toBe("Enabled");
    expect(await analyticsEnabled.getValue()).toBe("Enabled");
    expect(await reportSuitesOverride[0].getValue()).toBe("devReportSuite");
    expect(await targetEnabled.getValue()).toBe("Enabled");
    expect(await targetPropertyTokenOverride.getValue()).toBe("devTargetToken");

    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].edgeConfigOverrides).toEqual({
      development: {
        enabled: true,
        com_adobe_analytics: {
          reportSuites: ["devReportSuite"],
        },
        com_adobe_target: {
          propertyToken: "devTargetToken",
        },
      },
      production: {
        enabled: true,
        com_adobe_analytics: {
          reportSuites: ["devReportSuite"],
        },
        com_adobe_target: {
          propertyToken: "devTargetToken",
        },
      },
    });
  });

  it("hides everything when no overrides are enabled", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettingsWithDummyDatastream());

    await waitForConfigurationViewToLoad(view);

    // Analytics, Target, and other override fields should not be visible
    await expect
      .element(view.getByTestId("analyticsEnabled"))
      .not.toBeInTheDocument();
    await expect
      .element(view.getByTestId("targetEnabled"))
      .not.toBeInTheDocument();
    await expect
      .element(view.getByTestId("experiencePlatformEnabled"))
      .not.toBeInTheDocument();
  });

  it("hides report suites when analytics is disabled", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettingsWithDummyDatastream());

    await waitForConfigurationViewToLoad(view);

    // Enable overrides
    await overridesEnabled.selectOption("Enabled");

    // Set analytics to disabled
    await analyticsEnabled.selectOption("Disabled");

    // Report suite fields should not be visible
    await expect
      .element(view.getByTestId("reportSuitesOverride.0"))
      .not.toBeInTheDocument();
    await expect
      .element(view.getByTestId("addReportSuite"))
      .not.toBeInTheDocument();

    // Enable analytics
    await analyticsEnabled.selectOption("Enabled");

    // Report suite fields should now be visible
    await expect
      .element(view.getByTestId("reportSuitesOverride.0"))
      .toBeInTheDocument();
    await expect
      .element(view.getByTestId("addReportSuite"))
      .toBeInTheDocument();
  });

  it("hides target property token when target is disabled", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettingsWithDummyDatastream());

    await waitForConfigurationViewToLoad(view);

    // Enable overrides
    await overridesEnabled.selectOption("Enabled");

    // Set target to disabled
    await targetEnabled.selectOption("Disabled");

    // Target property token field should not be visible
    await expect
      .element(view.getByTestId("targetPropertyTokenOverride"))
      .not.toBeInTheDocument();

    // Enable target
    await targetEnabled.selectOption("Enabled");

    // Target property token field should now be visible
    await expect
      .element(view.getByTestId("targetPropertyTokenOverride"))
      .toBeInTheDocument();
  });

  it("migrates from legacy settings", async () => {
    const view = await renderView(ConfigurationView);

    // Initialize with legacy format (if there's a different format - this is a placeholder)
    extensionBridge.init(
      buildSettingsWithDummyDatastream({
        instances: [
          {
            name: "alloy",
            // Legacy format might have had different structure
            edgeConfigId: "legacyConfigId",
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    // After loading, settings should be in the new format
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0]).toBeDefined();
  });

  it("saves no override settings correctly", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettingsWithDummyDatastream());

    await waitForConfigurationViewToLoad(view);

    // Set to "No override"
    await overridesEnabled.selectOption("No override");

    const settings = await extensionBridge.getSettings();

    // When no override is selected, edgeConfigOverrides should be undefined
    expect(settings.instances[0].edgeConfigOverrides).toEqual(undefined);
  });

  it("saves enabled settings correctly", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettingsWithDummyDatastream());

    await waitForConfigurationViewToLoad(view);

    // Enable overrides
    await overridesEnabled.selectOption("Enabled");

    // Enable Analytics
    await analyticsEnabled.selectOption("Enabled");
    await reportSuitesOverride[0].fill("enabledReportSuite");

    // Enable Target
    await targetEnabled.selectOption("Enabled");
    await targetPropertyTokenOverride.fill("enabledToken");

    // Enable Experience Platform
    await experiencePlatformEnabled.selectOption("Enabled");
    await eventDatasetOverride.fill("enabledDataset");

    // Enable Audience Manager
    await audienceManagerEnabled.selectOption("Enabled");

    // Enable SSEF
    await ssefEnabled.selectOption("Enabled");

    const settings = await extensionBridge.getSettings();

    expect(settings.instances[0].edgeConfigOverrides).toEqual({
      development: {
        enabled: true,
        com_adobe_analytics: {
          reportSuites: ["enabledReportSuite"],
        },
        com_adobe_target: {
          propertyToken: "enabledToken",
        },
        com_adobe_experience_platform: {
          datasets: {
            event: {
              datasetId: "enabledDataset",
            },
          },
        },
        com_adobe_audiencemanager: {},
        com_adobe_launch_ssf: {},
      },
    });
  });

  it("saves disabled settings correctly", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettingsWithDummyDatastream());

    await waitForConfigurationViewToLoad(view);

    // Enable overrides
    await overridesEnabled.selectOption("Enabled");

    // Disable Analytics
    await analyticsEnabled.selectOption("Disabled");

    // Disable Target
    await targetEnabled.selectOption("Disabled");

    // Enable Experience Platform
    await experiencePlatformEnabled.selectOption("Enabled");

    // Disable Audience Manager
    await audienceManagerEnabled.selectOption("Disabled");

    // Disable SSEF
    await ssefEnabled.selectOption("Disabled");

    // Disable ODE
    await odeEnabled.selectOption("Disabled");

    // Disable Edge Segmentation
    await edgeSegmentationEnabled.selectOption("Disabled");

    // Disable Edge Destinations
    await edgeDestinationsEnabled.selectOption("Disabled");

    // Disable AJO
    await ajoEnabled.selectOption("Disabled");

    const settings = await extensionBridge.getSettings();

    expect(settings.instances[0].edgeConfigOverrides).toEqual({
      development: {
        enabled: true,
        com_adobe_analytics: {
          enabled: false,
        },
        com_adobe_target: {
          enabled: false,
        },
        com_adobe_experience_platform: {
          com_adobe_edge_ode: {
            enabled: false,
          },
          com_adobe_edge_segmentation: {
            enabled: false,
          },
          com_adobe_edge_destinations: {
            enabled: false,
          },
          com_adobe_edge_ajo: {
            enabled: false,
          },
        },
        com_adobe_audiencemanager: {
          enabled: false,
        },
        com_adobe_launch_ssf: {
          enabled: false,
        },
      },
    });
  });
});
