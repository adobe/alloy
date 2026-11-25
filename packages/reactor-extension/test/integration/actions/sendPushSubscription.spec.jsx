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

import { afterEach, beforeEach, describe, it, vi } from "vitest";
import useView from "../helpers/useView";
import loadEntryView from "../helpers/entryView";
import field from "../helpers/field";
import { runRequiredComponentTests } from "../helpers/actions/requiredComponentTests";

vi.mock("../../../src/view/render", async () => ({
  default: (await import("../helpers/entryView")).captureRender,
}));
const View = await loadEntryView(
  () => import("../../../src/view/actions/sendPushSubscription"),
);

const extensionSettings = {
  instances: [{ name: "alloy1" }, { name: "alloy2" }],
  components: { pushNotifications: true },
};

describe("Send push subscription action", () => {
  let view;
  let driver;
  let cleanup;

  beforeEach(async () => {
    ({ view, driver, cleanup } = await useView(View));
  });

  afterEach(() => cleanup());

  it("initializes form fields with settings", async () => {
    await driver.init({
      extensionSettings,
      settings: { instanceName: "alloy2" },
    });

    await field(view.getByTestId("instanceNamePicker")).expectValue("alloy2");
  });

  it("returns valid settings", async () => {
    await driver.init({ extensionSettings, settings: {} });

    await field(view.getByTestId("instanceNamePicker")).selectOption("alloy2");

    await driver.expectValidate().toBe(true);
    await driver.expectSettings().toEqual({ instanceName: "alloy2" });
  });

  it("defaults to the first instance name", async () => {
    await driver.init({ extensionSettings, settings: {} });

    await field(view.getByTestId("instanceNamePicker")).expectValue("alloy1");
    await driver.expectValidate().toBe(true);
    await driver.expectSettings().toEqual({ instanceName: "alloy1" });
  });
});

runRequiredComponentTests({
  openView: () => useView(View),
  requiredComponent: "pushNotifications",
  minimumValidSettings: { instanceName: "alloy" },
  formTestId: "instanceNamePicker",
  blocksNewAction: false,
});
