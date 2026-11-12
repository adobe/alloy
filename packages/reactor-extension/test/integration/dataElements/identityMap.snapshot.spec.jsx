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
  reinitialize,
} from "../helpers/dataElementsSnapshot";

vi.mock("../../../src/view/render", async () => ({
  default: (await import("../helpers/entryView")).captureRender,
}));

const View = await loadEntryView(
  () => import("../../../src/view/dataElements/identityMap"),
);

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

  it("round trips new settings", async () => {
    await driver.init({ extensionSettings, settings: null });
    await expect.element(view.getByTestId("addIdentityButton")).toBeVisible();
    expect(await captureState(bridge)).toMatchSnapshot();
    const settings = { ECID: [{ id: "123", primary: true }] };
    await reinitialize(driver, settings);
    await driver.expectSettings().toEqual(settings);
    const registration = await bridge.registration;
    expect(await registration.validate()).toBe(false);
    await field(view.getByTestId("namespace0Combobox")).expectError(
      "ECID is not allowed",
    );
  });

  // S2 Tabs throws from updateOverflow when the saved map has no identities.
  it.todo("round trips empty settings");

  it("makes an identifier in another namespace primary", async () => {
    await driver.init({ extensionSettings, settings: populated });
    await field(view.getByTestId("identity0primaryField0")).check();
    expect(await captureState(bridge)).toMatchSnapshot();
    await expect
      .element(view.getByText("Only one identifier can be primary."))
      .toBeVisible();
    await view.getByRole("tab", { name: "CRM", exact: true }).click();
    await field(view.getByTestId("identity0primaryField0")).uncheck();
    await field(view.getByTestId("namespace0Combobox")).selectOption("Email");
    const registration = await bridge.registration;
    expect(await registration.validate()).toBe(false);
    await view.getByRole("tab", { name: "Email", exact: true }).nth(1).click();
    await expect.element(view.getByTestId("namespace1Combobox")).toBeVisible();
    await field(view.getByTestId("namespace1Combobox")).expectError(
      "Please provide a unique namespace.",
    );
    await driver.expectSettings().toEqual({ Email: populated.Email });
  });

  it("adds a custom namespace", async () => {
    await driver.init({ extensionSettings, settings: populated });
    await view.getByTestId("addIdentityButton").click();
    await field(view.getByTestId("namespace2Combobox")).fill("NewNamespace");
    await field(view.getByTestId("identity2idField0")).fill("%id%");
    expect(await captureState(bridge)).toMatchSnapshot();
    await field(view.getByTestId("namespace2Combobox")).fill("%edited%");
    await driver
      .expectSettings((settings) => settings["%edited%"])
      .toEqual([
        { id: "%id%", authenticatedState: "ambiguous", primary: false },
      ]);
    await view.getByTestId("deleteIdentity2Button").click();
    await view.getByTestId("addIdentifier0Button").click();
    await field(view.getByTestId("identity0idField1")).fill("%newId%");
    await driver
      .expectSettings((settings) => settings.CRM[1])
      .toEqual({
        id: "%newId%",
        authenticatedState: "ambiguous",
        primary: false,
      });
    await field(
      view.getByTestId("identity0authenticatedStateField1"),
    ).selectOption("Authenticated");
    await view
      .getByRole("button", { name: "Select data element", exact: true })
      .last()
      .click();
    await driver
      .expectSettings((settings) => settings.CRM[1])
      .toEqual({
        id: "%data element name%",
        authenticatedState: "authenticated",
        primary: false,
      });
    await view.getByTestId("deleteIdentity0Button").click();
    await expect
      .element(view.getByRole("tab", { name: "CRM", exact: true }))
      .not.toBeInTheDocument();
    await driver.expectSettings().toEqual({ Email: populated.Email });
    await view.getByTestId("deleteIdentifier0Button0").click();
    await driver.expectSettings().toEqual({ Email: [populated.Email[1]] });
  });
});
