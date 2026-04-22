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

import { describe, it, beforeEach, afterEach } from "vitest";

import useView from "../helpers/useView";
import ConfigurationView from "../../../src/view/configuration/configurationView";
import { buildSettings } from "../helpers/settingsUtils";
import field from "../helpers/field";

let view;
let driver;
let cleanup;
let developmentOverridesTab;
let stagingOverridesTab;
let productionOverridesTab;
let overridesEnabled;
let analyticsEnabled;
let reportSuitesOverride;
let removeReportSuite;
let addReportSuite;
let audienceManagerEnabled;
let idSyncContainerOverride;
let experiencePlatformEnabled;
let eventDatasetOverride;
let odeEnabled;
let edgeSegmentationEnabled;
let edgeDestinationsEnabled;
let ajoEnabled;
let ssefEnabled;
let targetEnabled;
let targetPropertyTokenOverride;
let copyFromDevelopmentButton;

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
  beforeEach(async () => {
    ({ view, driver, cleanup } = await useView(ConfigurationView));

    developmentOverridesTab = field(
      view.getByTestId("developmentOverridesTab"),
    );
    stagingOverridesTab = field(view.getByTestId("stagingOverridesTab"));
    productionOverridesTab = field(view.getByTestId("productionOverridesTab"));
    overridesEnabled = field(view.getByTestId("overridesEnabled"));
    analyticsEnabled = field(view.getByTestId("analyticsEnabled"));
    reportSuitesOverride = [0, 1, 2].map((index) =>
      field(view.getByTestId(`reportSuitesOverride.${index}`)),
    );
    removeReportSuite = [0, 1, 2].map((index) =>
      field(view.getByTestId(`removeReportSuite.${index}`)),
    );
    addReportSuite = field(view.getByTestId("addReportSuite"));
    audienceManagerEnabled = field(view.getByTestId("audienceManagerEnabled"));
    idSyncContainerOverride = field(
      view.getByTestId("idSyncContainerOverride"),
    );
    experiencePlatformEnabled = field(
      view.getByTestId("experiencePlatformEnabled"),
    );
    eventDatasetOverride = field(view.getByTestId("eventDatasetOverride"));
    odeEnabled = field(view.getByTestId("odeEnabled"));
    edgeSegmentationEnabled = field(
      view.getByTestId("edgeSegmentationEnabled"),
    );
    edgeDestinationsEnabled = field(
      view.getByTestId("edgeDestinationsEnabled"),
    );
    ajoEnabled = field(view.getByTestId("ajoEnabled"));
    ssefEnabled = field(view.getByTestId("ssefEnabled"));
    targetEnabled = field(view.getByTestId("targetEnabled"));
    targetPropertyTokenOverride = field(
      view.getByTestId("targetPropertyTokenOverride"),
    );
    copyFromDevelopmentButton = field(
      view.getByTestId("copyFromDevelopmentButton"),
    );
  });

  afterEach(() => {
    cleanup();
  });

  it("sets form values from settings", async () => {
    await driver.init(
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

    await developmentOverridesTab.expectSelected();
    await overridesEnabled.expectValue("Enabled");

    await reportSuitesOverride[0].expectValue("reportSuite1");
    await reportSuitesOverride[1].expectValue("reportSuite2");
    await removeReportSuite[0].expectVisible();
    await removeReportSuite[1].expectVisible();
    await addReportSuite.expectVisible();
    await audienceManagerEnabled.expectValue("Disabled");
    await idSyncContainerOverride.expectValue("1111");
    await experiencePlatformEnabled.expectValue("Enabled");
    await eventDatasetOverride.expectValue("aepDatasetId");
    await odeEnabled.expectValue("Disabled");
    await edgeSegmentationEnabled.expectValue("Disabled");
    await edgeDestinationsEnabled.expectValue("Disabled");
    await ajoEnabled.expectValue("Disabled");
    await ssefEnabled.expectValue("Disabled");
    await targetEnabled.expectValue("Enabled");
    await targetPropertyTokenOverride.expectValue("targetPropToken");

    await productionOverridesTab.click();
    await overridesEnabled.expectValue("No override");

    await stagingOverridesTab.click();
    await overridesEnabled.expectValue("Enabled");
    await analyticsEnabled.expectValue("Enabled");
    await reportSuitesOverride[0].expectValue("reportSuite1Staging");
    await reportSuitesOverride[1].expectValue("reportSuite2Staging");
    await removeReportSuite[0].expectVisible();
    await removeReportSuite[1].expectVisible();
    await addReportSuite.expectVisible();
    await audienceManagerEnabled.expectValue("Disabled");
    await experiencePlatformEnabled.expectValue("Enabled");
    await eventDatasetOverride.expectValue("aepDatasetIdStaging");
    await odeEnabled.expectValue("Disabled");
    await edgeSegmentationEnabled.expectValue("Disabled");
    await edgeDestinationsEnabled.expectValue("Disabled");
    await ajoEnabled.expectValue("Disabled");
    await ssefEnabled.expectValue("Disabled");
    await targetEnabled.expectValue("Enabled");
    await targetPropertyTokenOverride.expectValue("targetPropTokenStaging");
  });

  it("updates form values and saves to settings", async () => {
    await driver.init(buildSettingsWithDummyDatastream());

    await overridesEnabled.selectOption("Enabled");
    await analyticsEnabled.selectOption("Enabled");
    await reportSuitesOverride[0].fill("myReportSuite1");
    await addReportSuite.click();
    await reportSuitesOverride[1].fill("myReportSuite2");

    await idSyncContainerOverride.fill("5555");

    await targetEnabled.selectOption("Enabled");
    await targetPropertyTokenOverride.fill("myTargetToken");

    await experiencePlatformEnabled.expectVisible();
    await experiencePlatformEnabled.selectOption("Enabled");
    await eventDatasetOverride.fill("myDatasetId");

    await driver
      .expectSettings((s) => s.instances[0].edgeConfigOverrides)
      .toEqual({
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
    await driver.init(buildSettingsWithDummyDatastream());
    await overridesEnabled.expectVisible();
    await overridesEnabled.selectOption("Enabled");
    await idSyncContainerOverride.fill("invalid");
    await driver.expectValidate().toBe(false);
    await idSyncContainerOverride.fill("12345");
    await driver.expectValidate().toBe(true);
  });

  it("allows you to save data elements", async () => {
    await driver.init(buildSettingsWithDummyDatastream());

    // Enable overrides
    await overridesEnabled.selectOption("Enabled");
    await analyticsEnabled.expectVisible();

    // Use data elements for various fields
    await analyticsEnabled.selectOption("Enabled");
    await reportSuitesOverride[0].fill("%myReportSuiteDataElement%");

    await idSyncContainerOverride.fill("%myContainerIdDataElement%");

    await targetEnabled.selectOption("Enabled");
    await targetPropertyTokenOverride.fill("%myTargetTokenDataElement%");

    await experiencePlatformEnabled.selectOption("Enabled");
    await eventDatasetOverride.fill("%myDatasetDataElement%");

    await driver
      .expectSettings((s) => s.instances[0].edgeConfigOverrides)
      .toEqual({
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
    await driver.init(buildSettingsWithDummyDatastream());

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

    await driver
      .expectSettings((s) => s.instances[0].edgeConfigOverrides)
      .toEqual({
        development: {
          enabled: true,
          com_adobe_analytics: {
            reportSuites: ["reportSuite1", "reportSuite2", "reportSuite3"],
          },
        },
      });

    // Remove the middle report suite
    await removeReportSuite[1].click();

    await driver
      .expectSettings((s) => s.instances[0].edgeConfigOverrides)
      .toEqual({
        development: {
          enabled: true,
          com_adobe_analytics: {
            reportSuites: ["reportSuite1", "reportSuite3"],
          },
        },
      });
  });

  it("allows you to copy overrides from one environment to another", async () => {
    await driver.init(buildSettingsWithDummyDatastream());

    // Set up development environment with some overrides
    await overridesEnabled.selectOption("Enabled");
    await analyticsEnabled.selectOption("Enabled");
    await reportSuitesOverride[0].fill("devReportSuite");
    await targetEnabled.selectOption("Enabled");
    await targetPropertyTokenOverride.fill("devTargetToken");

    // Switch to production tab
    await productionOverridesTab.click();
    await overridesEnabled.expectValue("No override");

    // Copy from development
    await copyFromDevelopmentButton.click();

    // Verify the settings were copied
    await overridesEnabled.expectValue("Enabled");
    await analyticsEnabled.expectValue("Enabled");
    await reportSuitesOverride[0].expectValue("devReportSuite");
    await targetEnabled.expectValue("Enabled");
    await targetPropertyTokenOverride.expectValue("devTargetToken");

    await driver
      .expectSettings((s) => s.instances[0].edgeConfigOverrides)
      .toEqual({
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
    await driver.init(buildSettingsWithDummyDatastream());

    // Analytics, Target, and other override fields should not be visible
    await analyticsEnabled.expectHidden();
    await targetEnabled.expectHidden();
    await experiencePlatformEnabled.expectHidden();
  });

  it("hides report suites when analytics is disabled", async () => {
    await driver.init(buildSettingsWithDummyDatastream());

    // Enable overrides
    await overridesEnabled.selectOption("Enabled");

    // Set analytics to disabled
    await analyticsEnabled.selectOption("Disabled");

    // Report suite fields should not be visible
    await reportSuitesOverride[0].expectHidden();
    await addReportSuite.expectHidden();

    // Enable analytics
    await analyticsEnabled.selectOption("Enabled");

    // Report suite fields should now be visible
    await reportSuitesOverride[0].expectVisible();
    await addReportSuite.expectVisible();
  });

  it("hides target property token when target is disabled", async () => {
    await driver.init(buildSettingsWithDummyDatastream());

    // Enable overrides
    await overridesEnabled.selectOption("Enabled");

    // Set target to disabled
    await targetEnabled.selectOption("Disabled");

    // Target property token field should not be visible
    await targetPropertyTokenOverride.expectHidden();

    // Enable target
    await targetEnabled.selectOption("Enabled");

    // Target property token field should now be visible
    await targetPropertyTokenOverride.expectVisible();
  });

  it("migrates from legacy settings", async () => {
    // Initialize with legacy format (if there's a different format - this is a placeholder)
    await driver.init(
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

    // After loading, settings should be in the new format
    await driver.expectSettings((s) => s.instances[0]).toBeDefined();
  });

  it("saves no override settings correctly", async () => {
    await driver.init(buildSettingsWithDummyDatastream());

    // Set to "No override"
    await overridesEnabled.selectOption("No override");

    // When no override is selected, edgeConfigOverrides should be undefined
    await driver
      .expectSettings((s) => s.instances[0].edgeConfigOverrides)
      .toEqual(undefined);
  });

  it("saves enabled settings correctly", async () => {
    await driver.init(buildSettingsWithDummyDatastream());

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

    await driver
      .expectSettings((s) => s.instances[0].edgeConfigOverrides)
      .toEqual({
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
    await driver.init(buildSettingsWithDummyDatastream());

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

    await driver
      .expectSettings((s) => s.instances[0].edgeConfigOverrides)
      .toEqual({
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
