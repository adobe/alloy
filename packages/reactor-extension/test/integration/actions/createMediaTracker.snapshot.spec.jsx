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
import { extensionSettings } from "../helpers/mediaEventsFixtures";

vi.mock("../../../src/view/render", async () => ({
  default: (await import("../helpers/entryView")).captureRender,
}));

const View = await loadEntryView(
  () => import("../../../src/view/actions/createMediaTracker"),
);

let view;
let bridge;
let driver;
let cleanup;

describe("Create media tracker settings snapshots", () => {
  beforeEach(async () => {
    ({ view, bridge, driver, cleanup } = await useView(View));
  });

  afterEach(() => cleanup());

  it("round trips the saved API export and restores the default when its name is cleared", async () => {
    await driver.init({
      extensionSettings,
      settings: { instanceName: "secondary", objectName: "LegacyMedia" },
    });
    expect(await captureState(bridge)).toMatchSnapshot();

    await field(view.getByTestId("objectNameTextField")).clear();
    const registration = await bridge.registration;
    expect(await registration.getSettings()).toEqual({
      instanceName: "secondary",
    });
    expect(await registration.validate()).toBe(true);
    expect(await registration.getSettings()).toEqual({
      instanceName: "secondary",
    });
  });
});
