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
import field from "../helpers/field";
import {
  snapshotMediaEventsCases,
  expectMediaEventsSettings,
} from "../helpers/mediaEventsFixtures";

vi.mock("../../../src/view/render", async () => ({
  default: (await import("../helpers/entryView")).captureRender,
}));

const View = await loadEntryView(
  () => import("../../../src/view/actions/createMediaTracker"),
);

const populated = { instanceName: "secondary", objectName: "LegacyMedia" };

it("Create media tracker settings snapshots", async () => {
  expect.hasAssertions();
  await snapshotMediaEventsCases(View, [
    {
      name: "round trips populated settings",
      settings: populated,
      fresh: true,
      verify: async ({ view, bridge }) => {
        await field(view.getByTestId("objectNameTextField")).fill("");
        await expectMediaEventsSettings(bridge, { instanceName: "secondary" });
      },
    },
  ]);
});
