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
import {
  extensionSettings,
  extensionModes,
} from "../helpers/mediaEventsFixtures";

vi.mock("../../../src/view/render", async () => ({
  default: (await import("../helpers/entryView")).captureRender,
}));

const View = await loadEntryView(
  () => import("../../../src/view/dataElements/eventMergeId"),
);

const saved = { cacheId: "11111111-1111-4111-8111-111111111111" };
let view;
let bridge;
let driver;
let cleanup;

describe("Event merge ID settings snapshots", () => {
  beforeEach(async () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue(
      "00000000-0000-4000-8000-000000000001",
    );
    ({ view, bridge, driver, cleanup } = await useView(View));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it.each([
    ["new", null],
    ["empty", {}],
    ["minimal", saved],
    ["populated", { cacheId: "22222222-2222-4222-8222-222222222222" }],
  ])("round trips %s settings without editable fields", async (_, settings) => {
    await driver.init({ extensionSettings, settings });
    await expect
      .element(view.getByText("No configuration necessary."))
      .toBeVisible();
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  describe.each(extensionModes)("with %s", (_, context) => {
    it.each([
      ["new", null],
      ["empty", {}],
      ["saved", saved],
    ])("captures %s settings", async (_, settings) => {
      await driver.init({ extensionSettings: context, settings });
      expect(await captureState(bridge)).toMatchSnapshot();
    });
  });
});
