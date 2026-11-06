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
  () => import("../../../src/view/dataElements/qoeDetailsDataElement"),
);

const populated = {
  bitrate: 320,
  droppedFrames: 2,
  framesPerSecond: 29.97,
  timeToStart: 500,
};

it("Quality of experience settings snapshots", async () => {
  expect.hasAssertions();
  await snapshotMediaEventsCases(View, [
    {
      name: "round trips new settings",
      settings: null,
      snapshot: false,
      verify: async ({ bridge }) => {
        await expectMediaEventsSettings(bridge, {});
      },
    },
    ...[
      ["bitrate", ""],
      ["bitrate", "-1"],
    ].map(([name, value], index) => ({
      name: `${name} > sets the numeric value to ${JSON.stringify(value)}`,
      settings: populated,
      reuse: index > 0,
      edit: async ({ view }) => {
        const control = field(view.getByTestId(`${name}NumberField`));
        await control.fill(value);
        return () => control.fill(String(populated[name]));
      },
      verify:
        value === ""
          ? async ({ view, bridge }) => {
              await field(view.getByTestId("bitrateNumberField")).fill("320");
              await [
                [
                  "droppedFrames",
                  "Please provide the dropped frames (int) as a number.",
                ],
                [
                  "framesPerSecond",
                  "Please provide the frames per second as a number.",
                ],
                [
                  "timeToStart",
                  "Please provide the time to start (milliseconds) as a number.",
                ],
              ].reduce(async (previous, [key, message]) => {
                await previous;
                const control = field(view.getByTestId(`${key}NumberField`));
                await control.fill("");
                await expectMediaEventsSettings(
                  bridge,
                  { ...populated, [key]: NaN },
                  false,
                );
                await control.expectError(message);
                await control.fill(String(populated[key]));
              }, Promise.resolve());
            }
          : undefined,
    })),
    {
      name: 'sets the bitrate data element to "not a data element"',
      reuse: true,
      snapshot: false,
      edit: async ({ view }) => {
        await field(view.getByTestId("bitrateDataElementOption")).check();
        await field(view.getByTestId("bitrateDataElementField")).fill(
          "not a data element",
        );
      },
      verify: async ({ view, bridge }) => {
        const control = field(view.getByTestId("bitrateDataElementField"));
        await expectMediaEventsSettings(
          bridge,
          { ...populated, bitrate: "not a data element" },
          false,
        );
        await control.expectError("Please specify a data element.");
        await control.fill("%bitrate%");
        await expectMediaEventsSettings(bridge, {
          ...populated,
          bitrate: "%bitrate%",
        });
        await control.expectNotInvalid();
      },
    },
  ]);
});
