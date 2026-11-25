/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { describe, it, beforeEach, afterEach, expect } from "vitest";

import useView from "../helpers/useView";
import ConfigurationView from "../../../src/view/configuration/configurationView";
import field from "../helpers/field";
import {
  configOverridesInstance,
  mockConfigOverridesDatastream,
  selectBlackbirdOverrides,
  selectEnvironmentTab,
} from "../helpers/actions/configOverrides";

const DATASTREAM_TITLE = "Test Config Overrides";

let view;
let driver;
let cleanup;

const get = (testId) => field(view.getByTestId(testId));

const selectDatastreamInEveryEnvironment = async () => {
  await get("productionDatastreamField").selectOption(DATASTREAM_TITLE);
  await get("stagingDatastreamField").selectOption(DATASTREAM_TITLE);
  await get("developmentDatastreamField").selectOption(DATASTREAM_TITLE);
};

const overrideFieldTestIds = [
  "eventDatasetOverride",
  "idSyncContainerOverride",
  "targetPropertyTokenOverride",
  "reportSuitesOverride.0",
];

const enableAllOverrideServices = async () => {
  await selectEnvironmentTab(view, "production");
  await get("overridesEnabled").selectOption("Enabled");
  await get("experiencePlatformEnabled").selectOption("Enabled");
  await get("targetEnabled").selectOption("Enabled");
  await get("analyticsEnabled").selectOption("Enabled");
};

const expectPreconfiguredComboboxes = async () => {
  for (const testId of overrideFieldTestIds) {
    // eslint-disable-next-line no-await-in-loop
    await expect
      .element(view.getByTestId(testId).getByRole("combobox"))
      .toBeVisible();
  }
};

const everyEnvironment = {
  edgeConfigId: configOverridesInstance.edgeConfigId,
  sandbox: "prod",
  stagingEdgeConfigId: configOverridesInstance.edgeConfigId,
  stagingSandbox: "prod",
  developmentEdgeConfigId: configOverridesInstance.edgeConfigId,
  developmentSandbox: "prod",
};

describe("Config overrides with a datastream that has preconfigured choices", () => {
  beforeEach(async () => {
    mockConfigOverridesDatastream();
    ({ view, driver, cleanup } = await useView(ConfigurationView));
    await driver.init();
    await selectDatastreamInEveryEnvironment();
  });

  afterEach(() => {
    cleanup();
  });

  it("populates overrides dropdowns with Blackbird config data", async () => {
    await selectEnvironmentTab(view, "production");
    await get("overridesEnabled").selectOption("Enabled");
    await get("experiencePlatformEnabled").expectVisible();

    const expectedOverrides = await selectBlackbirdOverrides(view);

    await driver.expectValidate().toBe(true);
    await driver
      .expectSettings((settings) => settings.instances[0])
      .toMatchObject({
        edgeConfigId: configOverridesInstance.edgeConfigId,
        sandbox: "prod",
        edgeConfigOverrides: { production: expectedOverrides },
      });
  }, 60_000);

  it("shows an error for custom overrides that are not in the dropdown", async () => {
    await enableAllOverrideServices();
    await expectPreconfiguredComboboxes();

    for (const [testId, value, message] of [
      [
        "eventDatasetOverride",
        "foo",
        /must be one of the preconfigured datasets/i,
      ],
      ["idSyncContainerOverride", "adobe", /must positive, whole number/i],
      [
        "idSyncContainerOverride",
        "107758",
        /must be one of the preconfigured ID sync containers/i,
      ],
      [
        "targetPropertyTokenOverride",
        "alloy",
        /must be one of the preconfigured property tokens/i,
      ],
      [
        "reportSuitesOverride.0",
        "functional test",
        /must be one of the preconfigured report suites/i,
      ],
    ]) {
      // eslint-disable-next-line no-await-in-loop
      await get(testId).fill(value);
      // eslint-disable-next-line no-await-in-loop
      await get(testId).expectError(message);
      // eslint-disable-next-line no-await-in-loop
      await get(testId).clear();
      // eslint-disable-next-line no-await-in-loop
      await get(testId).expectNotInvalid();
    }

    await get("reportSuitesOverride.0").fill(
      "unifiedjsqeonly2,unifiedjsqeonlylatest",
    );
    await get("reportSuitesOverride.0").expectNotInvalid();
  }, 60_000);

  it("does not show an error for overrides that are data elements", async () => {
    await enableAllOverrideServices();
    await expectPreconfiguredComboboxes();

    await get("eventDatasetOverride").fill("%Alloy Data Element%");
    await get("idSyncContainerOverride").fill("%Alloy Data Element%");
    await get("targetPropertyTokenOverride").fill("%Alloy Data Element%");
    await get("reportSuitesOverride.0").fill(
      "unifiedjsqeonly2, %Alloy Data Element%",
    );

    for (const testId of overrideFieldTestIds) {
      // eslint-disable-next-line no-await-in-loop
      await get(testId).expectNotInvalid();
    }
    await driver.expectValidate().toBe(true);
  }, 60_000);
});

describe("Config overrides for an instance of another org", () => {
  beforeEach(async () => {
    mockConfigOverridesDatastream();
    ({ view, driver, cleanup } = await useView(ConfigurationView));
  });

  afterEach(() => {
    cleanup();
  });

  it("does not populate override dropdowns after switching instances (because of different orgIDs)", async () => {
    await driver.init({
      settings: {
        instances: [
          { ...configOverridesInstance, ...everyEnvironment },
          { name: "alloy2", orgId: "OTHER@AdobeOrg", ...everyEnvironment },
        ],
      },
    });
    await field(
      view.getByRole("button", { name: "Refresh datastreams" }).first(),
    ).expectEnabled();

    await selectEnvironmentTab(view, "development");
    await get("overridesEnabled").selectOption("Enabled");
    await get("experiencePlatformEnabled").selectOption("Enabled");
    await get("targetEnabled").selectOption("Enabled");
    await get("analyticsEnabled").selectOption("Enabled");
    for (const testId of overrideFieldTestIds) {
      // eslint-disable-next-line no-await-in-loop
      await expect
        .element(view.getByTestId(testId).getByRole("combobox"))
        .toBeVisible();
    }

    await view.getByRole("tab", { name: "alloy2" }).click();
    await selectEnvironmentTab(view, "development");
    await get("overridesEnabled").selectOption("Enabled");
    await get("experiencePlatformEnabled").selectOption("Enabled");
    await get("targetEnabled").selectOption("Enabled");
    await get("analyticsEnabled").selectOption("Enabled");
    for (const testId of overrideFieldTestIds) {
      // eslint-disable-next-line no-await-in-loop
      await expect
        .element(view.getByTestId(testId).getByRole("textbox"))
        .toBeVisible();
      // eslint-disable-next-line no-await-in-loop
      await expect
        .element(view.getByTestId(testId).getByRole("combobox"))
        .not.toBeInTheDocument();
    }
  }, 60_000);
});
