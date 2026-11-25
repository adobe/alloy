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

import { describe, it, afterEach, expect } from "vitest";
import useView from "../helpers/useView";
import UpdateVariableView from "../../../src/view/actions/updateVariableView";
import field from "../helpers/field";
import { worker } from "../helpers/mocks/browser";
import { createObjectEditor } from "../helpers/objectEditor";
import {
  UNIFIED_SCHEMA_ID,
  dataElements,
  pagedDataElementsHandler,
  updateVariableHandlers,
} from "../helpers/mocks/updateVariable/handlers";

let view;
let driver;
let cleanup;
let editor;

const init = async (settings, ...handlers) => {
  worker.use(...handlers);
  ({ view, driver, cleanup } = await useView(UpdateVariableView));
  editor = createObjectEditor(view);
  await driver.init({ settings });
};

const dataElementField = () => field(view.getByTestId("dataElementField"));
const alert = (testId) => field(view.getByTestId(testId));
const selectDataElement = (name) => dataElementField().selectOption(name);

const allVariables = ["de1", "de2", "de3", "de4", "de5", "de6"];

describe("Update variable action data element selection", () => {
  afterEach(() => {
    if (cleanup) cleanup();
  });

  describe("auto-selecting the only variable data element", () => {
    it("selects the variable when there is only one", async () => {
      await init(null, ...updateVariableHandlers(["other", "de1"]));
      await dataElementField().expectValue("Test data variable 1");
      await alert("noDataElements").expectHidden();
      await editor.tree.node("xdm").expectExists();
    });

    it("selects the variable when there are lots of data elements, but only one variable data element", async () => {
      await init(
        null,
        ...updateVariableHandlers(["de1"], {
          listHandler: pagedDataElementsHandler([
            [dataElements.other],
            [dataElements.de1],
          ]),
        }),
      );
      await dataElementField().expectValue("Test data variable 1");
      await editor.tree.node("xdm").expectExists();
    });

    it("centers the custom code button in the unlabeled preview", async () => {
      await init(null, ...updateVariableHandlers(["other", "de1"]));
      await editor.tree.node("xdm").expectExists();
      const button = view.getByTestId("onBeforeEventSendEditButton");
      await expect.element(button).toBeVisible();

      const centerOffset = () => {
        const buttonBounds = button.element().getBoundingClientRect();
        const textareaBounds = button
          .element()
          .closest(".CodePreview-openEditorButton")
          .parentElement.querySelector("textarea")
          .getBoundingClientRect();
        return Math.abs(
          (buttonBounds.top + buttonBounds.bottom) / 2 -
            (textareaBounds.top + textareaBounds.bottom) / 2,
        );
      };
      await expect.poll(centerOffset).toBeLessThan(1);
    });
  });

  describe("editing the XDM", () => {
    it("allows the user to select a data element and set the XDM", async () => {
      await init(null, ...updateVariableHandlers(allVariables));
      await selectDataElement("Test data variable 2");
      await editor.tree.node("xdm").expectExists();
      await editor.tree.node("_unifiedjsqeonly").expand();
      await editor.tree.node(["_unifiedjsqeonly", "vendor"]).expand();
      await editor.tree.node(["vendor", "name"]).click();
      await editor.string.enterValue("name1");

      await driver.expectSettings().toEqual({
        dataElementName: "Test data variable 2",
        dataElementId: "DE2",
        schema: { id: UNIFIED_SCHEMA_ID, version: "1.5" },
        data: { _unifiedjsqeonly: { vendor: { name: "name1" } } },
      });
    });
  });

  describe("schema version notice", () => {
    it("shows warning when the schema version changed", async () => {
      await init(
        {
          dataElementId: "DE1",
          schema: { id: UNIFIED_SCHEMA_ID, version: "1.1" },
          data: {},
        },
        ...updateVariableHandlers(allVariables),
      );
      await editor.tree.node("xdm").expectExists();
      await alert("schemaChangedNotice").expectVisible();
    });

    it("doesn't show warning when the schema version is the same", async () => {
      await init(
        {
          dataElementId: "DE3",
          schema: { id: "sch123", version: "1.0" },
          data: {},
        },
        ...updateVariableHandlers(allVariables),
      );
      await editor.tree.node("xdm").expectExists();
      await alert("schemaChangedNotice").expectHidden();
    });
  });

  describe("unreadable schemas", () => {
    const handlers = () =>
      updateVariableHandlers(allVariables, {
        unreadableSchemas: ["sch123", "sch456"],
      });

    // Known app bug: when the schema of a data element picked in the combo box
    // fails to load and no schema has loaded earlier in the view, updateVariableView
    // only sets the `context.schemaLoadFailed` ref (updateVariableView.jsx:96).
    // No state changes, so nothing re-renders and the view stays on the loading
    // spinner without the alert. (After any successful load the stale
    // `context.schema` makes the view re-render and the alert shows.) The plain
    // `it` pins today's behavior; the `it.fails` holds the intended behavior and
    // starts failing (flip it to `it`, delete the other) once the bug is fixed.
    const selectUnreadableDataElement = async () => {
      await init(null, ...handlers());
      let onResponse;
      const schemaRequestAnswered = new Promise((resolve) => {
        onResponse = ({ request, response }) => {
          if (
            request.url.includes("/schemaregistry/tenant/schemas/sch123") &&
            response.status === 404
          ) {
            resolve();
          }
        };
        worker.events.on("response:mocked", onResponse);
      });
      try {
        await selectDataElement("Test data variable 3");
        await schemaRequestAnswered;
      } finally {
        worker.events.removeListener("response:mocked", onResponse);
      }
    };

    it("currently stays on the loading spinner when the selected data element's schema cannot be loaded", async () => {
      await selectUnreadableDataElement();
      await expect
        .element(view.getByRole("progressbar", { name: "Loading..." }))
        .toBeVisible();
      await expect
        .element(view.getByTestId("dataElementSchemaMissingAlert"))
        .not.toBeInTheDocument();
    });

    it.fails(
      "shows info message when selected data element's schema cannot be loaded",
      async () => {
        await selectUnreadableDataElement();
        await alert("dataElementSchemaMissingAlert").expectVisible();
      },
    );

    it("shows info message when initialized with data element whose schema cannot be loaded", async () => {
      await init(
        {
          dataElementId: "DE3",
          schema: { id: "sch123", version: "1.0" },
          data: {},
        },
        ...handlers(),
      );
      await alert("dataElementSchemaMissingAlert").expectVisible();
    });

    it("alert disappears when selecting element with readable schema, and reappears when selecting one without", async () => {
      await init(
        {
          dataElementId: "DE3",
          schema: { id: "sch123", version: "1.0" },
          data: {},
        },
        ...handlers(),
      );
      await alert("dataElementSchemaMissingAlert").expectVisible();

      await selectDataElement("Test data variable 1");
      await editor.tree.node("xdm").expectExists();
      await alert("dataElementSchemaMissingAlert").expectHidden();

      await selectDataElement("Test data variable 4");
      await alert("dataElementSchemaMissingAlert").expectVisible();
    });
  });

  describe("keeping data when changing data elements", () => {
    const sch456Schema = { id: "sch456", version: "1.0" };

    it("keeps data around when changing data elements and schema objects", async () => {
      await init(null, ...updateVariableHandlers(allVariables));
      await selectDataElement("Test data variable 4");
      await editor.tree.node("testField").click();
      await editor.string.enterValue("myvalue1");
      await editor.tree.node("otherField").click();
      await editor.string.enterValue("myvalue2");

      await selectDataElement("Test data variable 3");
      await editor.tree.node("testField").click();
      await editor.string.expectValue("myvalue1");
      await editor.tree.node("otherField").expectNotExists();

      await selectDataElement("Test data variable 4");
      await editor.tree.node("testField").click();
      await editor.string.expectValue("myvalue1");
      await editor.tree.node("otherField").click();
      await editor.string.expectValue("myvalue2");

      await driver.expectSettings().toEqual({
        dataElementName: "Test data variable 4",
        dataElementId: "DE4",
        schema: sch456Schema,
        data: { testField: "myvalue1", otherField: "myvalue2" },
      });
    });

    it("keeps data around when data element is no longer found", async () => {
      await init(
        {
          dataElementId: "not_found",
          schema: sch456Schema,
          data: { testField: "myvalue1", otherField: "myvalue2" },
        },
        ...updateVariableHandlers(allVariables),
      );
      await selectDataElement("Test data variable 4");
      await editor.tree.node("testField").click();
      await editor.string.expectValue("myvalue1");
      await editor.tree.node("otherField").click();
      await editor.string.expectValue("myvalue2");

      await driver.expectSettings().toEqual({
        dataElementName: "Test data variable 4",
        dataElementId: "DE4",
        schema: sch456Schema,
        data: { testField: "myvalue1", otherField: "myvalue2" },
      });
    });

    it("keeps data around when changing data elements and schema arrays", async () => {
      await init(null, ...updateVariableHandlers(allVariables));
      await selectDataElement("Test data variable 6");
      await editor.tree.node("xdm").click();
      await editor.array.addItem();
      await editor.array.addItem();
      await editor.tree.node("Item 1").expand();
      await editor.tree.node(["Item 1", "testField"]).click();
      await editor.string.enterValue("myvalue1");
      await editor.tree.node(["Item 1", "otherField"]).click();
      await editor.string.enterValue("myvalue2");
      await editor.tree.node("Item 2").expand();
      await editor.tree.node(["Item 2", "testField"]).click();
      await editor.string.enterValue("myvalue3");
      await editor.tree.node(["Item 2", "otherField"]).click();
      await editor.string.enterValue("myvalue4");

      await selectDataElement("Test data variable 5");
      await driver.expectSettings().toEqual({
        dataElementName: "Test data variable 5",
        dataElementId: "DE5",
        schema: { id: "sch789", version: "1.0" },
        data: [{ testField: "myvalue1" }, { testField: "myvalue3" }],
      });
      await editor.tree.node("Item 1").expand();
      await editor.tree.node(["Item 1", "testField"]).click();
      await editor.string.expectValue("myvalue1");
      await editor.tree.node(["Item 1", "otherField"]).expectNotExists();
      await editor.tree.node("Item 2").expand();
      await editor.tree.node(["Item 2", "testField"]).click();
      await editor.string.expectValue("myvalue3");
      await editor.tree.node(["Item 2", "otherField"]).expectNotExists();

      await editor.tree.node("xdm").click();
      await editor.array.removeItem(0);
      await selectDataElement("Test data variable 6");
      await editor.tree.node("Item 1").expand();
      await editor.tree.node(["Item 1", "testField"]).click();
      await editor.string.expectValue("myvalue3");
      await editor.tree.node(["Item 1", "otherField"]).click();
      await editor.string.expectValue("myvalue4");
    });
  });

  describe("searching", () => {
    it("allows you to search for data elements", async () => {
      await init(null, ...updateVariableHandlers(allVariables));
      const input = view.getByTestId("dataElementField").locator("input");
      await input.fill("4");
      await expect
        .poll(() => dataElementField().getMenuOptionLabels())
        .toEqual(["Test data variable 4"]);
    });
  });
});
