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

import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";

import useView from "../helpers/useView";
import loadEntryView from "../helpers/entryView";
import captureState from "../helpers/captureState";
import field from "../helpers/field";
import { extensionSettings, modes } from "../helpers/actionsSnapshots";

vi.mock("../../../src/view/render", async () => ({
  default: (await import("../helpers/entryView")).captureRender,
}));

const View = await loadEntryView(
  () => import("../../../src/view/actions/applyPropositions"),
);

const populated = {
  instanceName: "secondary",
  propositions: "%event.propositions%",
  viewName: "checkout",
  metadata: {
    home: { selector: "#home", actionType: "setHtml" },
    checkout: { selector: ".cart", actionType: "appendHtml" },
  },
};

let view;
let bridge;
let driver;
let cleanup;

describe("Apply propositions settings snapshots", () => {
  beforeEach(async () => {
    ({ view, bridge, driver, cleanup } = await useView(View));
  });

  afterEach(() => {
    cleanup();
  });

  it.each([
    ["new", null],
    ["empty", {}],
    ["view name", { viewName: "hello" }],
    [
      "populated",
      {
        instanceName: "alloy",
        propositions: "%props%",
        viewName: "hello",
        metadata: {
          scope1: { selector: "#a", actionType: "setHtml" },
        },
      },
    ],
  ])("round trips %s settings", async (_, settings) => {
    await driver.init({ extensionSettings, settings });
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("clears the view name", async () => {
    await driver.init({ extensionSettings, settings: { viewName: "hello" } });
    await field(view.getByTestId("viewNameTextField")).clear();
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("rejects an invalid propositions data element", async () => {
    await driver.init({ extensionSettings, settings: null });
    const propositions = field(view.getByTestId("propositionsTextField"));
    await propositions.fill("not a data element");
    await propositions.blur();
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it.each([
    ["minimal", { instanceName: "alloy" }],
    ["all fields", populated],
    [
      "data elements",
      { propositions: "%props%", viewName: "%view%", metadata: "%metadata%" },
    ],
    [
      "partial metadata row",
      { metadata: { home: { selector: "", actionType: "setHtml" } } },
    ],
  ])("round trips %s settings", async (_, settings) => {
    await driver.init({ extensionSettings, settings });
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it.each([
    "propositionsTextField",
    "viewNameTextField",
    "metadata.0.scopeTextField",
    "metadata.0.selectorTextField",
    "metadata.0.actionTypeField",
  ])("edits, clears, and invalidates %s", async (id) => {
    await driver.init({ extensionSettings, settings: populated });
    await field(view.getByTestId(id)).fill("%edited%");
    expect(await captureState(bridge)).toMatchSnapshot();
    await field(view.getByTestId(id)).fill("");
    expect(await captureState(bridge)).toMatchSnapshot();
    await field(view.getByTestId(id)).fill("not a data element");
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it.each(["metadataAddButton", "metadata0RemoveButton"])(
    "clicks %s",
    async (id) => {
      await driver.init({ extensionSettings, settings: populated });
      await view.getByTestId(id).click();
      expect(await captureState(bridge)).toMatchSnapshot();
    },
  );

  it("keeps a blank metadata row before an invalid row", async () => {
    await driver.init({ extensionSettings, settings: null });
    await view.getByTestId("metadataAddButton").click();
    await field(view.getByTestId("metadata.1.scopeTextField")).fill("home");
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("rejects duplicate scopes", async () => {
    await driver.init({ extensionSettings, settings: populated });
    const scope = await field(
      view.getByTestId("metadata.0.scopeTextField"),
    ).getValue();
    await field(view.getByTestId("metadata.1.scopeTextField")).fill(scope);
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("switches metadata to empty, invalid, and valid data elements", async () => {
    await driver.init({ extensionSettings, settings: populated });
    await field(view.getByTestId("metadataDataElementOption")).click();
    expect(await captureState(bridge)).toMatchSnapshot();
    await field(view.getByTestId("metadataDataElementField")).fill(
      "not a data element",
    );
    expect(await captureState(bridge)).toMatchSnapshot();
    await field(view.getByTestId("metadataDataElementField")).fill("%edited%");
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("selects a metadata action", async () => {
    await driver.init({ extensionSettings, settings: populated });
    await field(view.getByTestId("metadata.0.actionTypeField")).selectOption(
      "Replace HTML",
    );
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("switches instances", async () => {
    await driver.init({ extensionSettings, settings: populated });
    await field(view.getByTestId("instanceNamePicker")).selectOption("alloy");
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it.each(modes)("round trips with %s", async (_, configuration) => {
    await driver.init({
      extensionSettings: configuration,
      settings: { instanceName: "alloy" },
    });
    expect(await captureState(bridge)).toMatchSnapshot();
  });
});
