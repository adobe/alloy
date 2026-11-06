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
import { extensionSettings } from "../helpers/actionsSnapshots";

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
const editable = {
  ...populated,
  metadata: { checkout: populated.metadata.checkout },
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
    ["view name", { viewName: "hello" }],
    [
      "data elements",
      { propositions: "%props%", viewName: "%view%", metadata: "%metadata%" },
    ],
  ])("round trips %s settings", async (_, settings) => {
    await driver.init({ extensionSettings, settings });
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("edits, clears, and invalidates metadata.0.scopeTextField", async () => {
    await driver.init({ extensionSettings, settings: editable });
    const scope = field(view.getByTestId("metadata.0.scopeTextField"));
    await scope.fill("%edited%");
    expect(await captureState(bridge)).toMatchSnapshot();
    await scope.fill("");
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("edits, clears, and invalidates metadata.0.actionTypeField", async () => {
    await driver.init({ extensionSettings, settings: editable });
    const action = field(view.getByTestId("metadata.0.actionTypeField"));
    await action.fill("%edited%");
    expect(await captureState(bridge)).toMatchSnapshot();
    await action.fill("");
    expect(await captureState(bridge)).toMatchSnapshot();
    await action.fill("not a data element");
    expect(await captureState(bridge)).toMatchSnapshot();
  });

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
});
