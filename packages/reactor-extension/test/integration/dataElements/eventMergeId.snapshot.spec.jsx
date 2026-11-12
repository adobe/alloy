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
  disabledExtensionSettings,
} from "../helpers/mediaEventsFixtures";

vi.mock("../../../src/view/render", async () => ({
  default: (await import("../helpers/entryView")).captureRender,
}));

const View = await loadEntryView(
  () => import("../../../src/view/dataElements/eventMergeId"),
);

let bridge;
let driver;
let cleanup;

describe("Event merge ID settings snapshots", () => {
  beforeEach(async () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue(
      "00000000-0000-4000-8000-000000000001",
    );
    ({ bridge, driver, cleanup } = await useView(View));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("preserves a saved cache ID without generating a replacement", async () => {
    await driver.init({
      extensionSettings,
      settings: { cacheId: "11111111-1111-4111-8111-111111111111" },
    });
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it.each([
    ["rejects a new", null, false],
    ["accepts an existing empty", {}, true],
  ])(
    "%s data element when event merge is disabled",
    async (_, settings, valid) => {
      await driver.init({
        extensionSettings: disabledExtensionSettings,
        settings,
      });
      const registration = await bridge.registration;
      expect(await registration.getSettings()).toEqual({
        cacheId: "00000000-0000-4000-8000-000000000001",
      });
      expect(await registration.validate()).toBe(valid);
      expect(await registration.getSettings()).toEqual({
        cacheId: "00000000-0000-4000-8000-000000000001",
      });
    },
  );
});
