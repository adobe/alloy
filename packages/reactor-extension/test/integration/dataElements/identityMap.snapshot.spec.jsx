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
import { http, HttpResponse } from "msw";
import useView from "../helpers/useView";
import loadEntryView from "../helpers/entryView";
import captureState from "../helpers/captureState";
import field from "../helpers/field";
import { worker } from "../helpers/mocks/browser";
import {
  extensionSettings,
  extensionModes,
} from "../helpers/dataElementsSnapshot";

vi.mock("../../../src/view/render", async () => ({
  default: (await import("../helpers/entryView")).captureRender,
}));

const View = await loadEntryView(
  () => import("../../../src/view/dataElements/identityMap"),
);

const minimal = {
  Email: [
    {
      id: "person@example.com",
      authenticatedState: "ambiguous",
      primary: false,
    },
  ],
};
const populated = {
  Email: [
    { id: "%email%", authenticatedState: "authenticated", primary: true },
    {
      id: "other@example.com",
      authenticatedState: "loggedOut",
      primary: false,
    },
  ],
  CRM: [{ id: "123", authenticatedState: "ambiguous", primary: false }],
};

let view;
let bridge;
let driver;
let cleanup;

describe("Identity map settings snapshots", () => {
  beforeEach(async () => {
    worker.use(
      http.get(
        "https://platform.adobe.io/data/core/idnamespace/identities",
        () =>
          HttpResponse.json(
            ["Email", "CRM", "ECID", "AAID"].map((code, index) => ({
              code,
              id: index + 1,
              name: code,
              status: "ACTIVE",
            })),
          ),
      ),
    );
    ({ view, bridge, driver, cleanup } = await useView(View));
  });

  afterEach(() => cleanup());

  it.each([
    ["new", null],
    ["minimal", minimal],
    ["populated", populated],
    [
      "empty ID",
      { Email: [{ id: "", authenticatedState: "ambiguous", primary: false }] },
    ],
    ["forbidden ECID", { ECID: [{ id: "123", primary: true }] }],
  ])("round trips %s settings", async (_, settings) => {
    await driver.init({ extensionSettings, settings });
    await expect.element(view.getByTestId("addIdentityButton")).toBeVisible();
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  // S2 Tabs throws from updateOverflow when the saved map has no identities.
  it.todo("round trips empty settings");

  it("round trips duplicate primary identifiers settings", async () => {
    await driver.init({
      extensionSettings,
      settings: {
        Email: [
          { id: "a", primary: true },
          { id: "b", primary: true },
        ],
      },
    });
    expect(await captureState(bridge)).toMatchSnapshot();
    await expect
      .element(view.getByText("Only one identifier can be primary."))
      .toBeVisible();
  });

  it.each(extensionModes)(
    "round trips minimal settings with %s",
    async (_, mode) => {
      await driver.init({ extensionSettings: mode, settings: minimal });
      expect(await captureState(bridge)).toMatchSnapshot();
    },
  );

  it.each(["%edited%", "", "not a data element"])(
    "edits the namespace to %j",
    async (value) => {
      await driver.init({ extensionSettings, settings: populated });
      await field(view.getByTestId("namespace0Combobox")).fill(value);
      expect(await captureState(bridge)).toMatchSnapshot();
    },
  );

  it.each(["%edited%", "", "not a data element"])(
    "edits the ID to %j",
    async (value) => {
      await driver.init({ extensionSettings, settings: populated });
      await field(view.getByTestId("identity0idField0")).fill(value);
      expect(await captureState(bridge)).toMatchSnapshot();
    },
  );

  it("makes an identifier in another namespace primary", async () => {
    await driver.init({ extensionSettings, settings: populated });
    await field(view.getByTestId("identity0primaryField0")).check();
    expect(await captureState(bridge)).toMatchSnapshot();
    await expect
      .element(view.getByText("Only one identifier can be primary."))
      .toBeVisible();
  });

  it("changes the authenticated state", async () => {
    await driver.init({ extensionSettings, settings: populated });
    await field(
      view.getByTestId("identity0authenticatedStateField0"),
    ).selectOption("Authenticated");
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("adds an identifier", async () => {
    await driver.init({ extensionSettings, settings: populated });
    await view.getByTestId("addIdentifier0Button").click();
    await field(view.getByTestId("identity0idField1")).fill("%newId%");
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("validates an empty added identifier", async () => {
    await driver.init({ extensionSettings, settings: populated });
    await view.getByTestId("addIdentifier0Button").click();
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("adds a custom namespace", async () => {
    await driver.init({ extensionSettings, settings: populated });
    await view.getByTestId("addIdentityButton").click();
    await field(view.getByTestId("namespace2Combobox")).fill("NewNamespace");
    await field(view.getByTestId("identity2idField0")).fill("%id%");
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("validates an empty added identity", async () => {
    await driver.init({ extensionSettings, settings: populated });
    await view.getByTestId("addIdentityButton").click();
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("deletes an identity", async () => {
    await driver.init({ extensionSettings, settings: populated });
    await view.getByTestId("deleteIdentity0Button").click();
    await expect
      .element(view.getByRole("tab", { name: "CRM", exact: true }))
      .not.toBeInTheDocument();
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("clears the first ID in the second identity", async () => {
    await driver.init({ extensionSettings, settings: populated });
    await view.getByRole("tab", { name: "Email", exact: true }).click();
    await field(view.getByTestId("identity1idField0")).clear();
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("makes the second identifier primary", async () => {
    await driver.init({ extensionSettings, settings: populated });
    await view.getByRole("tab", { name: "Email", exact: true }).click();
    await field(view.getByTestId("identity1primaryField1")).check();
    expect(await captureState(bridge)).toMatchSnapshot();
    await expect
      .element(view.getByText("Only one identifier can be primary."))
      .toBeVisible();
  });

  it("deletes an identifier", async () => {
    await driver.init({ extensionSettings, settings: populated });
    await view.getByRole("tab", { name: "Email", exact: true }).click();
    await view.getByTestId("deleteIdentifier1Button0").click();
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("rejects duplicate namespaces", async () => {
    await driver.init({ extensionSettings, settings: populated });
    await field(view.getByTestId("namespace0Combobox")).selectOption("Email");
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("populates an ID through the extension bridge", async () => {
    await driver.init({ extensionSettings, settings: minimal });
    await view
      .getByRole("button", { name: "Select data element", exact: true })
      .last()
      .click();
    expect(await captureState(bridge)).toMatchSnapshot();
  });
});
