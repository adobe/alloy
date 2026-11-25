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

import { afterEach, describe, it } from "vitest";
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

describe("XDM object population indicator", () => {
  afterEach(() => {
    result?.cleanup();
    result = undefined;
  });

  it("shows empty population amount for _id", async () => {
    const { editor, selectSchema } = await open();
    await selectSchema();
    await editor.tree.node("_id").population.expectEmpty();
  });

  it("shows empty population amount for context fields", async () => {
    const { editor, selectSchema } = await open();
    await selectSchema();
    await editor.tree.node("environment").population.expectEmpty();
    await editor.tree.node("environment").expand();
    await editor.tree.node("type").population.expectEmpty();
  });

  it("shows correct population amount for data element objects", async () => {
    const { editor, selectSchema } = await open();
    const { tree } = editor;
    await selectSchema();
    await tree.node("_unifiedjsqeonly").expand();
    const vendor = tree.node("vendor");
    await vendor.population.expectEmpty();
    await vendor.expand();
    await vendor.click();
    const name = tree.node("name");
    await name.population.expectEmpty();
    await editor.object.selectWhole();
    await vendor.population.expectEmpty();
    await name.population.expectBlank();
    await editor.object.enterValue("%vendor%");
    await vendor.population.expectFull();
    await name.population.expectBlank();
  });

  it("shows partial population amount for objects", async () => {
    const { editor, selectSchema } = await open();
    await selectSchema();
    await expandVendor(editor.tree);
    await editor.tree.node("name").click();
    await editor.string.enterValue("Adobe");
    await editor.tree.node("vendor").population.expectPartial();
  });

  it("shows correct population amount for arrays", async () => {
    const { editor, selectSchema } = await open();
    const { tree } = editor;
    await selectSchema();
    await expandVendor(tree);
    const industries = tree.node("industries").population;
    await industries.expectEmpty();
    await tree.node("industries").click();
    await editor.array.addItem();
    await industries.expectEmpty();

    await editor.array.selectItem(0);
    await editor.string.enterValue("%industry%");
    await industries.expectFull();
    await tree.node("industries").click();
    await editor.array.addItem();
    await industries.expectPartial();
  });

  describe.each([
    {
      title: "whole array",
      name: "industries",
      set: async (editor) => {
        await editor.array.selectWhole();
        await editor.array.enterValue("%industries%");
      },
    },
    {
      title: "string value",
      name: "name",
      set: (editor) => editor.string.enterValue("%name%"),
    },
    {
      title: "integer value",
      name: "numEmployees",
      set: (editor) => editor.integer.enterValue("123"),
    },
    {
      title: "number value",
      name: "revenue",
      set: (editor) => editor.number.enterValue("123.123"),
    },
    {
      title: "boolean data element",
      name: "isLicensed",
      set: (editor) => editor.boolean.enterCustomValue("%isLicensed%"),
    },
    {
      title: "boolean true",
      name: "isLicensed",
      set: (editor) => editor.boolean.selectTrue(),
    },
    {
      title: "boolean false",
      name: "isLicensed",
      set: (editor) => editor.boolean.selectFalse(),
    },
  ])("for $title", ({ name, set }) => {
    it("shows full population amount once a value is set", async () => {
      const { editor, selectSchema } = await open();
      await selectSchema();
      await expandVendor(editor.tree);
      await editor.tree.node(name).click();
      const { population } = editor.tree.node(name);
      await population.expectEmpty();
      await set(editor);
      await population.expectFull();
    });
  });

  it("shows empty population indicator for booleans with No Value selected", async () => {
    const { editor, selectSchema } = await open();
    await selectSchema();
    await expandVendor(editor.tree);
    await editor.tree.node("isLicensed").click();
    await editor.tree.node("isLicensed").population.expectEmpty();
    await editor.boolean.selectTrue();
    await editor.tree.node("isLicensed").population.expectFull();
    await editor.nodeEdit.clearButton.click();
    await editor.tree.node("isLicensed").population.expectEmpty();
  });
});
