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

import { describe, it, beforeEach, afterEach, expect } from "vitest";
import { userEvent } from "vitest/browser";
import UpdateVariableView from "../../../src/view/actions/updateVariableView";
import useView from "../helpers/useView";
import captureState from "../helpers/captureState";
import field from "../helpers/field";
import { worker } from "../helpers/mocks/browser";
import {
  extensionSettings,
  extensionModes,
  schemaHandlers,
  dataElementHandlers,
  updateSettings,
  treeValueEdits,
  treeStructureEdits,
  selectTreeNode,
} from "../helpers/dataElementsSnapshot";

let view;
let bridge;
let driver;
let cleanup;

describe("Update variable settings snapshots", () => {
  beforeEach(async () => {
    worker.use(...schemaHandlers, ...dataElementHandlers);
    ({ view, bridge, driver, cleanup } = await useView(UpdateVariableView));
  });

  afterEach(() => cleanup());

  it.each([
    ["new", null],
    ["empty", {}],
    ["minimal", { dataElementName: "XDM variable" }],
    ["populated", updateSettings],
    [
      "legacy data element ID",
      { dataElementId: "DE1", data: { testField: "legacy" } },
    ],
    [
      "stale legacy ID",
      { dataElementId: "DE_STALE", data: { testField: "legacy" } },
    ],
    [
      "name preferred over ID",
      { dataElementName: "XDM variable", dataElementId: "DE2" },
    ],
    [
      "missing name falls back to ID",
      { dataElementName: "Missing variable", dataElementId: "DE1" },
    ],
    [
      "data variable",
      {
        dataElementName: "Data variable",
        data: {
          __adobe: {
            analytics: { pageName: "Home" },
            audienceManager: { d_uuid: "123" },
            target: { mbox: "home" },
          },
        },
      },
    ],
    [
      "lowercase audience manager",
      {
        dataElementName: "Data variable",
        data: { __adobe: { audiencemanager: { d_uuid: "123" } } },
      },
    ],
    [
      "clear transform",
      {
        dataElementName: "XDM variable",
        data: { testField: "new" },
        transforms: { count: { clear: true } },
      },
    ],
    [
      "root clear transform",
      { dataElementName: "XDM variable", transforms: { "": { clear: true } } },
    ],
    [
      "whole object data element",
      { dataElementName: "XDM variable", data: "%object%" },
    ],
  ])("round trips %s settings", async (_, settings) => {
    await driver.init({ extensionSettings, settings });
    await expect.element(view.getByTestId("dataElementField")).toBeVisible();
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it.each(extensionModes)(
    "round trips minimal settings with %s",
    async (_, mode) => {
      await driver.init({
        extensionSettings: mode,
        settings: { dataElementName: "XDM variable" },
      });
      expect(await captureState(bridge)).toMatchSnapshot();
    },
  );

  it.each(treeValueEdits)("edits %s to %j", async (name, value) => {
    await driver.init({ extensionSettings, settings: updateSettings });
    await selectTreeNode(view, name);
    await field(view.getByTestId("valueField")).fill(value);
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it.each(treeStructureEdits)("%s", async (_, edit) => {
    await driver.init({ extensionSettings, settings: updateSettings });
    await edit(view);
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("switches from an XDM variable to a Data variable", async () => {
    await driver.init({ extensionSettings, settings: updateSettings });
    await field(view.getByTestId("dataElementField")).selectOption(
      "Data variable",
    );
    await expect
      .element(
        view.getByRole("heading", { name: "Variable Editor", exact: true }),
      )
      .toBeVisible();
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("selects a data element for a new action", async () => {
    await driver.init({ extensionSettings, settings: null });
    await field(view.getByTestId("dataElementField")).selectOption(
      "XDM variable",
    );
    await expect
      .element(
        view
          .getByTestId("xdmTreeNodeTitleDisplayName")
          .getByText("testField", { exact: true }),
      )
      .toBeVisible();
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("blurs a cleared data element input", async () => {
    await driver.init({ extensionSettings, settings: updateSettings });
    await view.getByTestId("dataElementField").getByRole("combobox").clear();
    await userEvent.tab();
    await field(view.getByTestId("dataElementField")).expectValue(
      "XDM variable",
    );
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("clears a field through a transform", async () => {
    await driver.init({ extensionSettings, settings: updateSettings });
    await selectTreeNode(view, "count");
    await field(view.getByTestId("clearField")).check();
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("removes a saved clear transform", async () => {
    await driver.init({
      extensionSettings,
      settings: {
        dataElementName: "XDM variable",
        transforms: { count: { clear: true } },
      },
    });
    await selectTreeNode(view, "count");
    await field(view.getByTestId("clearField")).uncheck();
    await field(view.getByTestId("valueField")).fill("42");
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("edits custom code through the extension bridge", async () => {
    await driver.init({ extensionSettings, settings: updateSettings });
    bridge.openCodeEditorMock = async () => "content.xdm.count = 42;";
    await view.getByTestId("onBeforeEventSendEditButton").click();
    expect(await captureState(bridge)).toMatchSnapshot();
  });
});
