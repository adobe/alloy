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

import { describe, it, beforeEach, afterEach } from "vitest";

import useView from "../helpers/useView";
import ConfigurationView from "../../../src/view/configuration/configurationView";
import configurationUI from "../helpers/ui/configurationUI";
import field from "../helpers/field";

let view;
let driver;
let cleanup;
let orgIdField;
let edgeDomainField;
let nameField;

const managedSettings = {
  libraryCode: { type: "managed" },
  instances: [{ name: "alloy", edgeConfigId: "PR123" }],
};

const preinstalledSettings = {
  libraryCode: { type: "preinstalled" },
  instances: [{ name: "alloy" }],
};

const selectLibraryType = async (label) => {
  await configurationUI(view).expand("Build options");
  await view.getByText(label, { exact: true }).click();
};

describe("Config library type", () => {
  beforeEach(async () => {
    ({ view, driver, cleanup } = await useView(ConfigurationView));
    orgIdField = field(view.getByTestId("orgIdField"));
    edgeDomainField = field(view.getByTestId("edgeDomainField"));
    nameField = field(view.getByTestId("nameField"));
  });

  afterEach(() => {
    cleanup();
  });

  it("should hide fields when preinstalled library type is selected", async () => {
    await driver.init({ settings: structuredClone(managedSettings) });

    await orgIdField.expectVisible();
    await edgeDomainField.expectVisible();

    await selectLibraryType("Use a self-hosted alloy.js instance");

    await orgIdField.expectHidden();
    await edgeDomainField.expectHidden();
    await nameField.expectVisible();
  });

  it("should save preinstalled type correctly", async () => {
    await driver.init({ settings: structuredClone(managedSettings) });

    await selectLibraryType("Use a self-hosted alloy.js instance");

    await driver.expectSettings().toEqual({
      libraryCode: { type: "preinstalled" },
      instances: [{ name: "alloy" }],
    });
    await driver.expectValidate().toBe(true);
  });

  it("should save managed type correctly", async () => {
    await driver.init({ settings: structuredClone(managedSettings) });

    await driver
      .expectSettings((settings) => settings.libraryCode)
      .toBeUndefined();
    await driver
      .expectSettings((settings) => settings.instances[0].edgeConfigId)
      .toBe("PR123");
  });

  it("should show fields with preinstalled settings", async () => {
    await driver.init({ settings: structuredClone(preinstalledSettings) });

    await nameField.expectValue("alloy");
    await orgIdField.expectHidden();
    await edgeDomainField.expectHidden();
    await driver.expectSettings().toEqual(preinstalledSettings);
  });

  it("should validate instance name in preinstalled mode", async () => {
    await driver.init({ settings: structuredClone(preinstalledSettings) });

    await nameField.clear();

    await driver.expectValidate().toBe(false);
    await nameField.expectError(/please specify a name/i);
  });

  // Bug: basicSectionBridge wasPreinstalled() checks legacy `librarySettings`, not `libraryCode`.
  it.fails(
    "seeds the tenant-specific edge domain when switching reopened preinstalled settings to managed",
    async () => {
      await driver.init({
        company: { orgId: "1234@AdobeOrg", tenantId: "acme" },
        settings: structuredClone(preinstalledSettings),
      });

      await selectLibraryType("Managed by Adobe Tags");

      await edgeDomainField.expectValue("acme.data.adobedc.net");
    },
  );
});
