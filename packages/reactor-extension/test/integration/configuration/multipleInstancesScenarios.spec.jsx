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
// eslint-disable-next-line import/no-unresolved
import { page } from "vitest/browser";
import renderView from "../helpers/renderView";
import createExtensionBridge from "../helpers/createExtensionBridge";
import ConfigurationView from "../../../src/view/configuration/configurationView";
import { waitForConfigurationViewToLoad } from "../helpers/ui";
import { buildSettings } from "../helpers/settingsUtils";
import { tabs, spectrumTextField } from "../helpers/form";

let extensionBridge;

describe("Config Multiple Instances", () => {
  beforeEach(() => {
    extensionBridge = createExtensionBridge();
    window.extensionBridge = extensionBridge;
  });

  afterEach(() => {
    delete window.extensionBridge;
  });

  it("prevents creating two instances with the same name", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            edgeConfigId: "2fdb3763-0507-42ea-8856-e91bf3b64faa",
            sandbox: "prod",
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    expect(await extensionBridge.validate()).toBe(true);

    const addInstanceButton = page.getByTestId("addInstanceButton");
    await addInstanceButton.click();

    const secondTab = tabs("alloy2");
    await secondTab.click();

    // Change the name back to "alloy" to create a duplicate
    const nameField = spectrumTextField("nameField");
    await nameField.fill("alloy");

    expect(await extensionBridge.validate()).toBe(false);

    expect(await nameField.hasError()).toBe(true);
    const errorMessage = await nameField.getErrorMessage();
    expect(errorMessage).toBe(
      "Please provide a name unique from those used for other instances.",
    );
  });

  it("prevents creating two instances with the org name", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            edgeConfigId: "2fdb3763-0507-42ea-8856-e91bf3b64faa",
            sandbox: "prod",
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    expect(await extensionBridge.validate()).toBe(true);

    const addInstanceButton = page.getByTestId("addInstanceButton");
    await addInstanceButton.click();

    const secondTab = tabs("alloy").nth(1);
    await expect.element(secondTab.element()).toBeVisible();
    await secondTab.click();

    const nameField = spectrumTextField("nameField");
    await nameField.fill("alloy2");

    expect(await extensionBridge.validate()).toBe(false);

    const orgIdField = spectrumTextField("orgIdField");
    expect(await orgIdField.hasError()).toBe(true);
    const errorMessage = await orgIdField.getErrorMessage();
    expect(errorMessage).toBe(
      "Please provide an IMS Organization ID unique from those used for other instances.",
    );
  });

  it("prevents creating two instances with the same edge config id", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            edgeConfigId: "2fdb3763-0507-42ea-8856-e91bf3b64faa",
            sandbox: "prod",
          },
          {
            name: "alloy2",
            orgId: "x@AdobeOrg",
            edgeConfigId: "3fdb3763-0507-42ea-8856-e91bf3b64fbb",
            sandbox: "prod",
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    expect(await extensionBridge.validate()).toBe(true);

    const secondTab = tabs("alloy").nth(1);
    await expect.element(secondTab.element()).toBeVisible();
    await secondTab.click();

    expect(await extensionBridge.validate()).toBe(true);

    const edgeConfigField = spectrumTextField("productionEnvironmentTextfield");
    await edgeConfigField.fill("2fdb3763-0507-42ea-8856-e91bf3b64faa");

    expect(await extensionBridge.validate()).toBe(false);

    expect(await edgeConfigField.hasError()).toBe(true);
    const errorMessage = await edgeConfigField.getErrorMessage();
    expect(errorMessage).toBe(
      "Please provide a value unique from those used for other instances.",
    );
  });

  it("allows creating two instances with different names and different org ids", async () => {
    const view = await renderView(ConfigurationView);

    // Start with two instances that have different names, different orgIds, and valid configs
    extensionBridge.init({
      settings: {
        components: {
          eventMerge: false,
        },
        instances: [
          {
            name: "alloy",
            edgeConfigId: "2fdb3763-0507-42ea-8856-e91bf3b64faa",
            sandbox: "prod",
            orgId: "ORG1@AdobeOrg",
          },
          {
            name: "alloy2",
            edgeConfigId: "3fdb3763-0507-42ea-8856-e91bf3b64fbb",
            sandbox: "prod",
            orgId: "ORG2@AdobeOrg",
          },
        ],
      },
    });

    await waitForConfigurationViewToLoad(view);

    expect(await extensionBridge.validate()).toBe(true);

    const settings = await extensionBridge.getSettings();
    expect(settings.instances).toHaveLength(2);
    expect(settings.instances[0].name).toBe("alloy");
    expect(settings.instances[0].orgId).toBe("ORG1@AdobeOrg");
    expect(settings.instances[1].name).toBe("alloy2");
    expect(settings.instances[1].orgId).toBe("ORG2@AdobeOrg");
  });

  it("allows deleting an instance", async () => {
    const view = await renderView(ConfigurationView);

    // Start with two instances
    extensionBridge.init({
      settings: {
        components: {
          eventMerge: false,
        },
        instances: [
          {
            name: "alloy",
            edgeConfigId: "2fdb3763-0507-42ea-8856-e91bf3b64faa",
            sandbox: "prod",
            orgId: "ORG1@AdobeOrg",
          },
          {
            name: "alloy2",
            edgeConfigId: "3fdb3763-0507-42ea-8856-e91bf3b64fbb",
            sandbox: "prod",
            orgId: "ORG2@AdobeOrg",
          },
        ],
      },
    });

    await waitForConfigurationViewToLoad(view);

    expect(await extensionBridge.validate()).toBe(true);

    const firstTab = tabs("alloy").nth(0);
    await firstTab.click();

    const deleteButton = page.getByTestId("deleteInstanceButton");
    await expect.element(deleteButton.element()).toBeVisible();

    // Click the delete button on the first instance
    await deleteButton.click();

    // Verify the confirmation dialog appears
    const cancelButton = page.getByTestId("cancelDeleteInstanceButton");
    const confirmButton = page.getByTestId("confirmDeleteInstanceButton");
    await expect.element(cancelButton.element()).toBeVisible();
    await expect.element(confirmButton.element()).toBeVisible();

    // First, test canceling the deletion
    await cancelButton.click();

    // Verify we still have two instances after canceling
    let settings = await extensionBridge.getSettings();
    expect(settings.instances).toHaveLength(2);
    expect(settings.instances[0].name).toBe("alloy");
    expect(settings.instances[0].orgId).toBe("ORG1@AdobeOrg");
    expect(settings.instances[1].name).toBe("alloy2");
    expect(settings.instances[1].orgId).toBe("ORG2@AdobeOrg");

    // Now delete for real - click delete button again
    await deleteButton.click();

    // Confirm the deletion
    await confirmButton.click();

    // Verify we now have only one instance (the second one, "alloy2")
    settings = await extensionBridge.getSettings();
    expect(settings.instances).toHaveLength(1);
    expect(settings.instances[0].name).toBe("alloy2");
    expect(settings.instances[0].orgId).toBe("ORG2@AdobeOrg");

    // Verify the form is still valid
    expect(await extensionBridge.validate()).toBe(true);
  });

  it("allows deleting first instance", async () => {
    const view = await renderView(ConfigurationView);

    // Start with two instances
    extensionBridge.init({
      settings: {
        components: {
          eventMerge: false,
        },
        instances: [
          {
            name: "alloy",
            edgeConfigId: "2fdb3763-0507-42ea-8856-e91bf3b64faa",
            sandbox: "prod",
            orgId: "ORG1@AdobeOrg",
          },
          {
            name: "alloy2",
            edgeConfigId: "3fdb3763-0507-42ea-8856-e91bf3b64fbb",
            sandbox: "prod",
            orgId: "ORG2@AdobeOrg",
          },
          {
            name: "alloy3",
            edgeConfigId: "4fdb3763-0507-42ea-8856-e91bf3b64fbb",
            sandbox: "prod",
            orgId: "ORG3@AdobeOrg",
          },
        ],
      },
    });

    await waitForConfigurationViewToLoad(view);

    expect(await extensionBridge.validate()).toBe(true);

    const firstTab = tabs("alloy").nth(0);
    await firstTab.click();

    const deleteButton = page.getByTestId("deleteInstanceButton");
    await expect.element(deleteButton.element()).toBeVisible();

    await deleteButton.click();

    const confirmButton = page.getByTestId("confirmDeleteInstanceButton");
    await confirmButton.click();

    const settings = await extensionBridge.getSettings();

    expect(settings.instances).toHaveLength(2);
    expect(await extensionBridge.validate()).toBe(true);

    // Check that a tab is still visible in the page
    const edgeConfigField = spectrumTextField("nameField");
    expect(await edgeConfigField.getValue()).toBe("alloy2");

    // Check that the confirmation dialog is closed
    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
    expect(() => {
      confirmButton.element();
    }).toThrow();
  });

  it("allows deleting last instance", async () => {
    const view = await renderView(ConfigurationView);

    // Start with two instances
    extensionBridge.init({
      settings: {
        components: {
          eventMerge: false,
        },
        instances: [
          {
            name: "alloy",
            edgeConfigId: "2fdb3763-0507-42ea-8856-e91bf3b64faa",
            sandbox: "prod",
            orgId: "ORG1@AdobeOrg",
          },
          {
            name: "alloy2",
            edgeConfigId: "3fdb3763-0507-42ea-8856-e91bf3b64fbb",
            sandbox: "prod",
            orgId: "ORG2@AdobeOrg",
          },
          {
            name: "alloy3",
            edgeConfigId: "4fdb3763-0507-42ea-8856-e91bf3b64fbb",
            sandbox: "prod",
            orgId: "ORG3@AdobeOrg",
          },
        ],
      },
    });

    await waitForConfigurationViewToLoad(view);

    expect(await extensionBridge.validate()).toBe(true);

    const lastTab = tabs("alloy").nth(2);
    await lastTab.click();

    const deleteButton = page.getByTestId("deleteInstanceButton");
    await expect.element(deleteButton.element()).toBeVisible();

    await deleteButton.click();

    const confirmButton = page.getByTestId("confirmDeleteInstanceButton");
    await confirmButton.click();

    const settings = await extensionBridge.getSettings();

    expect(settings.instances).toHaveLength(2);
    expect(await extensionBridge.validate()).toBe(true);

    // Check that a tab is still visible in the page
    const edgeConfigField = spectrumTextField("nameField");
    expect(await edgeConfigField.getValue()).toBe("alloy2");

    // Check that the confirmation dialog is closed
    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
    expect(() => {
      confirmButton.element();
    }).toThrow();
  });

  it("allows deleting the middle instance", async () => {
    const view = await renderView(ConfigurationView);

    // Start with two instances
    extensionBridge.init({
      settings: {
        components: {
          eventMerge: false,
        },
        instances: [
          {
            name: "alloy",
            edgeConfigId: "2fdb3763-0507-42ea-8856-e91bf3b64faa",
            sandbox: "prod",
            orgId: "ORG1@AdobeOrg",
          },
          {
            name: "alloy2",
            edgeConfigId: "3fdb3763-0507-42ea-8856-e91bf3b64fbb",
            sandbox: "prod",
            orgId: "ORG2@AdobeOrg",
          },
          {
            name: "alloy3",
            edgeConfigId: "4fdb3763-0507-42ea-8856-e91bf3b64fbb",
            sandbox: "prod",
            orgId: "ORG3@AdobeOrg",
          },
        ],
      },
    });

    await waitForConfigurationViewToLoad(view);

    expect(await extensionBridge.validate()).toBe(true);

    const middleTab = tabs("alloy").nth(1);
    await middleTab.click();

    const deleteButton = page.getByTestId("deleteInstanceButton");
    await expect.element(deleteButton.element()).toBeVisible();

    await deleteButton.click();

    const confirmButton = page.getByTestId("confirmDeleteInstanceButton");
    await confirmButton.click();

    const settings = await extensionBridge.getSettings();

    expect(settings.instances).toHaveLength(2);
    expect(await extensionBridge.validate()).toBe(true);

    // Check that a tab is still visible in the page
    const edgeConfigField = spectrumTextField("nameField");
    expect(await edgeConfigField.getValue()).toBe("alloy");

    // Check that the confirmation dialog is closed
    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
    expect(() => {
      confirmButton.element();
    }).toThrow();
  });
});
