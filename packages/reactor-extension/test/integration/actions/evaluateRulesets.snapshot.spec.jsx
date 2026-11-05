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
  () => import("../../../src/view/actions/evaluateRulesets"),
);
const populated = {
  instanceName: "secondary",
  renderDecisions: true,
  personalization: {
    decisionContext: { country: "US", cart: "%cart%", empty: "" },
  },
};
let view;
let bridge;
let driver;
let cleanup;

describe("Evaluate rulesets settings snapshots", () => {
  beforeEach(async () => {
    ({ view, bridge, driver, cleanup } = await useView(View));
  });
  afterEach(() => cleanup());

  it.each([
    ["new", null],
    ["empty", {}],
    ["minimal", { instanceName: "alloy" }],
    ["populated", populated],
    ["data element", { personalization: { decisionContext: "%context%" } }],
  ])("round trips %s settings", async (_, settings) => {
    await driver.init({ extensionSettings, settings });
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it.each(["Key0Field", "Value0Field", "Value2Field"])(
    "edits, clears, and invalidates %s",
    async (id) => {
      await driver.init({ extensionSettings, settings: populated });
      await field(view.getByTestId(id)).fill("%edited%");
      expect(await captureState(bridge)).toMatchSnapshot();
      await field(view.getByTestId(id)).fill("");
      expect(await captureState(bridge)).toMatchSnapshot();
      await field(view.getByTestId(id)).fill("not a data element");
      expect(await captureState(bridge)).toMatchSnapshot();
    },
  );

  it.each([
    "decisionContextAddButton",
    "decisionContext0RemoveButton",
    "renderDecisionsCheckbox",
  ])("clicks %s", async (id) => {
    await driver.init({ extensionSettings, settings: populated });
    await field(view.getByTestId(id)).click();
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("rejects duplicate keys", async () => {
    await driver.init({ extensionSettings, settings: populated });
    const key = await field(view.getByTestId("Key0Field")).getValue();
    await field(view.getByTestId("Key1Field")).fill(key);
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("keeps a blank row before an invalid context item", async () => {
    await driver.init({ extensionSettings, settings: null });
    await view.getByTestId("decisionContextAddButton").click();
    await field(view.getByTestId("Value1Field")).fill("value");
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("switches context to empty, invalid, and valid data elements", async () => {
    await driver.init({ extensionSettings, settings: populated });
    await field(view.getByTestId("decisionContextDataElementOption")).click();
    expect(await captureState(bridge)).toMatchSnapshot();
    await field(view.getByTestId("decisionContextDataElementField")).fill(
      "not a data element",
    );
    expect(await captureState(bridge)).toMatchSnapshot();
    await field(view.getByTestId("decisionContextDataElementField")).fill(
      "%edited%",
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
