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
  () => import("../../../src/view/events/monitorTriggered"),
);

let view;
let bridge;
let driver;
let cleanup;

describe("Monitor triggered settings snapshots", () => {
  beforeEach(async () => {
    ({ view, bridge, driver, cleanup } = await useView(View));
  });

  afterEach(() => cleanup());

  it("requires a monitoring hook for a new event", async () => {
    await driver.init({ extensionSettings, settings: null });
    const registration = await bridge.registration;
    expect(await registration.getSettings()).toEqual({});
    expect(await registration.validate()).toBe(false);
    expect(await registration.getSettings()).toEqual({});
    await field(view.getByTestId("nameField")).expectError(
      "Please choose a monitoring hook.",
    );
  });

  it("round trips a monitoring hook supplied by a data element", async () => {
    await driver.init({ extensionSettings, settings: { name: "%hook%" } });
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("rejects an unknown hook and accepts a hook selected from the list", async () => {
    await driver.init({ extensionSettings, settings: { name: "not-a-hook" } });
    const registration = await bridge.registration;
    expect(await registration.getSettings()).toEqual({ name: "not-a-hook" });
    expect(await registration.validate()).toBe(false);
    expect(await registration.getSettings()).toEqual({ name: "not-a-hook" });
    const control = field(view.getByTestId("nameField"));
    await control.expectError(
      "Please choose a monitoring hook from the list or specify a single data element.",
    );

    await control.selectOption("onNetworkResponse");
    expect(await registration.getSettings()).toEqual({
      name: "onNetworkResponse",
    });
    expect(await registration.validate()).toBe(true);
    expect(await registration.getSettings()).toEqual({
      name: "onNetworkResponse",
    });
    await control.expectNotInvalid();
  });
});
