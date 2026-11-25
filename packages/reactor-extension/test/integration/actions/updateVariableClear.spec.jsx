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
import UpdateVariableView from "../../../src/view/actions/updateVariableView";
import field from "../helpers/field";
import { worker } from "../helpers/mocks/browser";
import { createObjectEditor } from "../helpers/objectEditor";
import {
  UNIFIED_SCHEMA_ID,
  updateVariableHandlers,
} from "../helpers/mocks/updateVariable/handlers";

const unifiedSchema = { id: UNIFIED_SCHEMA_ID, version: "1.5" };

let view;
let driver;
let cleanup;
let editor;

const init = async (settings) => {
  ({ view, driver, cleanup } = await useView(UpdateVariableView));
  editor = createObjectEditor(view);
  await driver.init({ settings });
};

const clearField = () => field(view.getByTestId("clearField"));
const dataElementField = () => field(view.getByTestId("dataElementField"));

describe("Update variable action clear checkbox", () => {
  beforeEach(() => {
    worker.use(...updateVariableHandlers(["sde1", "sde2", "de1", "de2"]));
  });

  afterEach(() => {
    if (cleanup) cleanup();
  });

  describe("clearing", () => {
    it("allows the user to clear an element for an XDM variable", async () => {
      await init(null);
      await dataElementField().selectOption("Test data variable 2");
      await editor.tree.node("xdm").expectExists();
      await editor.tree.node("_unifiedjsqeonly").expand();
      await editor.tree.node(["_unifiedjsqeonly", "vendor"]).click();
      await clearField().check();

      await driver.expectSettings().toEqual({
        dataElementName: "Test data variable 2",
        dataElementId: "DE2",
        schema: unifiedSchema,
        data: {},
        transforms: { "_unifiedjsqeonly.vendor": { clear: true } },
      });
    });

    it("allows the user to clear an element for a DATA variable", async () => {
      await init(null);
      await dataElementField().selectOption("Test solutions variable 2");
      // The only solution (target) is selected automatically, and clicking a
      // selected tree node would deselect it.
      await editor.tree.node("target").expectSelected();
      await clearField().check();

      await driver.expectSettings().toEqual({
        dataElementName: "Test solutions variable 2",
        dataElementId: "SDE2",
        data: {},
        transforms: { "__adobe.target": { clear: true } },
      });
    });

    it("allows the user to clear the root element for an XDM variable", async () => {
      await init(null);
      await dataElementField().selectOption("Test data variable 2");
      await editor.tree.node("xdm").click();
      await clearField().check();

      await driver.expectSettings().toEqual({
        dataElementName: "Test data variable 2",
        dataElementId: "DE2",
        schema: unifiedSchema,
        data: {},
        transforms: { "": { clear: true } },
      });
    });

    it("allows the user to clear the root element for a DATA variable", async () => {
      await init(null);
      await dataElementField().selectOption("Test solutions variable 2");
      await editor.tree.node("data").click();
      await clearField().check();

      await driver.expectSettings().toEqual({
        dataElementName: "Test solutions variable 2",
        dataElementId: "SDE2",
        data: {},
        transforms: { "": { clear: true } },
      });
    });
  });

  describe("loading a cleared element", () => {
    it("allows a cleared element to be loaded for an XDM variable", async () => {
      await init({
        dataElementId: "DE2",
        data: {},
        transforms: { "_unifiedjsqeonly.vendor": { clear: true } },
      });
      await dataElementField().expectValue("Test data variable 2");
      await editor.tree.node("_unifiedjsqeonly").expand();
      await editor.tree.node(["_unifiedjsqeonly", "vendor"]).click();
      await clearField().expectChecked();
    });

    it("allows a cleared element to be loaded for a DATA variable", async () => {
      await init({
        dataElementId: "SDE1",
        data: {},
        transforms: { "__adobe.target": { clear: true } },
      });
      await dataElementField().expectValue("Test solutions variable 1");
      await editor.tree.node("target").click();
      await clearField().expectChecked();
    });

    it("allows the root cleared element to be loaded for XDM variables", async () => {
      await init({
        dataElementId: "DE2",
        data: {},
        transforms: { "": { clear: true } },
      });
      await dataElementField().expectValue("Test data variable 2");
      await editor.tree.node("xdm").click();
      await clearField().expectChecked();
    });

    it("allows the root cleared element to be loaded for DATA variables", async () => {
      await init({
        dataElementId: "SDE1",
        data: {},
        transforms: { "": { clear: true } },
      });
      await dataElementField().expectValue("Test solutions variable 1");
      await editor.tree.node("data").click();
      await clearField().expectChecked();
    });

    it("disables clear checkbox of sub-elements", async () => {
      await init({
        dataElementId: "DE2",
        data: {},
        transforms: { "_unifiedjsqeonly.vendor": { clear: true } },
      });
      await dataElementField().expectValue("Test data variable 2");
      await editor.tree.node("_unifiedjsqeonly").expand();
      await editor.tree.node(["_unifiedjsqeonly", "vendor"]).expand();
      await editor.tree.node(["vendor", "name"]).click();
      await clearField().expectChecked();
      await clearField().expectDisabled();
    });
  });
});
