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

import { test, expect, describe, vi } from "../../helpers/testsSetup/extend.js";
import {
  mediaSessionHandler,
  mediaEventHandler,
} from "../../helpers/mswjs/handlers.js";
import alloyConfig from "../../helpers/alloy/config.js";

const streamingMediaConfig = {
  ...alloyConfig,
  streamingMedia: {
    channel: "test channel",
    playerName: "test player",
  },
};

const getEvents = (calls) => {
  return calls.flatMap((call) => call.request.body.events || []);
};

const getRecordedCalls = (networkRecorder, pattern) => {
  return networkRecorder.calls.filter((call) => {
    return call.request && call.response && pattern.test(call.request.url);
  });
};

const waitForRecordedCalls = async (networkRecorder, pattern, retries = 10) => {
  const calls = getRecordedCalls(networkRecorder, pattern);
  if (calls.length > 0 || retries === 0) {
    return calls;
  }
  await vi.advanceTimersByTimeAsync(100);
  return waitForRecordedCalls(networkRecorder, pattern, retries - 1);
};

const expectSessionStarted = (
  calls,
  sessionId,
  playhead,
  expectedMediaCollection,
) => {
  expect(calls).toHaveLength(1);
  expect(calls[0].response.status).toBe(200);

  const [event] = getEvents(calls);
  expect(event.xdm.eventType).toBe("media.sessionStart");
  expect(event.xdm.mediaCollection.playhead).toBe(playhead);
  if (expectedMediaCollection) {
    expect(event.xdm.mediaCollection).toMatchObject(expectedMediaCollection);
  }

  if (sessionId) {
    const payload = calls[0].response.body.handle[0].payload[0];
    expect(payload.sessionId).toBe(sessionId);
  }

  return event;
};

const expectMediaEvents = (calls, expectedEventTypes) => {
  expect(calls).toHaveLength(expectedEventTypes.length);
  calls.forEach((call) => expect(call.response.status).toBe(204));

  const events = getEvents(calls);
  expect(events.map((event) => event.xdm.eventType)).toEqual(
    expectedEventTypes,
  );
  return events;
};

const expectSessionAndPlayhead = (events, sessionId, playheads) => {
  events.forEach((event, index) => {
    expect(event.xdm.mediaCollection.sessionID).toBe(sessionId);
    expect(event.xdm.mediaCollection.playhead).toBe(playheads[index]);
  });
};

const expectMediaPayloads = (events, expectedPayloads) => {
  events.forEach((event, index) => {
    expect(event.xdm.mediaCollection).toMatchObject(expectedPayloads[index]);
  });
};

const advanceCommand = async (command) => {
  await vi.advanceTimersByTimeAsync(0);
  const result = await command;
  await vi.advanceTimersByTimeAsync(0);
  return result;
};

const sendTimedMediaEvents = (alloy, events, createOptions) => {
  return events.reduce((previous, event) => {
    return previous.then(() => {
      return advanceCommand(alloy("sendMediaEvent", createOptions(event)));
    });
  }, Promise.resolve());
};

const directMediaEvents = [
  ["media.play"],
  ["media.pauseStart"],
  [
    "media.chapterStart",
    {
      chapterDetails: {
        friendlyName: "Chapter 1",
        length: 10,
        index: 1,
        offset: 0,
      },
    },
  ],
  ["media.chapterComplete"],
  ["media.chapterSkip"],
  [
    "media.adBreakStart",
    {
      advertisingPodDetails: {
        friendlyName: "Mid-roll",
        offset: 0,
        index: 1,
      },
    },
  ],
  [
    "media.adStart",
    {
      advertisingDetails: {
        friendlyName: "Ad 1",
        name: "/uri-reference/001",
        length: 10,
        advertiser: "Adobe Marketing",
        campaignID: "Adobe Analytics",
        creativeID: "creativeID",
        creativeURL: "https://creativeurl.com",
        placementID: "placementID",
        siteID: "siteID",
        podPosition: 11,
        playerName: "HTML5 player",
      },
    },
  ],
  ["media.adComplete"],
  ["media.adBreakComplete"],
  ["media.adSkip"],
  [
    "media.error",
    { errorDetails: { name: "test-buffer-start", source: "player" } },
  ],
  ["media.bufferStart"],
  [
    "media.bitrateChange",
    {
      qoeDataDetails: {
        framesPerSecond: 1,
        bitrate: 35000,
        droppedFrames: 30,
        timeToStart: 1364,
      },
    },
  ],
  [
    "media.statesUpdate",
    {
      statesStart: [{ name: "mute" }, { name: "pictureInPicture" }],
      statesEnd: [{ name: "fullScreen" }],
    },
  ],
];

describe("MediaCollection", () => {
  test("MA3 - non-automatic mode sends events without automatic pings", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(mediaSessionHandler, mediaEventHandler);
    await alloy("configure", streamingMediaConfig);

    vi.useFakeTimers();
    try {
      const { sessionId } = await advanceCommand(
        alloy("createMediaSession", {
          xdm: {
            mediaCollection: {
              playhead: 0,
              sessionDetails: {
                length: 60,
                contentType: "VOD",
                name: "test name of the video",
              },
            },
          },
        }),
      );

      const interactCalls = await waitForRecordedCalls(
        networkRecorder,
        /\/v1\/interact/,
      );
      expectSessionStarted(interactCalls, sessionId, 0);

      await sendTimedMediaEvents(
        alloy,
        directMediaEvents,
        ([eventType, additionalData = {}]) => ({
          xdm: {
            eventType,
            mediaCollection: {
              playhead: 1,
              sessionID: sessionId,
              ...additionalData,
            },
          },
        }),
      );

      await vi.advanceTimersByTimeAsync(10_000);

      const mediaCalls = getRecordedCalls(networkRecorder, /\/va\//);
      const events = expectMediaEvents(
        mediaCalls,
        directMediaEvents.map(([eventType]) => eventType),
      );
      expectSessionAndPlayhead(
        events,
        sessionId,
        directMediaEvents.map(() => 1),
      );
      expectMediaPayloads(
        events,
        directMediaEvents.map(([, additionalData = {}]) => additionalData),
      );
      expect(events.some((event) => event.xdm.eventType === "media.ping")).toBe(
        false,
      );
    } finally {
      vi.useRealTimers();
    }
  });

  test("MA1 - automatic mode augments events and stops pings when complete", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(mediaSessionHandler, mediaEventHandler);
    await alloy("configure", streamingMediaConfig);

    vi.useFakeTimers();
    try {
      const playerDetails = {
        playhead: 3,
        qoeDataDetails: {
          bitrate: 1,
          droppedFrames: 2,
          framesPerSecond: 3,
          timeToStart: 4,
        },
      };
      const sessionPromise = alloy("createMediaSession", {
        playerId: "player1",
        xdm: {
          mediaCollection: {
            sessionDetails: {
              length: 60,
              contentType: "VOD",
              name: "test name of the video",
            },
          },
        },
        getPlayerDetails: () => ({
          ...playerDetails,
          qoeDataDetails: { ...playerDetails.qoeDataDetails },
        }),
      });
      const { sessionId } = await advanceCommand(sessionPromise);

      const interactCalls = await waitForRecordedCalls(
        networkRecorder,
        /\/v1\/interact/,
      );
      expectSessionStarted(interactCalls, sessionId, 3, {
        qoeDataDetails: playerDetails.qoeDataDetails,
      });

      await vi.advanceTimersByTimeAsync(10_000);

      const automaticEvents = directMediaEvents.filter(
        ([eventType]) => eventType !== "media.bufferStart",
      );
      await sendTimedMediaEvents(
        alloy,
        automaticEvents,
        ([eventType, additionalData = {}]) => ({
          playerId: "player1",
          xdm: {
            eventType,
            mediaCollection: additionalData,
          },
        }),
      );

      await vi.advanceTimersByTimeAsync(10_000);
      await advanceCommand(
        alloy("sendMediaEvent", {
          playerId: "player1",
          xdm: { eventType: "media.sessionComplete" },
        }),
      );
      await vi.advanceTimersByTimeAsync(10_000);

      const mediaCalls = getRecordedCalls(networkRecorder, /\/va\//);
      const expectedEventTypes = [
        "media.ping",
        ...automaticEvents.map(([eventType]) => eventType),
        "media.ping",
        "media.sessionComplete",
      ];
      const events = expectMediaEvents(mediaCalls, expectedEventTypes);
      expectSessionAndPlayhead(
        events,
        sessionId,
        expectedEventTypes.map(() => 3),
      );
      expectMediaPayloads(
        events,
        expectedEventTypes.map((eventType, index) => {
          const additionalData =
            eventType === "media.ping" || eventType === "media.sessionComplete"
              ? {}
              : automaticEvents[index - 1]?.[1];
          return {
            qoeDataDetails: playerDetails.qoeDataDetails,
            ...additionalData,
          };
        }),
      );
      expect(
        events.filter((event) => event.xdm.eventType === "media.ping"),
      ).toHaveLength(2);
    } finally {
      vi.useRealTimers();
    }
  });

  test("MA2 - legacy tracker transforms events and controls automatic pings", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(mediaSessionHandler, mediaEventHandler);
    await alloy("configure", streamingMediaConfig);

    const Media = await alloy("getMediaAnalyticsTracker");
    expect(typeof Media.getInstance).toBe("function");
    const tracker = Media.getInstance();

    const mediaInfo = Media.createMediaObject(
      "NinasVideoName",
      "Ninas player video",
      60,
      Media.StreamType.VOD,
      Media.MediaType.Video,
    );
    const contextData = {
      isUserLoggedIn: "false",
      tvStation: "Sample TV station",
      programmer: "Sample programmer",
      assetID: "/uri-reference",
      [Media.VideoMetadataKeys.Episode]: "Sample Episode",
      [Media.VideoMetadataKeys.Show]: "Sample Show",
    };

    vi.useFakeTimers();
    try {
      await advanceCommand(tracker.trackSessionStart(mediaInfo, contextData));

      const interactCalls = await waitForRecordedCalls(
        networkRecorder,
        /\/v1\/interact/,
      );
      const sessionStartEvent = expectSessionStarted(interactCalls, null, 0);
      const sessionId =
        interactCalls[0].response.body.handle[0].payload[0].sessionId;
      expect(
        sessionStartEvent.xdm.mediaCollection.sessionDetails,
      ).toMatchObject({
        friendlyName: "NinasVideoName",
        name: "Ninas player video",
        length: 60,
        contentType: Media.StreamType.VOD,
        streamType: Media.MediaType.Video,
        episode: "Sample Episode",
        show: "Sample Show",
      });
      expect(sessionStartEvent.xdm.mediaCollection.customMetadata).toEqual([
        { name: "isUserLoggedIn", value: "false" },
        { name: "tvStation", value: "Sample TV station" },
        { name: "programmer", value: "Sample programmer" },
        { name: "assetID", value: "/uri-reference" },
      ]);

      await advanceCommand(tracker.trackPlay());
      await advanceCommand(tracker.trackPause());

      const chapterInfo = Media.createChapterObject("chapterNumber1", 2, 18, 1);
      await advanceCommand(
        tracker.trackEvent(Media.Event.ChapterStart, chapterInfo, {
          segmentType: "Sample segment type",
        }),
      );

      tracker.updatePlayhead(10);
      await advanceCommand(tracker.trackEvent(Media.Event.ChapterComplete));
      await advanceCommand(tracker.trackEvent(Media.Event.ChapterSkip));
      await advanceCommand(tracker.trackEvent(Media.Event.BufferStart));
      await advanceCommand(tracker.trackEvent(Media.Event.BufferComplete));
      await advanceCommand(tracker.trackEvent(Media.Event.SeekStart));
      await advanceCommand(tracker.trackEvent(Media.Event.SeekComplete));

      tracker.updateQoEObject(Media.createQoEObject(1000000, 24, 25, 10));
      await advanceCommand(tracker.trackEvent(Media.Event.BitrateChange));

      const state = Media.createStateObject(Media.PlayerState.Mute);
      await advanceCommand(tracker.trackEvent(Media.Event.StateStart, state));
      await advanceCommand(tracker.trackEvent(Media.Event.StateEnd, state));
      await advanceCommand(tracker.trackError("test-buffer-start"));

      const ad = Media.createAdObject("ad-name", "ad-id", 1, 15);
      await advanceCommand(
        tracker.trackEvent(Media.Event.AdStart, ad, {
          [Media.AdMetadataKeys.Advertiser]: "Sample Advertiser",
          [Media.AdMetadataKeys.CampaignId]: "Sample Campaign",
          affiliate: "Sample affiliate",
        }),
      );
      await advanceCommand(tracker.trackEvent(Media.Event.AdComplete));
      await advanceCommand(tracker.trackEvent(Media.Event.AdSkip));

      const adBreak = Media.createAdBreakObject("preroll", 1, 0);
      await advanceCommand(
        tracker.trackEvent(Media.Event.AdBreakStart, adBreak),
      );
      await advanceCommand(tracker.trackEvent(Media.Event.AdBreakComplete));

      await vi.advanceTimersByTimeAsync(10_000);
      await advanceCommand(tracker.trackComplete());
      await vi.advanceTimersByTimeAsync(10_000);

      const expectedEventTypes = [
        "media.play",
        "media.pauseStart",
        "media.chapterStart",
        "media.chapterComplete",
        "media.chapterSkip",
        "media.bufferStart",
        "media.play",
        "media.pauseStart",
        "media.play",
        "media.bitrateChange",
        "media.statesUpdate",
        "media.statesUpdate",
        "media.error",
        "media.adStart",
        "media.adComplete",
        "media.adSkip",
        "media.adBreakStart",
        "media.adBreakComplete",
        "media.ping",
        "media.sessionComplete",
      ];
      const mediaCalls = getRecordedCalls(networkRecorder, /\/va\//);
      const events = expectMediaEvents(mediaCalls, expectedEventTypes);
      expectSessionAndPlayhead(events, sessionId, [
        0,
        0,
        0,
        ...expectedEventTypes.slice(3).map(() => 10),
      ]);
      expect(events[2].xdm.mediaCollection).toMatchObject({
        chapterDetails: {
          friendlyName: "chapterNumber1",
          index: 2,
          length: 18,
          offset: 1,
        },
        customMetadata: [{ name: "segmentType", value: "Sample segment type" }],
      });
      expect(events[9].xdm.mediaCollection.qoeDataDetails).toEqual({
        bitrate: 1000000,
        timeToStart: 24,
        framesPerSecond: 25,
        droppedFrames: 10,
      });
      expect(events[10].xdm.mediaCollection.statesStart).toEqual([
        { name: Media.PlayerState.Mute },
      ]);
      expect(events[11].xdm.mediaCollection.statesEnd).toEqual([
        { name: Media.PlayerState.Mute },
      ]);
      expect(events[12].xdm.mediaCollection.errorDetails).toEqual({
        name: "test-buffer-start",
        source: "player",
      });
      expect(events[13].xdm.mediaCollection).toMatchObject({
        advertisingDetails: {
          friendlyName: "ad-name",
          name: "ad-id",
          podPosition: 1,
          length: 15,
          advertiser: "Sample Advertiser",
          campaignID: "Sample Campaign",
        },
        customMetadata: [{ name: "affiliate", value: "Sample affiliate" }],
      });
      expect(events[16].xdm.mediaCollection.advertisingPodDetails).toEqual({
        friendlyName: "preroll",
        index: 1,
        offset: 0,
      });
      expect(
        events.filter((event) => event.xdm.eventType === "media.ping"),
      ).toHaveLength(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
