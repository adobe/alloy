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
import { extensionSettings } from "../helpers/actionsSnapshots";

vi.mock("../../../src/view/render", async () => ({
  default: (await import("../helpers/entryView")).captureRender,
}));
const View = await loadEntryView(
  () => import("../../../src/view/actions/sendPushSubscription"),
);
let bridge;
let driver;
let cleanup;

describe("Send push subscription settings snapshots", () => {
  beforeEach(async () => {
    ({ bridge, driver, cleanup } = await useView(View));
  });
  afterEach(() => cleanup());

  it.each([["populated", { instanceName: "secondary" }]])(
    "round trips %s settings",
    async (_, settings) => {
      await driver.init({ extensionSettings, settings });
      expect(await captureState(bridge)).toMatchSnapshot();
    },
  );
});
