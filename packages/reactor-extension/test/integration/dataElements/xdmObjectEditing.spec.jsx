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

import { afterEach, describe, expect, it, onTestFinished } from "vitest";
import { page } from "vitest/browser";
import { expectData } from "../helpers/objectEditor";
import { suppressReactErrorBoundaryMessage } from "../helpers/errorSuppression";
import openXdmObject from "../helpers/dataElements/openXdmObject";

let result;

const open = async (options) => {
  result = await openXdmObject(options);
  return result;
};

const expandVendor = async (tree) => {
  await tree.node("_unifiedjsqeonly").expand();
  await tree.node("vendor").expand();
};

// At 400px tall the expanded tree only overflows by ~200px, which isn't enough
// to push the node under test out of view; 150px makes the page scrollable
// enough without padding the schema.
const useShortViewport = async () => {
  await page.viewport(1000, 150);
  onTestFinished(() => page.viewport(1000, 1000));
};

const vendorData = (vendor) => ({ _unifiedjsqeonly: { vendor } });

describe("XDM object editing", () => {
  afterEach(() => {
    result?.cleanup();
    result = undefined;
  });

  describe("saved values", () => {
    it("initializes form fields with individual object attribute values", async () => {
      const { editor } = await open({ data: vendorData({ name: "Adobe" }) });
      await expandVendor(editor.tree);
      await editor.tree.node("name").click();
      await editor.string.expectValue("Adobe");
    });

    it("initializes form fields with whole object value", async () => {
      const { editor } = await open({ data: vendorData("%vendor%") });
      await editor.tree.node("_unifiedjsqeonly").expand();
      await editor.tree.node("vendor").click();
      await editor.object.expectWholeSelected();
      await editor.object.expectValue("%vendor%");
    });

    it("initializes form fields with individual array items", async () => {
      const { editor } = await open({
        data: vendorData({ industries: ["%industry%"] }),
      });
      await expandVendor(editor.tree);
      await editor.tree.node("industries").expand();
      await editor.tree.node("Item 1").click();
      await editor.array.expectValue("%industry%");
    });

    it("initializes form fields with whole array value", async () => {
      const { editor } = await open({
        data: vendorData({ industries: "%industries%" }),
      });
      await expandVendor(editor.tree);
      await editor.tree.node("industries").click();
      await editor.array.expectWholeSelected();
      await editor.array.expectValue("%industries%");
    });

    it("initializes form fields with string value", async () => {
      const { editor } = await open({ data: vendorData({ name: "%name%" }) });
      await expandVendor(editor.tree);
      await editor.tree.node("name").click();
      await editor.string.expectValue("%name%");
    });

    it("initializes form fields with integer value", async () => {
      const { editor } = await open({
        data: vendorData({ numEmployees: 123 }),
      });
      await expandVendor(editor.tree);
      await editor.tree.node("numEmployees").click();
      await editor.integer.expectValue("123");
    });

    it("initializes form fields with number value", async () => {
      const { editor } = await open({ data: vendorData({ revenue: 123.123 }) });
      await expandVendor(editor.tree);
      await editor.tree.node("revenue").click();
      await editor.number.expectValue("123.123");
    });

    it("initializes form fields with boolean data element value", async () => {
      const { editor } = await open({
        data: vendorData({ isLicensed: "%isLicensed%" }),
      });
      await expandVendor(editor.tree);
      await editor.tree.node("isLicensed").click();
      await editor.boolean.expectValue("%isLicensed%");
    });

    // Known src bug: boolean/populateInitialFormStateNode.js stores the saved
    // JS boolean instead of "true"/"false", so KeyedComboBox can't match it to
    // an item (and calls startsWith on it) and boolean/validate.js rejects it.
    // Selecting the node crashes the view. The plain `it` pins today's
    // behavior; the `it.fails` holds the intended behavior and starts
    // failing (flip it to `it`, delete the other) once the bug is fixed.
    describe.each([true, false])("saved boolean constant %s", (isLicensed) => {
      const selectIsLicensed = async () => {
        const { editor, view, driver } = await open({
          data: vendorData({ isLicensed }),
        });
        await expandVendor(editor.tree);
        await editor.tree.node("isLicensed").expectExists();
        await editor.tree.node("isLicensed").click();
        return { editor, view, driver };
      };

      it("currently crashes the view when its node is selected", async () => {
        suppressReactErrorBoundaryMessage();
        const { view } = await selectIsLicensed();
        await expect
          .element(view.getByTestId("errorBoundaryMessage"))
          .toBeVisible();
      });

      it.fails(
        "initializes form fields with the boolean constant value",
        async () => {
          suppressReactErrorBoundaryMessage();
          const { editor, driver } = await selectIsLicensed();
          if (isLicensed) {
            await editor.boolean.expectTrue();
          } else {
            await editor.boolean.expectFalse();
          }
          await driver.expectValidate().toBe(true);
          await expectData(driver, vendorData({ isLicensed }));
        },
      );
    });

    it("initializes form fields with enum value", async () => {
      const { editor } = await open({
        data: { environment: { type: "application" } },
      });
      await editor.tree.node("environment").expand();
      await editor.tree.node("type").click();
      await editor.enum.expectValue("Application");
    });

    it("initializes form fields with custom enum value", async () => {
      const { editor } = await open({
        data: { environment: { type: "%customType%" } },
      });
      await editor.tree.node("environment").expand();
      await editor.tree.node("type").click();
      await editor.enum.expectValue("%customType%");
    });
  });

  describe("arrays", () => {
    it("allows user to provide individual array items", async () => {
      await useShortViewport();
      const { editor, driver, selectSchema } = await open();
      const { tree } = editor;
      await selectSchema();
      await expandVendor(tree);
      await tree.node("industries").click();
      await editor.array.addItem();

      // Removing an item must work as well.
      await editor.array.addItem();
      await editor.array.removeItem(0);
      await editor.array.expectItemCount(1);

      await tree.node("Item 1").scrollAway();
      await editor.array.selectItem(0);
      // Selecting the item scrolls its tree node into view.
      await tree.node("Item 1").expectInViewport();
      await editor.array.enterValue("%industry%");

      await driver.expectValidate().toBe(true);
      await expectData(driver, vendorData({ industries: ["%industry%"] }));
    });

    it("arrays using whole population strategy do not have children", async () => {
      const { editor, selectSchema } = await open();
      const { tree } = editor;
      await selectSchema();
      await expandVendor(tree);
      await tree.node("industries").click();
      await editor.array.selectParts();
      await editor.array.addItem();
      await tree.node("Item 1").expectExists();
      await editor.array.selectWhole();
      await tree.node("Item 1").expectNotExists();
    });

    it("arrays with a whole population strategy ancestor do not have children", async () => {
      const { editor, selectSchema } = await open();
      const { tree } = editor;
      await selectSchema();
      await expandVendor(tree);
      await tree.node("industries").click();
      await editor.array.selectParts();
      await editor.array.addItem();
      await tree.node("Item 1").expectExists();
      await tree.node("vendor").click();
      await editor.object.selectWhole();
      await tree.node("Item 1").expectNotExists();
    });
  });

  describe("value types", () => {
    it("allows user to provide value for property with number type", async () => {
      const { editor, driver, selectSchema } = await open();
      await selectSchema();
      await expandVendor(editor.tree);
      await editor.tree.node("revenue").click();
      await editor.number.enterValue("123.123");

      await driver.expectValidate().toBe(true);
      await expectData(driver, vendorData({ revenue: 123.123 }));
    });

    it("allows user to enter data element value for property with boolean type", async () => {
      const { editor, driver, selectSchema } = await open();
      await selectSchema();
      await expandVendor(editor.tree);
      await editor.tree.node("isLicensed").click();
      await editor.boolean.enterCustomValue("%isLicensed%");

      await driver.expectValidate().toBe(true);
      await expectData(driver, vendorData({ isLicensed: "%isLicensed%" }));
    });

    it("allows user to select true constant value for property with boolean type", async () => {
      const { editor, driver, selectSchema } = await open();
      await selectSchema();
      await expandVendor(editor.tree);
      await editor.tree.node("isLicensed").click();
      await editor.boolean.selectTrue();

      await driver.expectValidate().toBe(true);
      await expectData(driver, vendorData({ isLicensed: true }));
    });

    it("allows user to select false constant value for property with boolean type", async () => {
      const { editor, driver, selectSchema } = await open();
      await selectSchema();
      await expandVendor(editor.tree);
      await editor.tree.node("isLicensed").click();
      await editor.boolean.selectFalse();

      await driver.expectValidate().toBe(true);
      await expectData(driver, vendorData({ isLicensed: false }));
    });

    it("allows user to select enum value for property with enum type", async () => {
      const { editor, driver, selectSchema } = await open();
      await selectSchema();
      await editor.tree.node("environment").expand();
      await editor.tree.node("type").click();
      await editor.enum.select("Browser");

      await driver.expectValidate().toBe(true);
      await expectData(driver, { environment: { type: "browser" } });
    });

    it("invalidates enum property with custom value", async () => {
      const { editor, driver, selectSchema } = await open();
      await selectSchema();
      await editor.tree.node("environment").expand();
      await editor.tree.node("type").click();
      await editor.enum.enterCustomValue("custom type");

      await driver.expectValidate().toBe(false);
      await editor.enum.expectError(
        "Value must be a data element or one of the listed values.",
      );
    });

    it("allows user to enter data element for enum property", async () => {
      const { editor, driver, selectSchema } = await open();
      await selectSchema();
      await editor.tree.node("environment").expand();
      await editor.tree.node("type").click();
      await editor.enum.enterCustomValue("%dataElement%");

      await driver.expectValidate().toBe(true);
      await expectData(driver, { environment: { type: "%dataElement%" } });
    });
  });

  describe("auto-populated fields", () => {
    it("does not allow editing _id", async () => {
      const { editor, selectSchema } = await open();
      await selectSchema();
      await editor.tree.node("_id").click();
      await editor.nodeEdit.autoPopulationAlert.expectVisible();
      await editor.string.expectHidden();
    });

    it("allows editing context fields", async () => {
      const { editor, selectSchema } = await open();
      await selectSchema();
      await editor.tree.node("environment").expand();
      await editor.tree.node("type").click();
      await editor.string.expectVisible();
    });
  });

  describe("navigation", () => {
    it("clicking a breadcrumb item selects the item", async () => {
      await useShortViewport();
      const { editor, selectSchema } = await open();
      const { tree } = editor;
      await selectSchema();
      await expandVendor(tree);
      await tree.node("industries").click();
      await tree.node("vendor").scrollAway();
      await editor.nodeEdit.breadcrumb.clickItem("vendor");
      await tree.node("vendor").expectSelected();
      await tree.node("vendor").expectInViewport();
      await tree.node("industries").expectExists();
    });

    it("clicking a tree node should select and expand the node", async () => {
      const { editor, selectSchema } = await open();
      await selectSchema();
      await editor.tree.node("_unifiedjsqeonly").click();
      await editor.tree.node("_unifiedjsqeonly").expectSelected();
      await editor.tree.node("vendor").expectExists();
    });

    it("orders eVars numerically", async () => {
      const { editor, selectAnalyticsMigrationSchema } = await open();
      const { tree } = editor;
      await selectAnalyticsMigrationSchema();
      await tree.node("_experience").expand();
      await tree.node("analytics").expand();
      await tree.node("customDimensions").expand();
      await tree.node("eVars").expand();
      await tree.node("eVar12").expectExists();
      const names = tree.nodeNames();
      const first = names.indexOf("eVar1");
      expect(names.slice(first, first + 12)).toEqual(
        Array.from({ length: 12 }, (_, i) => `eVar${i + 1}`),
      );
    });
  });

  describe("field descriptions", () => {
    it("shows information icon for fields with descriptions", async () => {
      const { editor, selectSchema } = await open();
      const { description } = editor.nodeEdit;
      await selectSchema();
      await editor.tree.node("device").expand();
      await editor.tree.node("colorDepth").click();
      await description.expectInfoIcon();
      await description.open();
      await description.expectPopoverText("Color depth");
      await description.expectPopoverText(
        "The number of colors the display is able to represent.",
      );
      await description.close();
      await description.expectPopoverClosed();
    });

    it("node description popover shows field name when no display name is provided", async () => {
      const { editor, selectSchema } = await open();
      const { description } = editor.nodeEdit;
      await selectSchema();
      await editor.tree.node("_experience").expand();
      await editor.tree.node("decisioning").expand();
      await editor.tree.node("propositionAction").expand();
      await editor.tree.node("label").click();
      await description.expectInfoIcon();
      await description.open();
      await description.expectPopoverText("label");
      await description.expectPopoverText(
        "The label of the proposition action.",
      );
    });

    it("does not show information icon for fields without descriptions", async () => {
      const { editor, selectSchema } = await open();
      await selectSchema();
      await expandVendor(editor.tree);
      await editor.tree.node("name").click();
      await editor.string.expectVisible();
      await editor.nodeEdit.description.expectNoInfoIcon();
    });
  });

  it("shows clear button for string input fields and clears value when clicked", async () => {
    const { editor, selectSchema } = await open();
    const { clearButton } = editor.nodeEdit;
    await selectSchema();
    await expandVendor(editor.tree);
    await editor.tree.node("name").click();

    await editor.string.enterValue("Adobe");
    await editor.string.expectValue("Adobe");
    await clearButton.expectVisible();
    await clearButton.expectEnabled();
    await clearButton.click();
    await editor.string.expectValue("");
    await clearButton.expectDisabled();
  });
});
