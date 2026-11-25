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

import { afterEach, beforeEach, describe, it, vi } from "vitest";
import useView from "../helpers/useView";
import loadEntryView from "../helpers/entryView";
import field from "../helpers/field";
import { LONG_TEST_TIMEOUT } from "../helpers/actions/fixtures";
import {
  CONFIG_OVERRIDES_DATASTREAM_ID,
  buildEdgeConfigOverrides,
  configOverridesInstance,
  copyEnvironmentOverrides,
  enableProductionOverrides,
  expectAllEnvironmentOverrides,
  expectEnvironmentOverrides,
  mockConfigOverridesDatastream,
  selectBlackbirdOverrides,
  typeAllEnvironmentOverrides,
  typeEnvironmentOverrides,
  typedOverrideValues,
} from "../helpers/actions/configOverrides";

vi.mock("../../../src/view/render", async () => ({
  default: (await import("../helpers/entryView")).captureRender,
}));
const View = await loadEntryView(
  () => import("../../../src/view/actions/redirectWithIdentity"),
);

const extensionSettings = {
  instances: [{ name: "alloy1" }, { name: "alloy2" }],
};

describe("Redirect with identity action", () => {
  let view;
  let driver;
  let cleanup;
  let instanceNamePicker;

  beforeEach(async () => {
    ({ view, driver, cleanup } = await useView(View));
    instanceNamePicker = field(view.getByTestId("instanceNamePicker"));
  });

  afterEach(() => cleanup());

  it(
    "initializes form fields with settings",
    async () => {
      await driver.init({
        extensionSettings,
        settings: {
          instanceName: "alloy2",
          edgeConfigOverrides: buildEdgeConfigOverrides(typedOverrideValues, {
            withEnabled: false,
          }),
        },
      });

      await instanceNamePicker.expectValue("alloy2");
      await expectAllEnvironmentOverrides(view, typedOverrideValues);
      await driver.expectValidate().toBe(true);
    },
    LONG_TEST_TIMEOUT,
  );

  it(
    "returns valid settings",
    async () => {
      await driver.init({ extensionSettings, settings: null });

      await instanceNamePicker.selectOption("alloy2");
      await typeAllEnvironmentOverrides(view, typedOverrideValues);

      await driver.expectValidate().toBe(true);
      await driver.expectSettings().toEqual({
        instanceName: "alloy2",
        edgeConfigOverrides: buildEdgeConfigOverrides(typedOverrideValues),
      });
    },
    LONG_TEST_TIMEOUT,
  );

  it("defaults to the first instance name", async () => {
    await driver.init({ extensionSettings, settings: null });

    await instanceNamePicker.expectValue("alloy1");
    await driver.expectValidate().toBe(true);
    await driver.expectSettings().toEqual({ instanceName: "alloy1" });
  });

  it(
    "populates overrides dropdowns with Blackbird config data",
    async () => {
      mockConfigOverridesDatastream();
      await driver.init({
        extensionSettings: { instances: [configOverridesInstance] },
        settings: null,
      });

      await enableProductionOverrides(view);
      await field(view.getByTestId("datastreamId")).selectOption(
        "Test Config Overrides",
      );
      const expectedOverrides = await selectBlackbirdOverrides(view);

      await driver.expectValidate().toBe(true);
      await driver.expectSettings().toEqual({
        instanceName: "alloy",
        edgeConfigOverrides: {
          production: {
            ...expectedOverrides,
            datastreamId: CONFIG_OVERRIDES_DATASTREAM_ID,
            sandbox: "prod",
          },
        },
      });
    },
    LONG_TEST_TIMEOUT,
  );

  it(
    "can copy override settings between environments",
    async () => {
      await driver.init({ extensionSettings, settings: null });
      await instanceNamePicker.selectOption("alloy2");
      await typeEnvironmentOverrides(view, "production", typedOverrideValues);

      await copyEnvironmentOverrides(view, "production", "staging");
      await expectEnvironmentOverrides(view, "staging", typedOverrideValues);
      await copyEnvironmentOverrides(view, "staging", "development");
      await expectEnvironmentOverrides(
        view,
        "development",
        typedOverrideValues,
      );

      await driver.expectValidate().toBe(true);
      await driver.expectSettings().toEqual({
        instanceName: "alloy2",
        edgeConfigOverrides: buildEdgeConfigOverrides(typedOverrideValues),
      });
    },
    LONG_TEST_TIMEOUT,
  );
});
