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

  it("omits unset optional QoE measurements", async () => {
    await driver.init({ extensionSettings, settings: null });
    const registration = await bridge.registration;
    expect(await registration.getSettings()).toEqual({});
    expect(await registration.validate()).toBe(true);
    expect(await registration.getSettings()).toEqual({});
  });

  it("serializes a cleared bitrate as NaN and reports its number error", async () => {
    await driver.init({ extensionSettings, settings: populated });
    await field(view.getByTestId("bitrateNumberField")).fill("");
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it.each([
    [
      "dropped frames",
      "droppedFramesNumberField",
      {
        bitrate: 320,
        droppedFrames: NaN,
        framesPerSecond: 29.97,
        timeToStart: 500,
      },
      "Please provide the dropped frames (int) as a number.",
    ],
    [
      "frames per second",
      "framesPerSecondNumberField",
      {
        bitrate: 320,
        droppedFrames: 2,
        framesPerSecond: NaN,
        timeToStart: 500,
      },
      "Please provide the frames per second as a number.",
    ],
    [
      "time to start",
      "timeToStartNumberField",
      {
        bitrate: 320,
        droppedFrames: 2,
        framesPerSecond: 29.97,
        timeToStart: NaN,
      },
      "Please provide the time to start (milliseconds) as a number.",
    ],
  ])(
    "serializes cleared %s as NaN and reports its number error",
    async (_, testId, expected, message) => {
      await driver.init({ extensionSettings, settings: populated });
      const control = field(view.getByTestId(testId));
      await control.fill("");
      const registration = await bridge.registration;
      expect(await registration.getSettings()).toEqual(expected);
      expect(await registration.validate()).toBe(false);
      expect(await registration.getSettings()).toEqual(expected);
      await control.expectError(message);
    },
  );

  it("accepts a negative bitrate without a visible validation error", async () => {
    await driver.init({ extensionSettings, settings: populated });
    await field(view.getByTestId("bitrateNumberField")).fill("-1");
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("switches bitrate to a data element and corrects an invalid token", async () => {
    await driver.init({ extensionSettings, settings: populated });
    await field(view.getByTestId("bitrateDataElementOption")).check();
    const control = field(view.getByTestId("bitrateDataElementField"));
    await control.fill("not a data element");
    const registration = await bridge.registration;
    expect(await registration.getSettings()).toEqual({
      bitrate: "not a data element",
      droppedFrames: 2,
      framesPerSecond: 29.97,
      timeToStart: 500,
    });
    expect(await registration.validate()).toBe(false);
    expect(await registration.getSettings()).toEqual({
      bitrate: "not a data element",
      droppedFrames: 2,
      framesPerSecond: 29.97,
      timeToStart: 500,
    });
    await control.expectError("Please specify a data element.");

    await control.fill("%bitrate%");
    expect(await registration.getSettings()).toEqual({
      bitrate: "%bitrate%",
      droppedFrames: 2,
      framesPerSecond: 29.97,
      timeToStart: 500,
    });
    expect(await registration.validate()).toBe(true);
    expect(await registration.getSettings()).toEqual({
      bitrate: "%bitrate%",
      droppedFrames: 2,
      framesPerSecond: 29.97,
      timeToStart: 500,
    });
    await control.expectNotInvalid();
  });
});
