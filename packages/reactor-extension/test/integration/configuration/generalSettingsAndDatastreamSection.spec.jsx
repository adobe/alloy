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
import {
  spectrumPicker,
  spectrumRadio,
  spectrumTextField,
} from "../helpers/form";
import { buildSettings } from "../helpers/settingsUtils";

let extensionBridge;

describe("Config general settings and datastream section", () => {
  beforeEach(() => {
    extensionBridge = createExtensionBridge();
    window.extensionBridge = extensionBridge;
  });

  afterEach(() => {
    delete window.extensionBridge;
  });

  it("sets free form values from settings", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init({
      settings: {
        components: {
          eventMerge: false,
        },
        instances: [
          {
            name: "alloy",
            orgId: "123456@AdobeOrg",
            edgeDomain: "custom.example.com",
            edgeConfigId: "prod-datastream-id",
            stagingEdgeConfigId: "staging-datastream-id",
            developmentEdgeConfigId: "dev-datastream-id",
          },
        ],
      },
    });

    await waitForConfigurationViewToLoad(view);

    // Verify basic fields
    const nameField = spectrumTextField("nameField");
    expect(await nameField.getValue()).toBe("alloy");

    const orgIdField = spectrumTextField("orgIdField");
    expect(await orgIdField.getValue()).toBe("123456@AdobeOrg");

    const edgeDomainField = spectrumTextField("edgeDomainField");
    expect(await edgeDomainField.getValue()).toBe("custom.example.com");

    // Verify freeform input method is selected
    const freeformRadio = spectrumRadio("edgeConfigInputMethodFreeformRadio");
    expect(await freeformRadio.isSelected()).toBe(true);

    // Verify datastream fields
    const productionField = spectrumTextField("productionEnvironmentTextfield");
    expect(await productionField.getValue()).toBe("prod-datastream-id");

    const stagingField = spectrumTextField("stagingEnvironmentTextfield");
    expect(await stagingField.getValue()).toBe("staging-datastream-id");

    const developmentField = spectrumTextField(
      "developmentEnvironmentTextfield",
    );
    expect(await developmentField.getValue()).toBe("dev-datastream-id");
  });

  it("sets list form values from settings", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init({
      settings: {
        components: {
          eventMerge: false,
        },
        instances: [
          {
            name: "alloy",
            orgId: "123456@AdobeOrg",
            edgeDomain: "custom.example.com",
            edgeConfigId: "2fdb3763-0507-42ea-8856-e91bf3b64faa",
            stagingEdgeConfigId: "0a106b4d-1937-4196-a64d-4a324e972459",
            developmentEdgeConfigId: "77469821-5ead-4045-97b6-acfd889ded6b",
          },
        ],
      },
    });

    await waitForConfigurationViewToLoad(view);

    // Verify datastream fields
    const productionField = spectrumPicker("productionDatastreamField");
    await productionField.waitForLoad();
    expect(await productionField.getSelectedText()).toBe("analytics enabled");

    const stagingField = spectrumPicker("stagingDatastreamField");
    await stagingField.waitForLoad();
    expect(await stagingField.getSelectedText()).toBe("aep-edge-samples");

    const developmentField = spectrumPicker("developmentDatastreamField");
    await developmentField.waitForLoad();
    expect(await developmentField.getSelectedText()).toBe("datastream enabled");
  });

  it("updates free form values and saves to settings", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    // Update basic fields
    const nameField = spectrumTextField("nameField");
    await nameField.fill("customInstance");

    const orgIdField = spectrumTextField("orgIdField");
    await orgIdField.fill("987654@AdobeOrg");

    const edgeDomainField = spectrumTextField("edgeDomainField");
    await edgeDomainField.fill("firstparty.example.com");

    // Switch to freeform input method for datastreams
    const freeformRadio = spectrumRadio("edgeConfigInputMethodFreeformRadio");
    await freeformRadio.click();

    // Update datastream fields
    const productionField = spectrumTextField("productionEnvironmentTextfield");
    await productionField.fill("new-prod-datastream");

    const stagingField = spectrumTextField("stagingEnvironmentTextfield");
    await stagingField.fill("new-staging-datastream");

    const developmentField = spectrumTextField(
      "developmentEnvironmentTextfield",
    );
    await developmentField.fill("new-dev-datastream");

    // Get settings and verify all fields
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0]).toMatchObject({
      name: "customInstance",
      orgId: "987654@AdobeOrg",
      edgeDomain: "firstparty.example.com",
      edgeConfigId: "new-prod-datastream",
      stagingEdgeConfigId: "new-staging-datastream",
      developmentEdgeConfigId: "new-dev-datastream",
    });
  });

  it("updates list form values and saves to settings", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            edgeConfigId: "0a106b4d-1937-4196-a64d-4a324e972459",
            sandbox: "prod",
            stagingEdgeConfigId: "2fdb3763-0507-42ea-8856-e91bf3b64faa",
            stagingSandbox: "prod",
            developmentEdgeConfigId: "77469821-5ead-4045-97b6-acfd889ded6b",
            developmentSandbox: "prod",
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    // Update datastream fields
    const productionField = spectrumPicker("productionDatastreamField");
    await productionField.selectOption("analytics enabled");

    const stagingField = spectrumPicker("stagingDatastreamField");
    await stagingField.selectOption("datastream enabled");

    const developmentField = spectrumPicker("developmentDatastreamField");
    await developmentField.selectOption("aep-edge-samples");

    // Get settings and verify all fields
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0]).toMatchObject({
      edgeConfigId: "2fdb3763-0507-42ea-8856-e91bf3b64faa",
      stagingEdgeConfigId: "77469821-5ead-4045-97b6-acfd889ded6b",
      developmentEdgeConfigId: "0a106b4d-1937-4196-a64d-4a324e972459",
    });
  });

  it("shows default values when no settings are provided", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init({ settings: null });

    await waitForConfigurationViewToLoad(view);

    // Verify basic field defaults
    const nameField = spectrumTextField("nameField");
    expect(await nameField.getValue()).toBe("alloy");

    const orgIdField = spectrumTextField("orgIdField");
    expect(await orgIdField.getValue()).toBe("1234@AdobeOrg");

    const edgeDomainField = spectrumTextField("edgeDomainField");
    expect(await edgeDomainField.getValue()).toBe("edge.adobedc.net");
  });

  it("does not save default values to settings", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init({ settings: null });

    await waitForConfigurationViewToLoad(view);

    // Default values should not be saved except for name
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].name).toBe("alloy");
    expect(settings.instances[0].orgId).toBeUndefined();
    expect(settings.instances[0].edgeDomain).toBeUndefined();
  });

  it("allows data element in name field", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    // Change name to a data element
    const nameField = spectrumTextField("nameField");
    await nameField.fill("%instanceName%");

    const nameFieldElement = spectrumTextField("nameField");
    expect(await nameFieldElement.getValue()).toBe("%instanceName%");

    // Verify it's saved as string
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].name).toBe("%instanceName%");
  });

  it("allows data element in IMS organization ID field", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            orgId: "%myOrgId%",
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const orgIdField = spectrumTextField("orgIdField");
    expect(await orgIdField.getValue()).toBe("%myOrgId%");

    // Verify it's saved as string
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].orgId).toBe("%myOrgId%");
  });

  it("allows data element in edge domain field", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            edgeDomain: "%myEdgeDomain%",
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const edgeDomainField = spectrumTextField("edgeDomainField");
    expect(await edgeDomainField.getValue()).toBe("%myEdgeDomain%");

    // Verify it's saved as string
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].edgeDomain).toBe("%myEdgeDomain%");
  });

  ["production", "staging", "development"].forEach((name) => {
    it(`allows data element in ${name} datastream field`, async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init({
        settings: {
          components: {
            eventMerge: false,
          },
          instances: [
            {
              name: "alloy",
              [`${name === "production" ? "edgeConfigId" : `${name}EdgeConfigId`}`]: `%${name}Datastream%`,
            },
          ],
        },
      });

      await waitForConfigurationViewToLoad(view);

      // Verify freeform mode is selected
      const freeformRadio = spectrumRadio("edgeConfigInputMethodFreeformRadio");
      expect(await freeformRadio.isSelected()).toBe(true);

      const field = spectrumTextField(`${name}EnvironmentTextfield`);
      expect(await field.getValue()).toBe(`%${name}Datastream%`);

      // Verify it's saved as string
      const settings = await extensionBridge.getSettings();
      expect(
        settings.instances[0][
          `${name === "production" ? "edgeConfigId" : `${name}EdgeConfigId`}`
        ],
      ).toBe(`%${name}Datastream%`);
    });
  });

  it("sets default edge domain to tenant-specific domain when tenant ID is provided on new extension", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init({
      company: {
        orgId: "5BFE274A5F6980A50A495C08@AdobeOrg",
        tenantId: "mytenant",
      },
      propertySettings: { id: "PR1234" },
      tokens: { imsAccess: "IMS_ACCESS" },
    });

    await waitForConfigurationViewToLoad(view);

    const edgeDomainField = spectrumTextField("edgeDomainField");
    expect(await edgeDomainField.getValue()).toBe("mytenant.data.adobedc.net");
  });

  it("sets default edge domain to edge.adobedc.net when editing existing instance without saved edgeDomain", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init({
      company: {
        orgId: "5BFE274A5F6980A50A495C08@AdobeOrg",
        tenantId: "mytenant",
      },
      propertySettings: { id: "PR1234" },
      tokens: { imsAccess: "IMS_ACCESS" },
      settings: {
        components: {
          eventMerge: false,
        },
        instances: [
          {
            name: "alloy",
            edgeConfigId: "PR123",
          },
        ],
      },
    });

    await waitForConfigurationViewToLoad(view);

    const edgeDomainField = page.getByTestId("edgeDomainField");
    expect(edgeDomainField.element().value).toBe("edge.adobedc.net");
  });

  it("saves tenant-specific edge domain even when it matches the default on new extension", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init({
      company: {
        orgId: "5BFE274A5F6980A50A495C08@AdobeOrg",
        tenantId: "mytenant",
      },
      propertySettings: { id: "PR1234" },
      tokens: { imsAccess: "IMS_ACCESS" },
    });

    await waitForConfigurationViewToLoad(view);

    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].edgeDomain).toBe("mytenant.data.adobedc.net");
  });

  describe("validation", () => {
    it("validates that name is required", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init(buildSettings());

      await waitForConfigurationViewToLoad(view);

      expect(await extensionBridge.validate()).toBe(true);

      const nameField = spectrumTextField("nameField");
      await nameField.clear();

      expect(await nameField.hasError()).toBe(true);
      expect(await nameField.getErrorMessage()).toBe("Please specify a name.");

      expect(await extensionBridge.validate()).toBe(false);
    });

    it("validates that IMS organization ID is required", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init(buildSettings());

      await waitForConfigurationViewToLoad(view);

      expect(await extensionBridge.validate()).toBe(true);

      const orgIdField = spectrumTextField("orgIdField");
      await orgIdField.clear();

      expect(await orgIdField.hasError()).toBe(true);
      expect(await orgIdField.getErrorMessage()).toBe(
        "Please specify an IMS organization ID.",
      );

      expect(await extensionBridge.validate()).toBe(false);
    });

    it("validates that edge domain is required", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init(buildSettings());

      await waitForConfigurationViewToLoad(view);

      expect(await extensionBridge.validate()).toBe(true);

      const edgeDomainField = spectrumTextField("edgeDomainField");
      await edgeDomainField.clear();

      expect(await edgeDomainField.hasError()).toBe(true);
      expect(await edgeDomainField.getErrorMessage()).toBe(
        "Please specify an edge domain.",
      );

      expect(await extensionBridge.validate()).toBe(false);
    });

    it("validates that name cannot be all numeric", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init(buildSettings());

      await waitForConfigurationViewToLoad(view);

      expect(await extensionBridge.validate()).toBe(true);

      const nameField = spectrumTextField("nameField");
      await nameField.fill("123");

      expect(await nameField.hasError()).toBe(true);
      expect(await nameField.getErrorMessage()).toBe(
        "Please provide a non-numeric name.",
      );

      expect(await extensionBridge.validate()).toBe(false);
    });

    it("validates that name cannot be property existing on window object", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init(buildSettings());

      await waitForConfigurationViewToLoad(view);

      expect(await extensionBridge.validate()).toBe(true);

      const nameField = spectrumTextField("nameField");
      await nameField.fill("addEventListener");

      expect(await nameField.hasError()).toBe(true);
      expect(await nameField.getErrorMessage()).toBe(
        "Please provide a name that does not conflict with a property already found on the window object.",
      );

      expect(await extensionBridge.validate()).toBe(false);
    });

    it("validates that production datastream is required in freeform mode", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init(buildSettings());

      await waitForConfigurationViewToLoad(view);

      expect(await extensionBridge.validate()).toBe(true);

      // Switch to freeform input method
      const freeformRadio = spectrumRadio("edgeConfigInputMethodFreeformRadio");
      await freeformRadio.click();

      const productionField = spectrumTextField(
        "productionEnvironmentTextfield",
      );
      await productionField.clear();

      expect(await productionField.hasError()).toBe(true);
      expect(await productionField.getErrorMessage()).toBe(
        "Please specify a datastream.",
      );

      expect(await extensionBridge.validate()).toBe(false);
    });

    it("validates staging and development datastreams are optional", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init(buildSettings());

      await waitForConfigurationViewToLoad(view);
      expect(await extensionBridge.validate()).toBe(true);

      // Switch to freeform input method
      const freeformRadio = spectrumRadio("edgeConfigInputMethodFreeformRadio");
      await freeformRadio.click();

      const productionField = spectrumTextField(
        "productionEnvironmentTextfield",
      );
      await productionField.fill("prod-datastream-id");

      const stagingField = spectrumTextField("stagingEnvironmentTextfield");
      await stagingField.clear();
      expect(await stagingField.hasError()).toBe(false);

      const developmentField = spectrumTextField(
        "developmentEnvironmentTextfield",
      );
      await developmentField.clear();
      expect(await developmentField.hasError()).toBe(false);

      // Should still be valid since only production is required
      expect(await extensionBridge.validate()).toBe(true);
    });

    it("accepts data elements in all fields", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init(buildSettings());

      await waitForConfigurationViewToLoad(view);

      // Fill basic fields with data elements
      const nameField = spectrumTextField("nameField");
      await nameField.fill("%instanceName%");

      const orgIdField = spectrumTextField("orgIdField");
      await orgIdField.fill("%myOrgId%");

      const edgeDomainField = spectrumTextField("edgeDomainField");
      await edgeDomainField.fill("%myEdgeDomain%");

      // Switch to freeform and fill datastream fields with data elements
      const freeformRadio = spectrumRadio("edgeConfigInputMethodFreeformRadio");
      await freeformRadio.click();

      const productionField = spectrumTextField(
        "productionEnvironmentTextfield",
      );
      await productionField.fill("%prodDatastream%");

      const stagingField = spectrumTextField("stagingEnvironmentTextfield");
      await stagingField.fill("%stagingDatastream%");

      const developmentField = spectrumTextField(
        "developmentEnvironmentTextfield",
      );
      await developmentField.fill("%devDatastream%");

      expect(await extensionBridge.validate()).toBe(true);
    });
  });

  describe("restore default buttons", () => {
    it("restores default IMS organization ID when button is clicked", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init(buildSettings());

      await waitForConfigurationViewToLoad(view);

      // First, change the orgId
      const orgIdField = spectrumTextField("orgIdField");
      const originalOrgId = await orgIdField.getValue();
      await orgIdField.fill("custom@AdobeOrg");

      // Verify it changed
      expect(await orgIdField.getValue()).toBe("custom@AdobeOrg");

      // Click restore button
      const restoreButton = page.getByTestId("orgIdRestoreButton");
      await restoreButton.click();

      // Verify it's restored to default
      expect(await orgIdField.getValue()).toBe(originalOrgId);
    });

    it("restores default edge domain when button is clicked", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init(buildSettings());

      await waitForConfigurationViewToLoad(view);

      // First, change the edgeDomain
      const edgeDomainField = spectrumTextField("edgeDomainField");
      const originalEdgeDomain = await edgeDomainField.getValue();
      await edgeDomainField.fill("custom.example.com");

      // Verify it changed
      expect(await edgeDomainField.getValue()).toBe("custom.example.com");

      // Click restore button
      const restoreButton = page.getByTestId("edgeDomainRestoreButton");
      await restoreButton.click();

      // Verify it's restored to default
      expect(await edgeDomainField.getValue()).toBe(originalEdgeDomain);
    });

    it("restores default edge domain to tenant-specific domain when restore button is clicked on new instance with tenant ID", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init({
        company: {
          orgId: "5BFE274A5F6980A50A495C08@AdobeOrg",
          tenantId: "mytenant",
        },
        propertySettings: { id: "PR1234" },
        tokens: { imsAccess: "IMS_ACCESS" },
      });

      await waitForConfigurationViewToLoad(view);

      const edgeDomainField = spectrumTextField("edgeDomainField");
      await edgeDomainField.fill("custom.example.com");

      const restoreButton = page.getByTestId("edgeDomainRestoreButton");
      await restoreButton.click();

      expect(await edgeDomainField.getValue()).toBe(
        "mytenant.data.adobedc.net",
      );
    });

    it("restores to tenant-specific default when restore button is clicked on existing instance with tenant ID", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init({
        company: {
          orgId: "5BFE274A5F6980A50A495C08@AdobeOrg",
          tenantId: "mytenant",
        },
        propertySettings: { id: "PR1234" },
        tokens: { imsAccess: "IMS_ACCESS" },
        settings: {
          components: {
            eventMerge: false,
          },
          instances: [
            {
              name: "alloy",
              edgeConfigId: "PR123",
            },
          ],
        },
      });

      await waitForConfigurationViewToLoad(view);

      const edgeDomainField = spectrumTextField("edgeDomainField");
      await edgeDomainField.fill("custom.example.com");

      const restoreButton = page.getByTestId("edgeDomainRestoreButton");
      await restoreButton.click();

      expect(await edgeDomainField.getValue()).toBe(
        "mytenant.data.adobedc.net",
      );
    });
  });

  describe("name change alert", () => {
    it("shows alert when instance name is changed from persisted value", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init(
        buildSettings({
          instances: [
            {
              name: "originalName",
            },
          ],
        }),
      );

      await waitForConfigurationViewToLoad(view);

      // Change the name
      const nameField = spectrumTextField("nameField");
      await nameField.fill("newName");

      // Should show alert about potential problems
      await expect
        .element(
          view.getByRole("heading", {
            name: /potential problems due to name change/i,
          }),
        )
        .toBeVisible();
    });

    it("does not show alert when name is changed on a new configuration", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init({ settings: null });

      await waitForConfigurationViewToLoad(view);

      // Change the name
      const nameField = spectrumTextField("nameField");
      await nameField.fill("newName");

      // Alert should not be present
      await expect
        .element(
          view.getByRole("heading", {
            name: /potential problems due to name change/i,
          }),
        )
        .not.toBeInTheDocument();
    });
  });

  describe("datastream input method switching", () => {
    it("can switch between select and freeform input methods", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init(buildSettings());

      await waitForConfigurationViewToLoad(view);

      // Initially select method should be selected (buildSettings provides sandbox)
      const selectRadio = spectrumRadio("edgeConfigInputMethodSelectRadio");
      expect(await selectRadio.isSelected()).toBe(true);

      // Switch to freeform
      const freeformRadio = spectrumRadio("edgeConfigInputMethodFreeformRadio");
      await freeformRadio.click();

      expect(await freeformRadio.isSelected()).toBe(true);

      // Verify production field is visible
      expect(
        await spectrumTextField("productionEnvironmentTextfield").getElement(),
      ).toBeVisible();

      // Switch back to select
      await selectRadio.click();
      expect(await selectRadio.isSelected()).toBe(true);
    });
  });
});
