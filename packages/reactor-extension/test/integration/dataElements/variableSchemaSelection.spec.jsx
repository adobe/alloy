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
import VariableView from "../../../src/view/dataElements/variableView";
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
import { suppressReactErrorBoundaryMessage } from "../helpers/errorSuppression";

const savedSettings = (sandboxName) => ({
  sandbox: { name: sandboxName },
  schema: { id: "sch123", version: "1.0" },
});

describe("Variable view sandbox and schema selection", () => {
  let view;
  let driver;
  let cleanup;
  let sandboxField;
  let schemaField;

  const init = async (initInfo) => {
    ({ view, driver, cleanup } = await useView(VariableView));
    sandboxField = field(view.getByTestId("sandboxField"));
    schemaField = field(view.getByTestId("schemaField"));
    await driver.init(initInfo);
  };

  const schemaLocator = () => view.getByTestId("schemaField");

  beforeEach(() => {
    worker.use(...schemaDetailHandlers);
  });

  afterEach(() => cleanup());

  describe("initialization", () => {
    it("initializes form fields with full XDM settings", async () => {
      worker.use(
        ...sandboxMultipleWithoutDefaultHandlers,
        ...schemasMultipleHandlers,
      );
      await init({ settings: savedSettings("testsandbox3") });
      await sandboxField.expectValue("PRODUCTION Test Sandbox 3 (VA7)");
      await schemaField.expectValue("Test Schema 1");
    });

    it("initializes the form when no default sandbox is set", async () => {
      worker.use(...sandboxMultipleWithoutDefaultHandlers);
      await init({ settings: null });
      await sandboxField.expectValue("Select a sandbox");
      await expect
        .element(view.getByText(/an error occurred/i))
        .not.toBeInTheDocument();
    });

    it("initializes form fields with full data settings", async () => {
      worker.use(...sandboxMultipleWithoutDefaultHandlers);
      await init({ settings: { solutions: ["target"] } });
      await field(view.getByTestId("targetCheckbox")).expectChecked();
      await field(view.getByTestId("dataRadioButton")).expectChecked();
    });
  });

  describe("returned settings", () => {
    it("returns full valid XDM settings after choosing sandbox and schema", async () => {
      worker.use(
        ...sandboxMultipleWithoutDefaultHandlers,
        ...schemasMultipleHandlers,
      );
      await init({});
      await sandboxField.selectOption("PRODUCTION Test Sandbox 3 (VA7)");
      await openMenu(schemaLocator());
      await selectMenuOption(schemaLocator(), "Test Schema 1");
      await driver.expectValidate().toBe(true);
      await driver.expectSettings().toEqual({
        sandbox: { name: "testsandbox3" },
        schema: {
          id: "https://ns.adobe.com/unifiedjsqeonly/schemas/sch123",
          version: "1.0",
        },
      });
    });

    it("returns full valid data settings", async () => {
      worker.use(
        ...sandboxMultipleWithoutDefaultHandlers,
        ...schemasMultipleHandlers,
      );
      await init({});
      await field(view.getByTestId("dataRadioButton")).check();
      await field(view.getByTestId("analyticsCheckbox")).check();
      await driver.expectSettings().toEqual({ solutions: ["analytics"] });
    });

    it("allows selecting a schema from the non-default sandbox", async () => {
      worker.use(
        ...sandboxMultipleWithDefaultHandlers,
        ...schemasSandbox2Handlers,
        ...schemasSandbox3Handlers,
      );
      await init({});
      await sandboxField.expectValue("PRODUCTION Test Sandbox 2 (VA7)");
      await sandboxField.selectOption("PRODUCTION Test Sandbox 3 (VA7)");
      await openMenu(schemaLocator());
      await selectMenuOption(schemaLocator(), "Test Schema 3B");
      await driver.expectValidate().toBe(true);
      await driver.expectSettings().toEqual({
        sandbox: { name: "testsandbox3" },
        schema: {
          id: "https://ns.adobe.com/unifiedjsqeonly/schemas/schema3b",
          version: "1.0",
        },
      });
    });
  });

  describe("sandbox loading errors", () => {
    it("displays an error when the access token for sandboxes is invalid", async () => {
      worker.use(...sandboxUnauthorizedHandlers);
      suppressReactErrorBoundaryMessage();
      await init({});
      await expect
        .element(view.getByText(/your access token appears to be invalid/i))
        .toBeVisible();
    });

    it("displays error when org is not provisioned for AEP", async () => {
      worker.use(...sandboxUserRegionMissing403Handlers);
      suppressReactErrorBoundaryMessage();
      await init({});
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
      await init({});
      await expect
        .element(view.getByText(/failed to load sandboxes/i))
        .toBeVisible();
    });

    it("displays error when the user has no access to any sandboxes", async () => {
      worker.use(...sandboxEmptyHandlers, ...schemasEmptyHandlers);
      suppressReactErrorBoundaryMessage();
      await init({});
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
      await init({});
      await sandboxField.expectValue("PRODUCTION Test Sandbox 1 (VA7)");
    });

    it("auto-selects sandbox marked as default in Platform", async () => {
      worker.use(
        ...sandboxMultipleWithDefaultHandlers,
        ...schemasEmptyHandlers,
      );
      await init({});
      await sandboxField.expectValue("PRODUCTION Test Sandbox 2 (VA7)");
    });

    it("auto-selects the default prod sandbox from the default handlers", async () => {
      worker.use(...schemasEmptyHandlers);
      await init({});
      await sandboxField.expectValue("PRODUCTION Prod (VA7)");
    });

    it("does not auto-select sandbox if multiple sandboxes and none is default", async () => {
      worker.use(
        ...sandboxMultipleWithoutDefaultHandlers,
        ...schemasEmptyHandlers,
      );
      await init({});
      await sandboxField.expectValue("Select a sandbox");
    });

    it("resets schema selection when a different sandbox is selected", async () => {
      worker.use(
        ...sandboxMultipleWithoutDefaultHandlers,
        ...schemasMultipleHandlers,
      );
      await init({ settings: savedSettings("testsandbox1") });
      await schemaField.expectValue("Test Schema 1");
      await sandboxField.selectOption("PRODUCTION Test Sandbox 2 (VA7)");
      await schemaField.expectValue("");
    });

    it("shows notice when saved sandbox name doesn't match any returned sandboxes", async () => {
      worker.use(
        ...sandboxMultipleWithoutDefaultHandlers,
        ...schemasEmptyHandlers,
      );
      await init({ settings: savedSettings("nonexistentsandbox") });
      await field(view.getByTestId("schemaMissingAlert")).expectVisible();
    });
  });

  describe("schema list", () => {
    it("shows no results in menu if there are no schemas in the sandbox", async () => {
      worker.use(...schemasEmptyHandlers);
      await init({});
      await schemaField.expectValue("");
      await openMenu(schemaLocator());
      await expect
        .poll(() => menuOptionLabels(schemaLocator()), { timeout: 6000 })
        .toEqual(["No results"]);
    });

    it("renders search results and selects one of them", async () => {
      worker.use(...schemasSearchHandlers, ...schemasMultipleHandlers);
      await init({});
      await schemaField.clear();
      await enterSearch(schemaLocator(), "M Ob");
      await expect
        .poll(() => menuOptionLabels(schemaLocator()), { timeout: 6000 })
        .toEqual(["XDM Object Data Element Tests"]);
      await selectMenuOption(schemaLocator(), "XDM Object Data Element Tests");
      await schemaField.expectValue("XDM Object Data Element Tests");
    });

    it("renders no results when a search matches nothing", async () => {
      worker.use(...schemasPagingHandlers);
      await init({});
      await schemaField.clear();
      await enterSearch(schemaLocator(), "bogus");
      await expect
        .poll(() => menuOptionLabels(schemaLocator()), { timeout: 6000 })
        .toEqual(["No results"]);
    });

    it("shows notice when the saved schema has been deleted", async () => {
      worker.use(
        ...sandboxMultipleWithoutDefaultHandlers,
        ...schemaNotFoundHandlers,
        ...schemasEmptyHandlers,
      );
      await init({ settings: savedSettings("prod") });
      await field(view.getByTestId("schemaMissingAlert")).expectVisible();
    });

    it("auto-selects schema if the sandbox contains a single schema", async () => {
      worker.use(
        ...sandboxSingleWithoutDefaultHandlers,
        ...schemasSingleHandlers,
      );
      await init({});
      await schemaField.expectValue("Test Schema 1");
    });

    it("does not auto-select schema if the sandbox contains multiple schemas", async () => {
      worker.use(
        ...sandboxSingleWithoutDefaultHandlers,
        ...schemasMultipleHandlers,
      );
      await init({});
      await schemaField.expectValue("");
    });

    it("shows an error when there are no schemas", async () => {
      worker.use(
        ...sandboxSingleWithoutDefaultHandlers,
        ...schemasEmptyHandlers,
      );
      await init({});
      await field(view.getByTestId("schemaFieldAlert")).expectVisible();
      await driver.expectValidate().toBe(false);
    });

    it("shows an error when a different sandbox has no schemas", async () => {
      worker.use(
        ...sandboxMultipleWithoutDefaultHandlers,
        ...schemasEmptyHandlers,
      );
      await init({});
      await sandboxField.expectVisible();
      await expect.element(schemaLocator()).not.toBeInTheDocument();
      await expect
        .element(view.getByTestId("schemaFieldAlert"))
        .not.toBeInTheDocument();
      await sandboxField.selectOption("PRODUCTION Test Sandbox 3 (VA7)");
      await field(view.getByTestId("schemaFieldAlert")).expectVisible();
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
      worker.use(
        ...sandboxMultipleWithoutDefaultHandlers,
        ...schemasEmptyHandlers,
      );
      await init({});
      await driver.expectValidate().toBe(false);
      await expect
        .element(view.getByText("Please select a sandbox."))
        .toBeVisible();
    });

    it("shows error when attempting to save with no schema selected", async () => {
      worker.use(
        ...sandboxSingleWithoutDefaultHandlers,
        ...schemasMultipleHandlers,
      );
      await init({});
      await driver.expectValidate().toBe(false);
      await expect
        .element(view.getByText("Please select a schema."))
        .toBeVisible();
    });

    it("shows error when attempting to save with no solution selected", async () => {
      worker.use(
        ...sandboxSingleWithoutDefaultHandlers,
        ...schemasMultipleHandlers,
      );
      await init({});
      await field(view.getByTestId("dataRadioButton")).check();
      await driver.expectValidate().toBe(false);
      await expect
        .element(view.getByText("Please select at least one Adobe solution."))
        .toBeVisible();
    });
  });
});
