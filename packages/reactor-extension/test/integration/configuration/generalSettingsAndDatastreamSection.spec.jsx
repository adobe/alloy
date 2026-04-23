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

import useView from "../helpers/useView";
import ConfigurationView from "../../../src/view/configuration/configurationView";
import { buildSettings } from "../helpers/settingsUtils";
import field from "../helpers/field";

let view;
let driver;
let cleanup;
let nameField;
let orgIdField;
let edgeDomainField;
let edgeConfigInputMethodFreeformRadio;
let edgeConfigInputMethodSelectRadio;
let productionEnvironmentTextfield;
let stagingEnvironmentTextfield;
let developmentEnvironmentTextfield;
let productionDatastreamField;
let stagingDatastreamField;
let developmentDatastreamField;
let orgIdRestoreButton;
let edgeDomainRestoreButton;

describe("Config general settings and datastream section", () => {
  beforeEach(async () => {
    ({ view, driver, cleanup } = await useView(ConfigurationView));
    nameField = field(view.getByTestId("nameField"));
    orgIdField = field(view.getByTestId("orgIdField"));
    edgeDomainField = field(view.getByTestId("edgeDomainField"));
    edgeConfigInputMethodFreeformRadio = field(
      view.getByTestId("edgeConfigInputMethodFreeformRadio"),
    );
    edgeConfigInputMethodSelectRadio = field(
      view.getByTestId("edgeConfigInputMethodSelectRadio"),
    );
    productionEnvironmentTextfield = field(
      view.getByTestId("productionEnvironmentTextfield"),
    );
    stagingEnvironmentTextfield = field(
      view.getByTestId("stagingEnvironmentTextfield"),
    );
    developmentEnvironmentTextfield = field(
      view.getByTestId("developmentEnvironmentTextfield"),
    );
    productionDatastreamField = field(
      view.getByTestId("productionDatastreamField"),
    );
    stagingDatastreamField = field(view.getByTestId("stagingDatastreamField"));
    developmentDatastreamField = field(
      view.getByTestId("developmentDatastreamField"),
    );
    orgIdRestoreButton = field(view.getByTestId("orgIdRestoreButton"));
    edgeDomainRestoreButton = field(
      view.getByTestId("edgeDomainRestoreButton"),
    );
  });

  afterEach(() => {
    cleanup();
  });

  it("sets free form values from settings", async () => {
    await driver.init({
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

    await nameField.expectValue("alloy");
    await orgIdField.expectValue("123456@AdobeOrg");
    await edgeDomainField.expectValue("custom.example.com");

    await edgeConfigInputMethodFreeformRadio.expectChecked();

    await productionEnvironmentTextfield.expectValue("prod-datastream-id");
    await stagingEnvironmentTextfield.expectValue("staging-datastream-id");
    await developmentEnvironmentTextfield.expectValue("dev-datastream-id");
  });

  it("sets list form values from settings", async () => {
    await driver.init({
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

    await productionDatastreamField.expectValue("analytics enabled");
    await stagingDatastreamField.expectValue("aep-edge-samples");
    await developmentDatastreamField.expectValue("datastream enabled");
  });

  it("updates free form values and saves to settings", async () => {
    await driver.init(buildSettings());

    await nameField.fill("customInstance");
    await orgIdField.fill("987654@AdobeOrg");
    await edgeDomainField.fill("firstparty.example.com");

    await edgeConfigInputMethodFreeformRadio.click();

    await productionEnvironmentTextfield.fill("new-prod-datastream");
    await stagingEnvironmentTextfield.fill("new-staging-datastream");
    await developmentEnvironmentTextfield.fill("new-dev-datastream");

    await driver
      .expectSettings((s) => s.instances[0])
      .toMatchObject({
        name: "customInstance",
        orgId: "987654@AdobeOrg",
        edgeDomain: "firstparty.example.com",
        edgeConfigId: "new-prod-datastream",
        stagingEdgeConfigId: "new-staging-datastream",
        developmentEdgeConfigId: "new-dev-datastream",
      });
  });

  it("updates list form values and saves to settings", async () => {
    await driver.init(
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

    await productionDatastreamField.selectOption("analytics enabled");
    await stagingDatastreamField.selectOption("datastream enabled");
    await developmentDatastreamField.selectOption("aep-edge-samples");

    await driver
      .expectSettings((s) => s.instances[0])
      .toMatchObject({
        edgeConfigId: "2fdb3763-0507-42ea-8856-e91bf3b64faa",
        stagingEdgeConfigId: "77469821-5ead-4045-97b6-acfd889ded6b",
        developmentEdgeConfigId: "0a106b4d-1937-4196-a64d-4a324e972459",
      });
  });

  it("shows default values when no settings are provided", async () => {
    await driver.init({ settings: null });

    await nameField.expectValue("alloy");
    await orgIdField.expectValue("1234@AdobeOrg");
    await edgeDomainField.expectValue("edge.adobedc.net");
  });

  it("does not save default values to settings", async () => {
    await driver.init({ settings: null });

    await driver.expectSettings((s) => s.instances[0].name).toBe("alloy");
    await driver.expectSettings((s) => s.instances[0].orgId).toBeUndefined();
    await driver
      .expectSettings((s) => s.instances[0].edgeDomain)
      .toBeUndefined();
  });

  it("allows data element in name field", async () => {
    await driver.init(buildSettings());

    await nameField.fill("%instanceName%");

    await nameField.expectValue("%instanceName%");

    await driver
      .expectSettings((s) => s.instances[0].name)
      .toBe("%instanceName%");
  });

  it("allows data element in IMS organization ID field", async () => {
    await driver.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            orgId: "%myOrgId%",
          },
        ],
      }),
    );

    await orgIdField.expectValue("%myOrgId%");

    await driver.expectSettings((s) => s.instances[0].orgId).toBe("%myOrgId%");
  });

  it("allows data element in edge domain field", async () => {
    await driver.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            edgeDomain: "%myEdgeDomain%",
          },
        ],
      }),
    );

    await edgeDomainField.expectValue("%myEdgeDomain%");

    await driver
      .expectSettings((s) => s.instances[0].edgeDomain)
      .toBe("%myEdgeDomain%");
  });

  ["production", "staging", "development"].forEach((name) => {
    it(`allows data element in ${name} datastream field`, async () => {
      await driver.init({
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

      await edgeConfigInputMethodFreeformRadio.expectChecked();

      const envTextField = field(
        view.getByTestId(`${name}EnvironmentTextfield`),
      );
      await envTextField.expectValue(`%${name}Datastream%`);

      await driver
        .expectSettings(
          (s) =>
            s.instances[0][
              `${name === "production" ? "edgeConfigId" : `${name}EdgeConfigId`}`
            ],
        )
        .toBe(`%${name}Datastream%`);
    });
  });

  it("sets default edge domain to tenant-specific domain when tenant ID is provided on new extension", async () => {
    await driver.init({
      company: {
        orgId: "5BFE274A5F6980A50A495C08@AdobeOrg",
        tenantId: "mytenant",
      },
      propertySettings: { id: "PR1234" },
      tokens: { imsAccess: "IMS_ACCESS" },
    });

    await edgeDomainField.expectValue("mytenant.data.adobedc.net");
  });

  it("sets default edge domain to edge.adobedc.net when editing existing instance without saved edgeDomain", async () => {
    await driver.init({
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

    await edgeDomainField.expectValue("edge.adobedc.net");
  });

  it("saves tenant-specific edge domain even when it matches the default on new extension", async () => {
    await driver.init({
      company: {
        orgId: "5BFE274A5F6980A50A495C08@AdobeOrg",
        tenantId: "mytenant",
      },
      propertySettings: { id: "PR1234" },
      tokens: { imsAccess: "IMS_ACCESS" },
    });

    await driver
      .expectSettings((s) => s.instances[0].edgeDomain)
      .toBe("mytenant.data.adobedc.net");
  });

  describe("validation", () => {
    it("validates that name is required", async () => {
      await driver.init(buildSettings());

      await driver.expectValidate().toBe(true);

      await nameField.clear();

      await nameField.expectError(/please specify a name/i);

      await driver.expectValidate().toBe(false);
    });

    it("validates that IMS organization ID is required", async () => {
      await driver.init(buildSettings());

      await driver.expectValidate().toBe(true);

      await orgIdField.clear();

      await orgIdField.expectError(/please specify an IMS organization ID/i);

      await driver.expectValidate().toBe(false);
    });

    it("validates that edge domain is required", async () => {
      await driver.init(buildSettings());

      await driver.expectValidate().toBe(true);

      await edgeDomainField.clear();

      await edgeDomainField.expectError(/please specify an edge domain/i);

      await driver.expectValidate().toBe(false);
    });

    it("validates that name cannot be all numeric", async () => {
      await driver.init(buildSettings());

      await driver.expectValidate().toBe(true);

      await nameField.fill("123");

      await nameField.expectError(/please provide a non-numeric name/i);

      await driver.expectValidate().toBe(false);
    });

    it("validates that name cannot be property existing on window object", async () => {
      await driver.init(buildSettings());

      await driver.expectValidate().toBe(true);

      await nameField.fill("addEventListener");

      await nameField.expectError(
        /please provide a name that does not conflict with a property already found on the window object/i,
      );

      await driver.expectValidate().toBe(false);
    });

    it("validates that production datastream is required in freeform mode", async () => {
      await driver.init(buildSettings());

      await driver.expectValidate().toBe(true);

      await edgeConfigInputMethodFreeformRadio.click();

      await productionEnvironmentTextfield.clear();

      await productionEnvironmentTextfield.expectError(
        /please specify a datastream/i,
      );

      await driver.expectValidate().toBe(false);
    });

    it("validates staging and development datastreams are optional", async () => {
      await driver.init(buildSettings());

      await driver.expectValidate().toBe(true);

      await edgeConfigInputMethodFreeformRadio.click();

      await productionEnvironmentTextfield.fill("prod-datastream-id");

      await stagingEnvironmentTextfield.fill("");
      await stagingEnvironmentTextfield.expectValid();

      await developmentEnvironmentTextfield.fill("");
      await developmentEnvironmentTextfield.expectValid();

      await driver.expectValidate().toBe(true);
    });

    it("accepts data elements in all fields", async () => {
      await driver.init(buildSettings());

      await nameField.fill("%instanceName%");
      await orgIdField.fill("%myOrgId%");
      await edgeDomainField.fill("%myEdgeDomain%");

      await edgeConfigInputMethodFreeformRadio.click();

      await productionEnvironmentTextfield.fill("%prodDatastream%");
      await stagingEnvironmentTextfield.fill("%stagingDatastream%");
      await developmentEnvironmentTextfield.fill("%devDatastream%");

      await driver.expectValidate().toBe(true);
    });
  });

  describe("restore default buttons", () => {
    it("restores default IMS organization ID when button is clicked", async () => {
      await driver.init(buildSettings());

      const originalOrgId = await orgIdField.getValue();
      await orgIdField.fill("custom@AdobeOrg");

      await orgIdField.expectValue("custom@AdobeOrg");

      await orgIdRestoreButton.click();

      await orgIdField.expectValue(originalOrgId);
    });

    it("restores default edge domain when button is clicked", async () => {
      await driver.init(buildSettings());

      const originalEdgeDomain = await edgeDomainField.getValue();
      await edgeDomainField.fill("custom.example.com");

      await edgeDomainField.expectValue("custom.example.com");

      await edgeDomainRestoreButton.click();

      await edgeDomainField.expectValue(originalEdgeDomain);
    });

    it("restores default edge domain to tenant-specific domain when restore button is clicked on new instance with tenant ID", async () => {
      await driver.init({
        company: {
          orgId: "5BFE274A5F6980A50A495C08@AdobeOrg",
          tenantId: "mytenant",
        },
        propertySettings: { id: "PR1234" },
        tokens: { imsAccess: "IMS_ACCESS" },
      });

      await edgeDomainField.fill("custom.example.com");

      await edgeDomainRestoreButton.click();

      await edgeDomainField.expectValue("mytenant.data.adobedc.net");
    });

    it("restores to tenant-specific default when restore button is clicked on existing instance with tenant ID", async () => {
      await driver.init({
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

      await edgeDomainField.fill("custom.example.com");

      await edgeDomainRestoreButton.click();

      await edgeDomainField.expectValue("mytenant.data.adobedc.net");
    });
  });

  describe("name change alert", () => {
    it("shows alert when instance name is changed from persisted value", async () => {
      await driver.init(
        buildSettings({
          instances: [
            {
              name: "originalName",
            },
          ],
        }),
      );

      await nameField.fill("newName");

      await expect
        .element(
          view.getByRole("heading", {
            name: /potential problems due to name change/i,
          }),
        )
        .toBeVisible();
    });

    it("does not show alert when name is changed on a new configuration", async () => {
      await driver.init({ settings: null });

      await nameField.fill("newName");

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
      await driver.init(buildSettings());

      await edgeConfigInputMethodSelectRadio.expectChecked();

      await edgeConfigInputMethodFreeformRadio.click();

      await edgeConfigInputMethodFreeformRadio.expectChecked();

      await productionEnvironmentTextfield.expectVisible();

      await edgeConfigInputMethodSelectRadio.click();
      await edgeConfigInputMethodSelectRadio.expectChecked();
    });
  });
});
