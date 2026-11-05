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
import {
  extensionSettings,
  extensionModes,
} from "../helpers/mediaEventsFixtures";

vi.mock("../../../src/view/render", async () => ({
  default: (await import("../helpers/entryView")).captureRender,
}));

const View = await loadEntryView(
  () => import("../../../src/view/events/subscribeRulesetItems"),
);

const populated = {
  instanceName: "secondary",
  schemas: [
    "https://ns.adobe.com/personalization/dom-action",
    "https://ns.adobe.com/personalization/json-content-item",
  ],
  surfaces: ["web://example.com/cart", "#hero"],
};
let view;
let bridge;
let driver;
let cleanup;

describe("Subscribe ruleset items settings snapshots", () => {
  beforeEach(async () => {
    ({ view, bridge, driver, cleanup } = await useView(View));
  });

  afterEach(() => cleanup());

  it.each([
    ["new", null],
    ["empty", {}],
    ["minimal", { instanceName: "alloy" }],
    ["populated", populated],
    ["data elements", { schemas: "%schemas%", surfaces: "%surfaces%" }],
    ["invalid surface", { surfaces: ["", "ftp://example.com"] }],
  ])("round trips %s settings", async (_, settings) => {
    await driver.init({ extensionSettings, settings });
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  describe.each(["schemas", "surfaces"])("%s", (name) => {
    describe.each([0, 1])("row %i", (index) => {
      it.each(["%edited%", "", "not a data element"])(
        "sets the value to %j",
        async (value) => {
          await driver.init({ extensionSettings, settings: populated });
          await field(view.getByTestId(`${name}${index}Field`)).fill(value);
          expect(await captureState(bridge)).toMatchSnapshot();
        },
      );
    });

    it("switches to a data element", async () => {
      await driver.init({ extensionSettings, settings: populated });
      await field(view.getByTestId(`${name}DataElementOption`)).check();
      await field(view.getByTestId(`${name}DataElementField`)).fill("%edited%");
      expect(await captureState(bridge)).toMatchSnapshot();
    });

    it("adds an empty row", async () => {
      await driver.init({ extensionSettings, settings: populated });
      await view.getByTestId(`${name}AddButton`).click();
      await expect.element(view.getByTestId(`${name}2Field`)).toBeVisible();
      expect(await captureState(bridge)).toMatchSnapshot();
    });

    it("removes the first row", async () => {
      await driver.init({ extensionSettings, settings: populated });
      await view.getByTestId(`${name}0RemoveButton`).click();
      await expect
        .element(view.getByTestId(`${name}1Field`))
        .not.toBeInTheDocument();
      expect(await captureState(bridge)).toMatchSnapshot();
    });
  });

  it.each(["", "not a data element"])(
    "sets the schemas data element to %j",
    async (value) => {
      await driver.init({ extensionSettings, settings: populated });
      await field(view.getByTestId("schemasDataElementOption")).check();
      await field(view.getByTestId("schemasDataElementField")).fill(value);
      expect(await captureState(bridge)).toMatchSnapshot();
    },
  );

  it("keeps surface error feedback on the second row after a blank first row", async () => {
    await driver.init({ extensionSettings, settings: null });
    await view.getByTestId("surfacesAddButton").click();
    await field(view.getByTestId("surfaces1Field")).fill("ftp://example.com");
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("switches SDK instances", async () => {
    await driver.init({ extensionSettings, settings: populated });
    await field(view.getByTestId("instanceNamePicker")).selectOption("alloy");
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it.each(extensionModes)("round trips with %s", async (_, context) => {
    await driver.init({
      extensionSettings: context,
      settings: { instanceName: "alloy" },
    });
    expect(await captureState(bridge)).toMatchSnapshot();
  });
});
