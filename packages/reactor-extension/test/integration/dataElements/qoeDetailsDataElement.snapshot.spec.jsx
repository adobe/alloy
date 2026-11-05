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
  extensionModes,
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
let view;
let bridge;
let driver;
let cleanup;

describe("Quality of experience settings snapshots", () => {
  beforeEach(async () => {
    ({ view, bridge, driver, cleanup } = await useView(View));
  });

  afterEach(() => cleanup());

  it.each([
    ["new", null],
    ["empty", {}],
    ["minimal", { bitrate: 0 }],
    ["populated", populated],
    [
      "data elements",
      {
        bitrate: "%bitrate%",
        droppedFrames: "%frames%",
        framesPerSecond: "%fps%",
        timeToStart: "%time%",
      },
    ],
    ["invalid data element", { bitrate: "not a data element" }],
  ])("round trips %s settings", async (_, settings) => {
    await driver.init({ extensionSettings, settings });
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  describe.each(["bitrate", "droppedFrames", "framesPerSecond", "timeToStart"])(
    "%s",
    (name) => {
      it.each(["25", "", "-1"])(
        "sets the numeric value to %j",
        async (value) => {
          await driver.init({ extensionSettings, settings: populated });
          await field(view.getByTestId(`${name}NumberField`)).fill(value);
          expect(await captureState(bridge)).toMatchSnapshot();
        },
      );

      it("switches to a data element", async () => {
        await driver.init({ extensionSettings, settings: populated });
        await field(view.getByTestId(`${name}DataElementOption`)).check();
        await field(view.getByTestId(`${name}DataElementField`)).fill(
          "%edited%",
        );
        expect(await captureState(bridge)).toMatchSnapshot();
      });
    },
  );

  it.each(["", "not a data element"])(
    "sets the bitrate data element to %j",
    async (value) => {
      await driver.init({ extensionSettings, settings: populated });
      await field(view.getByTestId("bitrateDataElementOption")).check();
      await field(view.getByTestId("bitrateDataElementField")).fill(value);
      expect(await captureState(bridge)).toMatchSnapshot();
    },
  );

  it.each(extensionModes)("round trips with %s", async (_, context) => {
    await driver.init({ extensionSettings: context, settings: { bitrate: 0 } });
    expect(await captureState(bridge)).toMatchSnapshot();
  });
});
