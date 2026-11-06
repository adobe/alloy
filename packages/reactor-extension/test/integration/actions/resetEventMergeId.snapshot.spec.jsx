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
  extensionModes,
  snapshotMediaEventsCases,
  expectMediaEventsSettings,
} from "../helpers/mediaEventsFixtures";

vi.mock("../../../src/view/render", async () => ({
  default: (await import("../helpers/entryView")).captureRender,
}));

const View = await loadEntryView(
  () => import("../../../src/view/actions/resetEventMergeId"),
);

it("Reset event merge ID settings snapshots", async () => {
  expect.hasAssertions();
  await snapshotMediaEventsCases(View, [
    {
      name: "round trips new settings",
      settings: null,
      snapshot: false,
      verify: async ({ view, bridge }) => {
        await expectMediaEventsSettings(bridge, {}, false);
        await field(view.getByTestId("eventMergeIdTextField")).expectError(
          "Please provide a event merge id.",
        );
      },
    },
    {
      name: "round trips populated settings",
      settings: { eventMergeId: "%event.id%" },
      fresh: true,
    },
    {
      name: "round trips invalid settings",
      settings: { eventMergeId: "not a data element" },
      snapshot: false,
      verify: async ({ view, bridge }) => {
        await expectMediaEventsSettings(
          bridge,
          { eventMergeId: "not a data element" },
          false,
        );
        await field(view.getByTestId("eventMergeIdTextField")).expectError(
          "Please specify a data element.",
        );
        await view
          .getByRole("button", { name: "Select data element", exact: true })
          .click();
        await field(view.getByTestId("eventMergeIdTextField")).expectValue(
          "%data element name%",
        );
        await expectMediaEventsSettings(bridge, {
          eventMergeId: "%data element name%",
        });
        await field(
          view.getByTestId("eventMergeIdTextField"),
        ).expectNotInvalid();
      },
    },
    {
      name: "round trips with components disabled",
      settings: { eventMergeId: "%merge%" },
      context: extensionModes[0][1],
      snapshot: false,
      verify: async ({ bridge }) => {
        await expectMediaEventsSettings(bridge, {});
      },
    },
  ]);
});
