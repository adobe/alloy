/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { t, Selector } from "testcafe";
import createExtensionViewFixture from "../../../helpers/createExtensionViewFixture.mjs";
import * as sandboxMocks from "../../../helpers/endpointMocks/sandboxesMocks.mjs";
import * as schemasMocks from "../../../helpers/endpointMocks/schemasMocks.mjs";
import * as schemaMocks from "../../../helpers/endpointMocks/schemaMocks.mjs";
import extensionViewController from "../../../helpers/extensionViewController.mjs";
import spectrum from "../../../helpers/spectrum.mjs";
import runCommonExtensionViewTests from "../runCommonExtensionViewTests.mjs";

const errorBoundaryMessage = spectrum.illustratedMessage(
  "errorBoundaryMessage",
);
const testSchemaTitle = "XDM Object Data Element Tests";
const sandboxField = spectrum.picker("sandboxField");
const schemaField = spectrum.comboBox("schemaField");
const noSchemasAlert = spectrum.alert("schemaFieldAlert");
const variableTypeDataRadio = spectrum.radio("dataRadioButton");
const analyticsCheckbox = spectrum.checkbox("analyticsCheckbox");
const targetCheckbox = spectrum.checkbox("targetCheckbox");
const schemaMissingAlert = spectrum.alert("schemaMissingAlert");

createExtensionViewFixture({
  title: "Variable Data Element View",
  viewPath: "dataElements/variable.html",
  requiresAdobeIOIntegration: true,
});

runCommonExtensionViewTests();

test.requestHooks(
  sandboxMocks.multipleWithoutDefault,
  schemaMocks.basic,
  schemasMocks.multiple,
)("initializes form fields with full XDM settings", async () => {
  await extensionViewController.init({
    settings: {
      sandbox: {
        name: "testsandbox3",
      },
      schema: {
        id: "sch123",
        version: "1.0",
      },
    },
  });
  await sandboxField.expectText("PRODUCTION Test Sandbox 3 (VA7)");
  await schemaField.expectText("Test Schema 1");
});

test.requestHooks(sandboxMocks.multipleWithoutDefault)(
  "initializes the form when no default sandbox is set",
  async () => {
    await extensionViewController.init({
      settings: null,
    });

    await t.wait(1000);
    await t.expect(Selector("body").innerText).notContains("An error occurred");
  },
);

test.requestHooks(sandboxMocks.multipleWithoutDefault, schemaMocks.basic)(
  "initializes form fields with full data settings",
  async () => {
    await extensionViewController.init({
      settings: {
        solutions: ["target"],
      },
    });
    await targetCheckbox.expectChecked();
  },
);

test.requestHooks(sandboxMocks.multipleWithoutDefault, schemasMocks.multiple)(
  "returns full valid XDM settings",
  async () => {
    await extensionViewController.init({});
    await sandboxField.selectOption("PRODUCTION Test Sandbox 3 (VA7)");
    await schemaField.openMenu();
    await schemaField.selectMenuOption("Test Schema 1");
    await extensionViewController.expectIsValid();
    const { sandbox, schema } = await extensionViewController.getSettings();
    await t.expect(sandbox).contains({ name: "testsandbox3" });
    await t.expect(schema).contains({
      id: "https://ns.adobe.com/unifiedjsqeonly/schemas/sch123",
      version: "1.0",
    });
  },
);

test.requestHooks(sandboxMocks.multipleWithoutDefault, schemasMocks.multiple)(
  "returns full valid data settings",
  async () => {
    await extensionViewController.init({});
    await variableTypeDataRadio.click();
    await analyticsCheckbox.click();

    const { solutions } = await extensionViewController.getSettings();
    await t.expect(solutions).contains("analytics");
  },
);

test.requestHooks(sandboxMocks.unauthorized)(
  "displays an error when the access token for sandboxes is invalid",
  async () => {
    await extensionViewController.init({});
    await errorBoundaryMessage.expectMessage(
      /Your access token appears to be invalid./,
    );
  },
);

test.requestHooks(sandboxMocks.userRegionMissing)(
  "displays error when org is not provisioned for AEP",
  async () => {
    await extensionViewController.init({});
    await errorBoundaryMessage.expectMessage(
      /You or your organization is not currently provisioned for Adobe Data Collection/,
    );
  },
);
test.requestHooks(sandboxMocks.nonJsonBody)(
  "displays error when response body is invalid JSON",
  async () => {
    await extensionViewController.init({});
    await errorBoundaryMessage.expectMessage(/Failed to load sandboxes./);
  },
);

test.requestHooks(sandboxMocks.empty, schemasMocks.empty)(
  "displays error when the user has no access to any sandboxes",
  async () => {
    await extensionViewController.init({});
    await errorBoundaryMessage.expectMessage(
      /You do not have access to any sandboxes./,
    );
  },
);

test.requestHooks(sandboxMocks.singleWithoutDefault, schemasMocks.empty)(
  "auto-selects first sandbox if response contains a single sandbox not marked as default in Platform",
  async () => {
    await extensionViewController.init({});
    await sandboxField.expectText("PRODUCTION Test Sandbox 1 (VA7)");
  },
);

test.requestHooks(sandboxMocks.multipleWithDefault, schemasMocks.empty)(
  "auto-selects sandbox marked as default in Platform",
  async () => {
    await extensionViewController.init({});
    await sandboxField.expectText("PRODUCTION Test Sandbox 2 (VA7)");
  },
);

test.requestHooks(sandboxMocks.multipleWithoutDefault, schemasMocks.empty)(
  "does not auto-select sandbox if response contains multiple sandboxes, none of which are marked as default in Platform",
  async () => {
    await extensionViewController.init({});
    await sandboxField.expectText("Select a sandbox");
  },
);

test.requestHooks(
  sandboxMocks.multipleWithoutDefault,
  schemaMocks.basic,
  schemasMocks.multiple,
)("resets schema selection when a different sandbox is selected", async () => {
  await extensionViewController.init({
    settings: {
      sandbox: {
        name: "testsandbox1",
      },
      schema: {
        id: "sch123",
        version: "1.0",
      },
    },
  });
  await schemaField.expectText("Test Schema 1");
  await sandboxField.selectOption("PRODUCTION Test Sandbox 2 (VA7)");
  await schemaField.expectText("");
});

test.requestHooks(
  sandboxMocks.multipleWithoutDefault,
  schemaMocks.basic,
  schemasMocks.empty,
)(
  "displays error when loading saved XDM object containing sandbox name in its settings that doesn't match any returned sandboxes",
  async () => {
    await extensionViewController.init({
      settings: {
        sandbox: {
          name: "nonexistentsandbox",
        },
        schema: {
          id: "sch123",
          version: "1.0",
        },
      },
    });
    await schemaMissingAlert.expectExists();
  },
);

test.requestHooks(schemasMocks.empty)(
  "show no results in menu if there are no schemas in the sandbox",
  async () => {
    await extensionViewController.init({});
    await schemaField.expectText("");
    await schemaField.openMenu();
    await schemaField.expectMenuOptionLabels(["No results"]);
  },
);

test.requestHooks(schemasMocks.search, schemasMocks.multiple)(
  "allows user to enter a schema search query that renders results and selects one of them",
  async () => {
    await extensionViewController.init({});
    await schemaField.clear();
    await schemaField.enterSearch(testSchemaTitle.substring(2, 6));
    await schemaField.expectMenuOptionLabels([testSchemaTitle]);
    await schemaField.selectMenuOption(testSchemaTitle);
  },
);

test("allows user to enter schema search query that renders no results", async () => {
  await extensionViewController.init({});
  await schemaField.clear();
  await schemaField.enterSearch("bogus");
  await schemaField.expectMenuOptionLabels(["No results"]);
});

test.requestHooks(sandboxMocks.multipleWithoutDefault)(
  "attempts to load a schema that has been deleted",
  async () => {
    await extensionViewController.init({
      settings: {
        sandbox: {
          name: "prod",
        },
        schema: {
          id: "sch123",
          version: "1.0",
        },
      },
    });
    await schemaMissingAlert.expectExists();
  },
);

test.requestHooks(
  sandboxMocks.singleWithoutDefault,
  schemasMocks.single,
  schemaMocks.basic,
)("auto-selects schema if the sandbox contains a single schema", async () => {
  await extensionViewController.init({});
  await schemaField.expectText("Test Schema 1");
});

test.requestHooks(sandboxMocks.singleWithoutDefault, schemasMocks.multiple)(
  "does not auto-select schema if the sandbox contains multiple schemas",
  async () => {
    await extensionViewController.init({});
    await schemaField.expectText("");
  },
);

test.requestHooks(sandboxMocks.singleWithoutDefault, schemasMocks.empty)(
  "shows an error when there are no schemas",
  async () => {
    await extensionViewController.init({});
    await noSchemasAlert.expectExists();
    await extensionViewController.expectIsNotValid();
  },
);

test.requestHooks(sandboxMocks.multipleWithoutDefault, schemasMocks.empty)(
  "shows an error when there are no schemas and a different sandbox",
  async () => {
    await extensionViewController.init({});
    await sandboxField.expectExists();
    await schemaField.expectNotExists();
    await noSchemasAlert.expectNotExists();
    await sandboxField.selectOption("PRODUCTION Test Sandbox 3 (VA7)");
    await noSchemasAlert.expectExists();
  },
);

test.requestHooks(
  sandboxMocks.singleWithoutDefault,
  schemaMocks.basic,
  schemasMocks.multiple,
)(
  "auto-selects schema when loading saved XDM object even when schema is not in the first page of schema metas loaded from server",
  async () => {
    // This test is to ensure we're avoiding issues described in
    // https://github.com/adobe/react-spectrum/issues/1942
    await extensionViewController.init({
      settings: {
        sandbox: {
          name: "testsandbox1",
        },
        schema: {
          id: "sch123",
          version: "1.0",
        },
      },
    });
    await schemaField.expectText("Test Schema 1");
  },
);

test.requestHooks(sandboxMocks.multipleWithoutDefault, schemasMocks.empty)(
  "show error when attempting to save with no sandbox selected",
  async () => {
    await extensionViewController.init({});
    await extensionViewController.expectIsNotValid();
    await t
      .expect(Selector("div").withText("Please select a sandbox.").exists)
      .ok("Error message doesn't exist.");
  },
);

test.requestHooks(sandboxMocks.singleWithoutDefault, schemasMocks.multiple)(
  "show error when attempting to save with no schema selected",
  async () => {
    await extensionViewController.init({});
    await extensionViewController.expectIsNotValid();
    await t
      .expect(Selector("div").withText("Please select a schema.").exists)
      .ok("Error message doesn't exist.");
  },
);

test.requestHooks(sandboxMocks.singleWithoutDefault, schemasMocks.multiple)(
  "show error when attempting to save with no solution selected",
  async () => {
    await extensionViewController.init({});
    await variableTypeDataRadio.click();
    await extensionViewController.expectIsNotValid();
    await t
      .expect(
        Selector("div").withText("Please select at least one Adobe solution.")
          .exists,
      )
      .ok("Error message doesn't exist.");
  },
);

test.requestHooks(
  sandboxMocks.multipleWithDefault,
  schemasMocks.sandbox2,
  schemasMocks.sandbox3,
  schemaMocks.schema3b,
)("Allows you to select a schema from the non-default sandbox", async () => {
  await extensionViewController.init({});
  await sandboxField.expectText("PRODUCTION Test Sandbox 2 (VA7)");
  await sandboxField.selectOption("PRODUCTION Test Sandbox 3 (VA7)");

  await schemaField.openMenu();
  await schemaField.selectMenuOption("Test Schema 3B");
  await extensionViewController.expectIsValid();
  const settings = await extensionViewController.getSettings();
  await t.expect(settings).eql({
    sandbox: {
      name: "testsandbox3",
    },
    schema: {
      id: "https://ns.adobe.com/unifiedjsqeonly/schemas/schema3b",
      version: "1.0",
    },
  });
});
