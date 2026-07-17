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

import {
  test,
  expect,
  describe,
  beforeEach,
  afterEach,
  vi,
} from "../../helpers/testsSetup/extend.js";
import {
  mediaSessionHandler,
  mediaEventHandler,
} from "../../helpers/mswjs/handlers.js";
import alloyConfig from "../../helpers/alloy/config.js";

const streamingMediaConfig = {
  ...alloyConfig,
  streamingMedia: {
    channel: "functional tests channel",
    playerName: "functional test player",
  },
};

const getEventFromCall = (call, eventType) => {
  return call.request.body.events?.find((event) => {
    return event.xdm?.eventType === eventType;
  });
};

const getCalls = (networkRecorder, eventType) => {
  return networkRecorder.calls.filter((call) => {
    return call.request && call.response && getEventFromCall(call, eventType);
  });
};

const waitForCalls = async (
  networkRecorder,
  eventType,
  minCalls = 1,
  retries = 10,
) => {
  const calls = getCalls(networkRecorder, eventType);
  if (calls.length >= minCalls || retries === 0) {
    return calls;
  }
  await vi.advanceTimersByTimeAsync(100);
  return waitForCalls(networkRecorder, eventType, minCalls, retries - 1);
};

const assertSessionStarted = async (networkRecorder, sessionId, playhead) => {
  const calls = await waitForCalls(networkRecorder, "media.sessionStart");

  expect(calls).toHaveLength(1);
  expect([200, 207]).toContain(calls[0].response.status);
  const event = getEventFromCall(calls[0], "media.sessionStart");
  expect(event.xdm.eventType).toBe("media.sessionStart");
  expect(event.xdm.mediaCollection.playhead).toBe(playhead);

  const payload = calls[0].response.body.handle.find((handle) => {
    return handle.type === "media-analytics:new-session";
  }).payload[0];
  if (sessionId) {
    expect(payload.sessionId).toBe(sessionId);
  }
  return payload.sessionId;
};

const assertEventIsSent = async (
  networkRecorder,
  eventType,
  sessionId,
  playhead,
  order = 0,
) => {
  const calls = await waitForCalls(networkRecorder, eventType, order + 1);
  const call = calls[order];
  expect(call.request.url).toMatch(/\/va\//);
  expect(call.response.status).toBe(204);

  const event = getEventFromCall(call, eventType);
  expect(event.xdm.mediaCollection.sessionID).toBe(sessionId);
  if (playhead !== undefined) {
    expect(event.xdm.mediaCollection.playhead).toBe(playhead);
  }
  expect(event.xdm.eventType).toBe(eventType);
};

const assertPingSent = async (networkRecorder, sessionId) => {
  const calls = await waitForCalls(networkRecorder, "media.ping");
  expect(calls[0].request.url).toMatch(/\/va\//);
  const ping = getEventFromCall(calls[0], "media.ping");
  expect(ping.xdm.mediaCollection.sessionID).toBe(sessionId);
  expect(ping.xdm.eventType).toBe("media.ping");
};

const advanceCommand = async (command) => {
  await vi.advanceTimersByTimeAsync(0);
  const result = await command;
  await vi.advanceTimersByTimeAsync(0);
  return result;
};

const inSequence = (items, callback) => {
  return items.reduce((previous, item) => {
    return previous.then(() => callback(item));
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
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test("MA1 - automatic mode augments events and stops pings when complete", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(mediaSessionHandler, mediaEventHandler);
    await alloy("configure", streamingMediaConfig);
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
        playhead: 3,
        qoeDataDetails: {
          bitrate: 1,
          droppedFrames: 2,
          framesPerSecond: 3,
          timeToStart: 4,
        },
      }),
    });
    const { sessionId } = await advanceCommand(sessionPromise);
    await assertSessionStarted(networkRecorder, sessionId, 3);

    await vi.advanceTimersByTimeAsync(11_000);
    await assertPingSent(networkRecorder, sessionId);

    await inSequence(
      directMediaEvents.filter(([type]) => type !== "media.bufferStart"),
      async ([eventType, additionalData = {}]) => {
        await advanceCommand(
          alloy("sendMediaEvent", {
            playerId: "player1",
            xdm: { eventType, mediaCollection: additionalData },
          }),
        );
        await assertEventIsSent(networkRecorder, eventType, sessionId, 3);
      },
    );

    await vi.advanceTimersByTimeAsync(11_000);
    await assertPingSent(networkRecorder, sessionId);
    await advanceCommand(
      alloy("sendMediaEvent", {
        playerId: "player1",
        xdm: { eventType: "media.sessionComplete" },
      }),
    );
    await vi.advanceTimersByTimeAsync(10_000);
    expect(getCalls(networkRecorder, "media.ping")[2]).toBeUndefined();
  });

  test("MA2 - legacy component transforms events and controls automatic pings", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(mediaSessionHandler, mediaEventHandler);
    await alloy("configure", streamingMediaConfig);

    const Media = await alloy("getMediaAnalyticsTracker");
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

    await advanceCommand(tracker.trackSessionStart(mediaInfo, contextData));
    const sessionId = await assertSessionStarted(networkRecorder, null, 0);

    await advanceCommand(tracker.trackPlay());
    await assertEventIsSent(networkRecorder, "media.play", sessionId, 0);
    await advanceCommand(tracker.trackPause());
    await assertEventIsSent(networkRecorder, "media.pauseStart", sessionId, 0);

    const chapterInfo = Media.createChapterObject("chapterNumber1", 2, 18, 1);
    await advanceCommand(
      tracker.trackEvent(Media.Event.ChapterStart, chapterInfo, {
        segmentType: "Sample segment type",
      }),
    );
    await assertEventIsSent(
      networkRecorder,
      "media.chapterStart",
      sessionId,
      0,
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
    await advanceCommand(tracker.trackEvent(Media.Event.AdBreakStart, adBreak));
    await advanceCommand(tracker.trackEvent(Media.Event.AdBreakComplete));

    const expectedEvents = [
      ["media.chapterComplete"],
      ["media.chapterSkip"],
      ["media.adBreakStart"],
      ["media.adStart"],
      ["media.adComplete"],
      ["media.adBreakComplete"],
      ["media.adSkip"],
      ["media.error"],
      ["media.bufferStart"],
      ["media.play", 1],
      ["media.bitrateChange"],
      ["media.statesUpdate", 0],
      ["media.statesUpdate", 1],
    ];
    await inSequence(expectedEvents, async ([eventType, order = 0]) => {
      await assertEventIsSent(networkRecorder, eventType, sessionId, 10, order);
    });

    await vi.advanceTimersByTimeAsync(10_000);
    await assertPingSent(networkRecorder, sessionId);
    await advanceCommand(tracker.trackComplete());
    await vi.advanceTimersByTimeAsync(10_000);
    expect(getCalls(networkRecorder, "media.ping")[2]).toBeUndefined();
  });

  test("MA3 - non-automatic mode sends events without automatic pings", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(mediaSessionHandler, mediaEventHandler);
    await alloy("configure", streamingMediaConfig);

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
    await assertSessionStarted(networkRecorder, sessionId, 0);

    await inSequence(
      directMediaEvents,
      async ([eventType, additionalData = {}]) => {
        await advanceCommand(
          alloy("sendMediaEvent", {
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
        await assertEventIsSent(networkRecorder, eventType, sessionId);
      },
    );

    await vi.advanceTimersByTimeAsync(10_000);
    expect(getCalls(networkRecorder, "media.ping")[0]).toBeUndefined();
  });
});
