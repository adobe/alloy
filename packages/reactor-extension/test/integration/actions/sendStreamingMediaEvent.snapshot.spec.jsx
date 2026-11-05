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
import { http, HttpResponse } from "msw";
import useView from "../helpers/useView";
import loadEntryView from "../helpers/entryView";
import captureState from "../helpers/captureState";
import field from "../helpers/field";
import { suppressReactErrorBoundaryMessage } from "../helpers/errorSuppression";
import { worker } from "../helpers/mocks/browser";
import {
  extensionSettings,
  extensionModes,
  mediaSettings,
} from "../helpers/mediaEventsFixtures";

vi.mock("../../../src/view/render", async () => ({
  default: (await import("../helpers/entryView")).captureRender,
}));

const View = await loadEntryView(
  () => import("../../../src/view/actions/sendStreamingMediaEvent"),
);

let view;
let bridge;
let driver;
let cleanup;

describe("Send streaming media event settings snapshots", () => {
  beforeEach(async () => {
    ({ view, bridge, driver, cleanup } = await useView(View));
  });

  afterEach(() => cleanup());

  it.each([
    ["new", null],
    ["empty", {}],
    ...Object.entries(mediaSettings),
    [
      "data elements",
      {
        eventType: "media.chapterStart",
        playerId: "%player%",
        xdm: {
          mediaCollection: {
            chapterDetails: "%chapter%",
            customMetadata: "%metadata%",
          },
        },
      },
    ],
    [
      "negative chapter length",
      {
        eventType: "media.chapterStart",
        playerId: "player",
        xdm: {
          mediaCollection: {
            chapterDetails: { length: -1, index: 1, offset: 0 },
          },
        },
      },
    ],
  ])("round trips %s settings", async (_, settings) => {
    await driver.init({
      extensionSettings,
      settings: structuredClone(settings),
    });
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it.each([
    "media.sessionStart",
    "media.adStart",
    "media.adBreakStart",
    "media.chapterStart",
    "media.error",
    "media.statesUpdate",
    "media.bitrateChange",
  ])("validates empty %s details", async (eventType) => {
    await driver.init({
      extensionSettings,
      settings: { ...mediaSettings.minimal, eventType },
    });
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  describe.each([
    ["eventTypeField", ["%edited%", "", "not a data element"]],
    ["playerIdTextField", ["%edited%", "", "not a data element"]],
    ["playheadTextField", ["%edited%", "", "not a data element"]],
    ["sessionDetails.contentTypeField", ["%edited%", "", "not a data element"]],
    ["sessionDetails.lengthNumberField", ["25", "", "-1"]],
    ["sessionDetails.nameTextField", ["%edited%", "", "not a data element"]],
  ])("session %s", (testId, values) => {
    it.each(values)("sets the value to %j", async (value) => {
      await driver.init({
        extensionSettings,
        settings: structuredClone(mediaSettings.session),
      });
      await field(view.getByTestId(testId)).fill(value);
      expect(await captureState(bridge)).toMatchSnapshot();
    });
  });

  it("turns off automatic media session handling", async () => {
    await driver.init({
      extensionSettings,
      settings: structuredClone(mediaSettings.session),
    });
    await field(
      view.getByTestId("handleMediaSessionAutomaticallyCheckbox"),
    ).uncheck();
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it.each(["sessionDetails", "customMetadata"])(
    "provides %s through a data element",
    async (name) => {
      if (name === "sessionDetails") {
        suppressReactErrorBoundaryMessage();
      }
      await driver.init({
        extensionSettings,
        settings: structuredClone(mediaSettings.session),
      });
      await field(view.getByTestId(`${name}DataElementOption`)).check();
      await field(view.getByTestId(`${name}DataElementField`)).fill("%edited%");
      expect(await captureState(bridge)).toMatchSnapshot();
    },
  );

  it.each(["", "not a data element", "%edited%"])(
    "provides session length through data element %j",
    async (value) => {
      await driver.init({
        extensionSettings,
        settings: structuredClone(mediaSettings.session),
      });
      await field(
        view.getByTestId("sessionDetails.lengthDataElementOption"),
      ).check();
      await field(
        view.getByTestId("sessionDetails.lengthDataElementField"),
      ).fill(value);
      expect(await captureState(bridge)).toMatchSnapshot();
    },
  );

  it.each([
    ["eventTypeField", "Chapter start"],
    ["sessionDetails.contentTypeField", "Video-on-demand"],
    ["sessionDetails.adLoadField", "Other (custom/dynamic ads)"],
  ])("selects %s option %s", async (testId, option) => {
    await driver.init({
      extensionSettings,
      settings: structuredClone(mediaSettings.session),
    });
    await field(view.getByTestId(testId)).selectOption(option);
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("switches SDK instances", async () => {
    const datastream = (id, title) => ({
      data: {
        title,
        enabled: true,
        settings: {
          com_adobe_analytics: { enabled: true, reportSuites: ["suite"] },
          com_adobe_target: { enabled: true },
          com_adobe_experience_platform: {
            enabled: true,
            datasets: { event: [{ datasetId: "dataset", primary: true }] },
          },
        },
      },
      sandboxName: "prod",
      _system: { id },
    });
    const recordsUrl =
      "https://edge.adobe.io/metadata/namespaces/edge/datasets/datastreams/records/";
    worker.use(
      http.get(recordsUrl, ({ request }) =>
        HttpResponse.json({
          _embedded: {
            records:
              request.headers.get("x-sandbox-name") === "prod"
                ? [
                    datastream("ds-prod", "Production stream"),
                    datastream("ds-staging", "Staging stream"),
                    datastream("ds-development", "Development stream"),
                  ]
                : [],
          },
        }),
      ),
      http.get(`${recordsUrl}:id`, ({ params }) =>
        HttpResponse.json(datastream(params.id, `${params.id} stream`)),
      ),
    );
    await driver.init({
      company: { orgId: "PARITY@AdobeOrg" },
      extensionSettings,
      settings: structuredClone(mediaSettings.session),
    });
    await field(view.getByTestId("instanceNamePicker")).selectOption("alloy");
    await field(
      view.getByTestId("sessionDetails.channelTextField"),
    ).expectValue("Web");
    await field(view.getByTestId("datastreamId")).expectValue(
      "Development stream",
    );
    await expect
      .element(
        view.getByRole("combobox", {
          name: "Report suite override #3",
          exact: true,
        }),
      )
      .toHaveAccessibleDescription(/Overrides report suites: "suite"/);
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("adds an empty custom metadata row", async () => {
    await driver.init({
      extensionSettings,
      settings: structuredClone(mediaSettings.session),
    });
    await view.getByTestId("customMetadataAddButton").click();
    await expect
      .element(view.getByTestId("customMetadata.2.nameTextField"))
      .toBeVisible();
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("removes the first custom metadata row", async () => {
    await driver.init({
      extensionSettings,
      settings: structuredClone(mediaSettings.session),
    });
    await view.getByTestId("customMetadata0RemoveButton").click();
    await field(view.getByTestId("customMetadata.0.nameTextField")).expectValue(
      "country",
    );
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it.each(extensionModes)("round trips with %s", async (_, context) => {
    await driver.init({
      extensionSettings: context,
      settings: structuredClone(mediaSettings.minimal),
    });
    expect(await captureState(bridge)).toMatchSnapshot();
  });
});
