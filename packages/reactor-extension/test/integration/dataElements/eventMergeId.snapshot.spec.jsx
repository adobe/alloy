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

import { it, expect, vi } from "vitest";
import loadEntryView from "../helpers/entryView";
import {
  extensionModes,
  snapshotMediaEventsCases,
  expectMediaEventsSettings,
} from "../helpers/mediaEventsFixtures";

vi.mock("../../../src/view/render", async () => ({
  default: (await import("../helpers/entryView")).captureRender,
}));

const View = await loadEntryView(
  () => import("../../../src/view/dataElements/eventMergeId"),
);

const saved = { cacheId: "11111111-1111-4111-8111-111111111111" };

it("Event merge ID settings snapshots", async () => {
  expect.hasAssertions();
  vi.spyOn(crypto, "randomUUID").mockReturnValue(
    "00000000-0000-4000-8000-000000000001",
  );
  try {
    await snapshotMediaEventsCases(View, [
      {
        name: "round trips minimal settings without editable fields",
        settings: saved,
      },
      {
        name: "with components disabled > captures new settings",
        context: extensionModes[0][1],
        settings: null,
        snapshot: false,
        verify: async ({ bridge }) => {
          await expectMediaEventsSettings(
            bridge,
            { cacheId: "00000000-0000-4000-8000-000000000001" },
            false,
          );
        },
      },
      {
        name: "with components disabled > captures empty settings",
        context: extensionModes[0][1],
        settings: {},
        snapshot: false,
        verify: async ({ bridge }) => {
          await expectMediaEventsSettings(bridge, {
            cacheId: "00000000-0000-4000-8000-000000000001",
          });
        },
      },
    ]);
  } finally {
    vi.restoreAllMocks();
  }
});
