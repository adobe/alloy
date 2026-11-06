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
  disabledExtensionSettings,
} from "../helpers/mediaEventsFixtures";

vi.mock("../../../src/view/render", async () => ({
  default: (await import("../helpers/entryView")).captureRender,
}));

const View = await loadEntryView(
  () => import("../../../src/view/actions/resetEventMergeId"),
);

let view;
let bridge;
let driver;
let cleanup;

describe("Reset event merge ID settings snapshots", () => {
  beforeEach(async () => {
    ({ view, bridge, driver, cleanup } = await useView(View));
  });

  afterEach(() => cleanup());

  it("requires an event merge ID for a new action", async () => {
    await driver.init({ extensionSettings, settings: null });
    const registration = await bridge.registration;
    expect(await registration.getSettings()).toEqual({});
    expect(await registration.validate()).toBe(false);
    expect(await registration.getSettings()).toEqual({});
    await field(view.getByTestId("eventMergeIdTextField")).expectError(
      "Please provide a event merge id.",
    );
  });

  it("round trips a saved event merge ID before the first validation", async () => {
    await driver.init({
      extensionSettings,
      settings: { eventMergeId: "%event.id%" },
    });
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("rejects an invalid data element and replaces it through the bridge selector", async () => {
    await driver.init({
      extensionSettings,
      settings: { eventMergeId: "not a data element" },
    });
    const registration = await bridge.registration;
    expect(await registration.getSettings()).toEqual({
      eventMergeId: "not a data element",
    });
    expect(await registration.validate()).toBe(false);
    expect(await registration.getSettings()).toEqual({
      eventMergeId: "not a data element",
    });
    await field(view.getByTestId("eventMergeIdTextField")).expectError(
      "Please specify a data element.",
    );

    await view
      .getByRole("button", { name: "Select data element", exact: true })
      .click();
    await field(view.getByTestId("eventMergeIdTextField")).expectValue(
      "%data element name%",
    );
    expect(await registration.getSettings()).toEqual({
      eventMergeId: "%data element name%",
    });
    expect(await registration.validate()).toBe(true);
    expect(await registration.getSettings()).toEqual({
      eventMergeId: "%data element name%",
    });
    await field(view.getByTestId("eventMergeIdTextField")).expectNotInvalid();
  });

  it("returns empty settings for an existing action when event merge is disabled", async () => {
    await driver.init({
      extensionSettings: disabledExtensionSettings,
      settings: { eventMergeId: "%merge%" },
    });
    const registration = await bridge.registration;
    expect(await registration.getSettings()).toEqual({});
    expect(await registration.validate()).toBe(true);
    expect(await registration.getSettings()).toEqual({});
  });
});
