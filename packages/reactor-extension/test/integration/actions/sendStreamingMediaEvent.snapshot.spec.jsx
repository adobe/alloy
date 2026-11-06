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
import { worker } from "../helpers/mocks/browser";
import { suppressReactErrorBoundaryMessage } from "../helpers/errorSuppression";
import {
  mediaSettings,
  extensionSettings,
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
    ["populated session", mediaSettings.session],
    [
      "chapter and metadata data elements",
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

  it("reports required session fields with automatic handling turned off", async () => {
    await driver.init({
      extensionSettings,
      settings: {
        eventType: "media.sessionStart",
        playerId: "player",
        handleMediaSessionAutomatically: true,
      },
    });
    await field(
      view.getByTestId("handleMediaSessionAutomaticallyCheckbox"),
    ).uncheck();
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it.each([
    ["ad", "media.adStart"],
    ["ad break", "media.adBreakStart"],
    ["chapter", "media.chapterStart"],
    ["error", "media.error"],
  ])("reports required %s details", async (_, eventType) => {
    await driver.init({
      extensionSettings,
      settings: { eventType, playerId: "player" },
    });
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("round trips populated started and ended states", async () => {
    await driver.init({ extensionSettings, settings: mediaSettings.states });
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("omits empty started and ended state arrays", async () => {
    await driver.init({
      extensionSettings,
      settings: { eventType: "media.statesUpdate", playerId: "player" },
    });
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("rejects an unknown event type and accepts a data element event type", async () => {
    await driver.init({
      extensionSettings,
      settings: structuredClone(mediaSettings.session),
    });
    const control = field(view.getByTestId("eventTypeField"));
    await control.fill("not a data element");
    expect(await captureState(bridge)).toMatchSnapshot();

    await control.fill("%edited%");
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("rejects a negative session length and accepts length supplied by a data element", async () => {
    await driver.init({
      extensionSettings,
      settings: structuredClone(mediaSettings.session),
    });
    const length = field(view.getByTestId("sessionDetails.lengthNumberField"));
    await length.fill("-1");
    expect(await captureState(bridge)).toMatchSnapshot();

    await length.fill("120");
    await field(
      view.getByTestId("sessionDetails.lengthDataElementOption"),
    ).check();
    await field(view.getByTestId("sessionDetails.lengthDataElementField")).fill(
      "%edited%",
    );
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("switches SDK instances and reports the new datastream's report-suite restriction", async () => {
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

  it("serializes a custom metadata data element but fails validation without visible errors", async () => {
    await driver.init({
      extensionSettings,
      settings: structuredClone(mediaSettings.session),
    });
    await field(view.getByTestId("customMetadataDataElementOption")).check();
    await field(view.getByTestId("customMetadataDataElementField")).fill(
      "%edited%",
    );
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("throws from both settings reads when whole session details come from a data element", async () => {
    await driver.init({
      extensionSettings,
      settings: structuredClone(mediaSettings.session),
    });
    await field(view.getByTestId("sessionDetailsDataElementOption")).check();
    await field(view.getByTestId("sessionDetailsDataElementField")).fill(
      "%edited%",
    );
    suppressReactErrorBoundaryMessage();
    expect(await captureState(bridge)).toMatchSnapshot();
  });
});
