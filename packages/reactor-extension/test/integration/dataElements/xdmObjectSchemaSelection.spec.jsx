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

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import XdmObjectView from "../../../src/view/dataElements/xdmObjectView";
import useView from "../helpers/useView";
import field from "../helpers/field";
import { worker } from "../helpers/mocks/browser";
import {
  sandboxUnauthorizedHandlers,
  sandboxEmptyHandlers,
  schemasEmptyHandlers,
  schemaNotFoundHandlers,
} from "../helpers/mocks/defaultHandlers";
import {
  sandboxMultipleWithDefaultHandlers,
  sandboxMultipleWithoutDefaultHandlers,
  sandboxNonJsonBodyHandlers,
  sandboxSingleWithoutDefaultHandlers,
  sandboxUserRegionMissing403Handlers,
} from "../helpers/mocks/sandboxesAndSchemas/sandboxes";
import {
  schemaDetailHandlers,
  schemasMultipleHandlers,
  schemasPagingHandlers,
  schemasSandbox2Handlers,
  schemasSandbox3Handlers,
  schemasSearchHandlers,
  schemasSingleHandlers,
} from "../helpers/mocks/sandboxesAndSchemas/schemas";
import {
  enterSearch,
  menuOptionLabels,
  openMenu,
  selectMenuOption,
} from "../helpers/dataElements/schemaPickers";
import { expectUnhandledRejection } from "../helpers/dataElements/expectUnhandledRejection";
import { suppressReactErrorBoundaryMessage } from "../helpers/errorSuppression";

const savedSettings = (sandboxName, data = {}) => ({
  sandbox: sandboxName ? { name: sandboxName } : undefined,
  schema: { id: "sch123", version: "1.0" },
  data,
});

describe("XDM object view schema selection", () => {
  let view;
  let driver;
  let cleanup;
  let sandboxField;
  let schemaField;

  const init = async (initInfo) => {
    ({ view, driver, cleanup } = await useView(XdmObjectView));
    sandboxField = field(view.getByTestId("sandboxField"));
    schemaField = field(view.getByTestId("schemaField"));
    await driver.init(initInfo);
  };

  const expectEditor = () =>
    expect.element(view.getByTestId("xdmTreeNodeTitle").first()).toBeVisible();

  beforeEach(() => {
    worker.use(...schemaDetailHandlers);
  });

  afterEach(() => cleanup());

  describe("sandbox loading errors", () => {
    it("displays error when access token is invalid", async () => {
      worker.use(...sandboxUnauthorizedHandlers);
      suppressReactErrorBoundaryMessage();
      await init();
      await expect
        .element(view.getByText(/your access token appears to be invalid/i))
        .toBeVisible();
    });

    it("displays error when org is not provisioned for AEP", async () => {
      worker.use(...sandboxUserRegionMissing403Handlers);
      suppressReactErrorBoundaryMessage();
      await init();
      await expect
        .element(
          view.getByText(
            /not currently provisioned for Adobe Data Collection/i,
          ),
        )
        .toBeVisible();
    });

    it("displays error when response body is invalid JSON", async () => {
      worker.use(...sandboxNonJsonBodyHandlers);
      suppressReactErrorBoundaryMessage();
      await init();
      await expect
        .element(view.getByText(/failed to load sandboxes/i))
        .toBeVisible();
    });

    it("displays error when the user has no access to any sandboxes", async () => {
      worker.use(...sandboxEmptyHandlers, ...schemasEmptyHandlers);
      suppressReactErrorBoundaryMessage();
      await init();
      await expect
        .element(view.getByText(/you do not have access to any sandboxes/i))
        .toBeVisible();
    });
  });

  describe("sandbox auto-selection", () => {
    it("auto-selects first sandbox if response contains a single sandbox not marked as default", async () => {
      worker.use(
        ...sandboxSingleWithoutDefaultHandlers,
        ...schemasEmptyHandlers,
      );
      await init();
      await sandboxField.expectValue("PRODUCTION Test Sandbox 1 (VA7)");
    });

    it("auto-selects sandbox marked as default in Platform", async () => {
      worker.use(
        ...sandboxMultipleWithDefaultHandlers,
        ...schemasEmptyHandlers,
      );
      await init();
      await sandboxField.expectValue("PRODUCTION Test Sandbox 2 (VA7)");
    });

    it("does not auto-select sandbox if multiple sandboxes and none is default", async () => {
      worker.use(
        ...sandboxMultipleWithoutDefaultHandlers,
        ...schemasEmptyHandlers,
      );
      await init();
      await sandboxField.expectValue("Select a sandbox");
    });

    it("auto-selects corresponding sandbox when loading saved settings containing sandbox name", async () => {
      worker.use(
        ...sandboxMultipleWithoutDefaultHandlers,
        ...schemasEmptyHandlers,
      );
      await init({ settings: savedSettings("testsandbox3") });
      await sandboxField.expectValue("PRODUCTION Test Sandbox 3 (VA7)");
    });

    it("auto-selects prod sandbox when loading saved settings containing no sandbox name", async () => {
      worker.use(
        ...sandboxMultipleWithoutDefaultHandlers,
        ...schemasEmptyHandlers,
      );
      await init({ settings: savedSettings() });
      await sandboxField.expectValue("PRODUCTION Test Sandbox Prod (VA7)");
    });

    it("displays notice when saved sandbox name doesn't match any returned sandboxes", async () => {
      worker.use(
        ...sandboxMultipleWithoutDefaultHandlers,
        ...schemasEmptyHandlers,
      );
      await init({ settings: savedSettings("nonexistentsandbox") });
      await field(view.getByTestId("schemaMissingAlert")).expectVisible();
      await sandboxField.expectValue("Saved sandbox unavailable");
    });

    it("resets schema selection and editor when a different sandbox is selected", async () => {
      worker.use(
        ...sandboxMultipleWithoutDefaultHandlers,
        ...schemasMultipleHandlers,
      );
      // Known src bug: clearing the schema on sandbox change makes xdmObjectView
      // read `$id` of a null schema. Remove once it guards a null selectedSchema.
      const sawNullSchemaRejection = expectUnhandledRejection(
        (reason) =>
          reason instanceof TypeError &&
          reason.message.includes("reading '$id'"),
      );
      await init({ settings: savedSettings("testsandbox1") });
      await expectEditor();
      await schemaField.expectValue("Test Schema 1");
      await sandboxField.selectOption("PRODUCTION Test Sandbox 2 (VA7)");
      await schemaField.expectValue("");
      await expect
        .element(view.getByTestId("xdmTreeNodeTitle").first())
        .not.toBeInTheDocument();
      await expect.poll(sawNullSchemaRejection, { timeout: 6000 }).toBe(true);
    });
  });

  describe("schema list", () => {
    it("shows no results in menu if there are no schemas in the sandbox", async () => {
      worker.use(...schemasEmptyHandlers);
      await init();
      await schemaField.expectValue("");
      await openMenu(view.getByTestId("schemaField"));
      await expect
        .poll(() => menuOptionLabels(view.getByTestId("schemaField")), {
          timeout: 6000,
        })
        .toEqual(["No results"]);
    });

    it("treats regular expression special characters in a search as regular characters", async () => {
      worker.use(...schemasPagingHandlers);
      await init();
      await schemaField.clear();
      await enterSearch(view.getByTestId("schemaField"), "Pag.*");
      await expect
        .poll(() => menuOptionLabels(view.getByTestId("schemaField")), {
          timeout: 6000,
        })
        .toEqual(["No results"]);
    });

    it("renders search results and selects one of them", async () => {
      worker.use(...schemasSearchHandlers, ...schemasMultipleHandlers);
      await init();
      await schemaField.clear();
      await enterSearch(view.getByTestId("schemaField"), "M Ob");
      await expect
        .poll(() => menuOptionLabels(view.getByTestId("schemaField")), {
          timeout: 6000,
        })
        .toEqual(["XDM Object Data Element Tests"]);
      await selectMenuOption(
        view.getByTestId("schemaField"),
        "XDM Object Data Element Tests",
      );
      await schemaField.expectValue("XDM Object Data Element Tests");
    });

    it("renders no results when a search matches nothing", async () => {
      worker.use(...schemasPagingHandlers);
      await init();
      await schemaField.clear();
      await enterSearch(view.getByTestId("schemaField"), "bogus");
      await expect
        .poll(() => menuOptionLabels(view.getByTestId("schemaField")), {
          timeout: 6000,
        })
        .toEqual(["No results"]);
    });

    it("shows notice when the saved schema has been deleted", async () => {
      worker.use(...schemaNotFoundHandlers, ...schemasEmptyHandlers);
      await init({ settings: savedSettings("prod") });
      await field(view.getByTestId("schemaMissingAlert")).expectVisible();
    });

    it("auto-selects schema if the sandbox contains a single schema", async () => {
      worker.use(
        ...sandboxSingleWithoutDefaultHandlers,
        ...schemasSingleHandlers,
      );
      await init();
      await schemaField.expectValue("Test Schema 1");
      await expect
        .element(
          view
            .getByTestId("xdmTreeNodeTitleDisplayName")
            .getByText("testField", { exact: true }),
        )
        .toBeVisible();
    });

    it("does not auto-select schema if the sandbox contains multiple schemas", async () => {
      worker.use(
        ...sandboxSingleWithoutDefaultHandlers,
        ...schemasMultipleHandlers,
      );
      await init();
      await schemaField.expectValue("");
    });

    it("auto-selects saved schema even when it is not in the first page of schemas", async () => {
      worker.use(
        ...sandboxSingleWithoutDefaultHandlers,
        ...schemasPagingHandlers,
      );
      await init({ settings: savedSettings("testsandbox1") });
      await schemaField.expectValue("Test Schema 1");
    });
  });

  describe("validation", () => {
    it("shows error when attempting to save with no sandbox selected", async () => {
      worker.use(...sandboxMultipleWithoutDefaultHandlers);
      await init();
      await driver.expectValidate().toBe(false);
      await sandboxField.click();
      await expect
        .element(view.getByText("Please select a sandbox."))
        .toBeVisible();
    });

    it("shows error when attempting to save with no schema selected", async () => {
      worker.use(
        ...sandboxSingleWithoutDefaultHandlers,
        ...schemasMultipleHandlers,
      );
      await init();
      await driver.expectValidate().toBe(false);
      await schemaField.expectError(/please select a schema/i);
    });
  });

  describe("selecting from sandboxes", () => {
    it("allows selecting a schema from the non-default sandbox", async () => {
      worker.use(
        ...sandboxMultipleWithDefaultHandlers,
        ...schemasSandbox2Handlers,
        ...schemasSandbox3Handlers,
      );
      await init({});
      await sandboxField.expectValue("PRODUCTION Test Sandbox 2 (VA7)");
      await sandboxField.selectOption("PRODUCTION Test Sandbox 3 (VA7)");
      await openMenu(view.getByTestId("schemaField"));
      await selectMenuOption(view.getByTestId("schemaField"), "Test Schema 3B");
      await driver.expectSettings().toEqual({
        data: {},
        sandbox: { name: "testsandbox3" },
        schema: {
          id: "https://ns.adobe.com/unifiedjsqeonly/schemas/schema3b",
          version: "1.0",
        },
      });
    });

    it("allows selecting sandbox and schema and preserves previously saved data", async () => {
      worker.use(
        ...sandboxMultipleWithoutDefaultHandlers,
        ...schemasMultipleHandlers,
      );
      await init({
        settings: savedSettings("nonexistentsandbox", {
          testField: "%prefilled%",
        }),
      });
      await expect
        .element(view.getByText("Could not load saved configuration"))
        .toBeVisible();
      await sandboxField.selectOption("PRODUCTION Test Sandbox 3 (VA7)");
      await openMenu(view.getByTestId("schemaField"));
      await selectMenuOption(view.getByTestId("schemaField"), "Test Schema 1");
      await view
        .getByTestId("xdmTreeNodeTitleDisplayName")
        .getByText("testField", { exact: true })
        .click();
      await field(view.getByTestId("valueField")).expectValue("%prefilled%");
      await driver
        .expectSettings((settings) => settings.data)
        .toEqual({ testField: "%prefilled%" });
    });
  });
});
