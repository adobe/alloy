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

vi.mock("../../../src/view/render", async () => ({
  default: (await import("../helpers/entryView")).captureRender,
}));

const View = await loadEntryView(
  () => import("../../../src/view/actions/applyPropositions"),
);

const extensionSettings = {
  instances: [{ name: "alloy", edgeConfigId: "PR123" }],
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
});
