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
import { http, HttpResponse } from "msw";
import loadEntryView from "../helpers/entryView";
import field from "../helpers/field";
import { worker } from "../helpers/mocks/browser";
import {
  mediaSettings,
  extensionSettings,
  snapshotMediaEventsCases,
  expectMediaEventsSettings,
} from "../helpers/mediaEventsFixtures";

vi.mock("../../../src/view/render", async () => ({
  default: (await import("../helpers/entryView")).captureRender,
}));

const View = await loadEntryView(
  () => import("../../../src/view/actions/sendStreamingMediaEvent"),
);

const verifyEmptyMediaDetails = async ({ bridge, driver, view }) => {
  const registration = await bridge.registration;
  await [
    [
      "sessionStart",
      "sessionDetails",
      { playerName: undefined, appVersion: undefined, channel: undefined },
      [
        ["playheadTextField", "Please provide a playhead."],
        ["sessionDetails.contentTypeField", "Please choose a content type."],
        [
          "sessionDetails.lengthNumberField",
          "Please provide the clip length/runtime (seconds) as a number.",
        ],
        ["sessionDetails.nameTextField", "Please provide a content id."],
      ],
    ],
    [
      "adStart",
      "advertisingDetails",
      { playerName: undefined },
      [
        ["advertisingDetails.nameTextField", "Please provide a ad id."],
        [
          "advertisingDetails.lengthNumberField",
          "Please provide the ad length (seconds) as a number.",
        ],
        [
          "advertisingDetails.podPositionNumberField",
          "Please provide the pod position as a number.",
        ],
      ],
    ],
    [
      "adBreakStart",
      "advertisingPodDetails",
      {},
      [
        [
          "advertisingPodDetails.offsetNumberField",
          "Please provide the ad break offset (seconds) as a number.",
        ],
        [
          "advertisingPodDetails.indexNumberField",
          "Please provide the ad break index as a number.",
        ],
      ],
    ],
    [
      "chapterStart",
      "chapterDetails",
      {},
      [
        [
          "chapterDetails.lengthNumberField",
          "Please provide the chapter length as a number.",
        ],
        [
          "chapterDetails.indexNumberField",
          "Please provide the chapter index as a number.",
        ],
        [
          "chapterDetails.offsetNumberField",
          "Please provide the chapter offset as a number.",
        ],
      ],
    ],
    [
      "error",
      "errorDetails",
      {},
      [
        ["errorDetails.nameTextField", "Please provide a error name."],
        ["errorDetails.sourceTextField", "Please provide a source."],
      ],
    ],
    ["statesUpdate", null, null, []],
  ].reduce(async (previous, [type, details, settings, errors]) => {
    await previous;
    const eventType = `media.${type}`;
    await driver.init({
      extensionSettings,
      settings: {
        ...mediaSettings.minimal,
        eventType,
        handleMediaSessionAutomatically: type === "sessionStart",
      },
    });
    if (type === "sessionStart") {
      await field(
        view.getByTestId("handleMediaSessionAutomaticallyCheckbox"),
      ).uncheck();
    }
    const before = await registration.getSettings();
    expect(before.handleMediaSessionAutomatically).toBe(false);
    expect(before.xdm.eventType).toBe(eventType);
    if (details) {
      expect(before.xdm.mediaCollection[details]).toEqual(settings);
    } else {
      expect(before.xdm.mediaCollection).toHaveProperty(
        "statesStart",
        undefined,
      );
      expect(before.xdm.mediaCollection).toHaveProperty("statesEnd", undefined);
    }
    expect(await registration.validate()).toBe(errors.length === 0);
    expect(await registration.getSettings()).toEqual(before);
    await errors.reduce(async (earlier, [testId, message]) => {
      await earlier;
      await field(view.getByTestId(testId)).expectError(message);
    }, Promise.resolve());
  }, Promise.resolve());
};

it("Send streaming media event settings snapshots", async () => {
  expect.hasAssertions();
  let sessionSettings;
  await snapshotMediaEventsCases(View, [
    ...[
      ["new", null],
      ...Object.entries(mediaSettings).filter(
        ([name]) => name === "session" || name === "states",
      ),
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
    ].map(([name, settings]) => ({
      name: `round trips ${name} settings`,
      settings,
      fresh: true,
      snapshot: name !== "states",
      verify:
        name === "session"
          ? async (mounted) => {
              sessionSettings = mounted.state.settingsAfterValidate;
              await verifyEmptyMediaDetails(mounted);
            }
          : name === "states"
            ? async ({ bridge }) => {
                await expectMediaEventsSettings(bridge, {
                  ...mediaSettings.states,
                  instanceName: "alloy",
                  handleMediaSessionAutomatically: false,
                  edgeConfigOverrides: undefined,
                  xdm: {
                    eventType: "media.statesUpdate",
                    mediaCollection: {
                      ...mediaSettings.states.xdm.mediaCollection,
                      playhead: undefined,
                    },
                  },
                });
              }
            : undefined,
    })),
    ...["not a data element"].map((value) => ({
      name: `session eventTypeField > sets the value to ${JSON.stringify(value)}`,
      settings: mediaSettings.session,
      edit: async ({ view }) => {
        const control = field(view.getByTestId("eventTypeField"));
        await control.fill(value);
        return () => control.selectOption("Session start");
      },
      verify: async ({ view, bridge, state }) => {
        const control = field(view.getByTestId("eventTypeField"));
        await control.fill("%edited%");
        const expected = structuredClone(state.settingsAfterValidate);
        expected.eventType = "%edited%";
        expected.xdm.eventType = "%edited%";
        await expectMediaEventsSettings(bridge, expected);
        await control.expectNotInvalid();
      },
    })),
    {
      name: 'session sessionDetails.lengthNumberField > sets the value to "-1"',
      reuse: true,
      edit: async ({ view }) => {
        const control = field(
          view.getByTestId("sessionDetails.lengthNumberField"),
        );
        await control.fill("-1");
      },
      verify: async ({ view, bridge, state }) => {
        await field(view.getByTestId("sessionDetails.lengthNumberField")).fill(
          "120",
        );
        await field(
          view.getByTestId("sessionDetails.lengthDataElementOption"),
        ).check();
        await field(
          view.getByTestId("sessionDetails.lengthDataElementField"),
        ).fill("%edited%");
        const expected = structuredClone(state.settingsAfterValidate);
        expected.xdm.mediaCollection.sessionDetails.length = "%edited%";
        await expectMediaEventsSettings(bridge, expected);
        await field(
          view.getByTestId("sessionDetails.lengthDataElementField"),
        ).expectNotInvalid();
      },
    },
    {
      name: "switches SDK instances",
      settings: mediaSettings.session,
      initInfo: { company: { orgId: "PARITY@AdobeOrg" } },
      fresh: true,
      snapshot: false,
      edit: async ({ view }) => {
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
        await field(view.getByTestId("instanceNamePicker")).selectOption(
          "alloy",
        );
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
      },
      verify: async ({ bridge, view }) => {
        await expectMediaEventsSettings(
          bridge,
          { ...sessionSettings, instanceName: "alloy" },
          false,
        );
        await field(view.getByTestId("reportSuitesOverride.0")).expectError(
          "The value must be one of the preconfigured report suites.",
        );
      },
    },
    ...["customMetadata", "sessionDetails"].map((name) => ({
      name: `provides ${name} through a data element`,
      settings: mediaSettings.session,
      fresh: true,
      boundaryError: name === "sessionDetails",
      edit: async ({ view }) => {
        await field(view.getByTestId(`${name}DataElementOption`)).check();
        await field(view.getByTestId(`${name}DataElementField`)).fill(
          "%edited%",
        );
      },
    })),
  ]);
}, 90_000);
