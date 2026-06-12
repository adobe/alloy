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

import { test, expect, describe } from "../../helpers/testsSetup/extend.js";
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

const getEventFromCalls = (calls, eventType) => {
  for (const call of calls) {
    const found = call.request.body.events?.find(
      (e) => e.xdm?.eventType === eventType,
    );
    if (found) return found;
  }
  return undefined;
};

describe("MediaCollection (MA1/MA3) - createMediaSession and sendMediaEvent", () => {
  test("MA3 - non-automatic mode: events are routed to the /va/ endpoint with correct eventType", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(mediaSessionHandler, mediaEventHandler);

    await alloy("configure", streamingMediaConfig);

    const session = await alloy("createMediaSession", {
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
    });

    expect(session.sessionId).toBeDefined();

    const sessionId = session.sessionId;

    // Verify session-start call went to the interact endpoint
    const interactCalls = await networkRecorder.findCalls(/edge\.adobedc\.net/);
    const sessionStartEvent = getEventFromCalls(
      interactCalls,
      "media.sessionStart",
    );
    expect(sessionStartEvent).toBeDefined();
    expect(sessionStartEvent.xdm.eventType).toBe("media.sessionStart");

    // play
    await alloy("sendMediaEvent", {
      xdm: {
        eventType: "media.play",
        mediaCollection: { playhead: 1, sessionID: sessionId },
      },
    });

    // pause
    await alloy("sendMediaEvent", {
      xdm: {
        eventType: "media.pauseStart",
        mediaCollection: { playhead: 2, sessionID: sessionId },
      },
    });

    // chapter start
    await alloy("sendMediaEvent", {
      xdm: {
        eventType: "media.chapterStart",
        mediaCollection: {
          playhead: 3,
          sessionID: sessionId,
          chapterDetails: {
            friendlyName: "Chapter 1",
            length: 10,
            index: 1,
            offset: 0,
          },
        },
      },
    });

    // chapter complete
    await alloy("sendMediaEvent", {
      xdm: {
        eventType: "media.chapterComplete",
        mediaCollection: { playhead: 4, sessionID: sessionId },
      },
    });

    // ad break start
    await alloy("sendMediaEvent", {
      xdm: {
        eventType: "media.adBreakStart",
        mediaCollection: {
          playhead: 5,
          sessionID: sessionId,
          advertisingPodDetails: {
            friendlyName: "Mid-roll",
            offset: 0,
            index: 1,
          },
        },
      },
    });

    // ad start
    await alloy("sendMediaEvent", {
      xdm: {
        eventType: "media.adStart",
        mediaCollection: {
          playhead: 5,
          sessionID: sessionId,
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
      },
    });

    // ad complete
    await alloy("sendMediaEvent", {
      xdm: {
        eventType: "media.adComplete",
        mediaCollection: { playhead: 5, sessionID: sessionId },
      },
    });

    // ad break complete
    await alloy("sendMediaEvent", {
      xdm: {
        eventType: "media.adBreakComplete",
        mediaCollection: { playhead: 5, sessionID: sessionId },
      },
    });

    // ad skip
    await alloy("sendMediaEvent", {
      xdm: {
        eventType: "media.adSkip",
        mediaCollection: { playhead: 5, sessionID: sessionId },
      },
    });

    // error
    await alloy("sendMediaEvent", {
      xdm: {
        eventType: "media.error",
        mediaCollection: {
          playhead: 6,
          sessionID: sessionId,
          errorDetails: { name: "test-buffer-start", source: "player" },
        },
      },
    });

    // buffer start
    await alloy("sendMediaEvent", {
      xdm: {
        eventType: "media.bufferStart",
        mediaCollection: { playhead: 7, sessionID: sessionId },
      },
    });

    // bitrate change
    await alloy("sendMediaEvent", {
      xdm: {
        eventType: "media.bitrateChange",
        mediaCollection: {
          playhead: 8,
          sessionID: sessionId,
          qoeDataDetails: {
            framesPerSecond: 1,
            bitrate: 35000,
            droppedFrames: 30,
            timeToStart: 1364,
          },
        },
      },
    });

    // states update
    await alloy("sendMediaEvent", {
      xdm: {
        eventType: "media.statesUpdate",
        mediaCollection: {
          playhead: 9,
          sessionID: sessionId,
          statesStart: [{ name: "mute" }, { name: "pictureInPicture" }],
          statesEnd: [{ name: "fullScreen" }],
        },
      },
    });

    // session complete
    await alloy("sendMediaEvent", {
      xdm: {
        eventType: "media.sessionComplete",
        mediaCollection: { playhead: 10, sessionID: sessionId },
      },
    });

    // All media events should have gone to the /va/ endpoint.
    // Wait for all 14 event types to complete before asserting.
    const vaCalls = await networkRecorder.findCalls(/\/va\//, {
      retries: 30,
      delayMs: 200,
      minCalls: 14,
    });
    expect(vaCalls.length).toBe(14);

    const expectedEventTypes = [
      "media.play",
      "media.pauseStart",
      "media.chapterStart",
      "media.chapterComplete",
      "media.adBreakStart",
      "media.adStart",
      "media.adComplete",
      "media.adBreakComplete",
      "media.adSkip",
      "media.error",
      "media.bufferStart",
      "media.bitrateChange",
      "media.statesUpdate",
      "media.sessionComplete",
    ];

    for (const eventType of expectedEventTypes) {
      const event = getEventFromCalls(vaCalls, eventType);
      expect(
        event,
        `expected ${eventType} to be found in /va/ calls`,
      ).toBeDefined();
    }
  });

  test.skip(
    "MA1 - automatic (ping) mode: pings are sent every 10s when using playerId " +
      "(skipped: ping timing assertions require sleep(11000) which is impractical in CI; " +
      "session-start and event routing are covered by the MA3 test and StreamingMedia/mediaEvents.spec.js)",
    // eslint-disable-next-line no-empty-function
    async () => {},
  );

  test("MA2 - legacy getMediaAnalyticsTracker: tracker API routes events to /va/ endpoint with XDM", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(mediaSessionHandler, mediaEventHandler);
    await alloy("configure", streamingMediaConfig);

    // Get the legacy Media Analytics tracker.
    const Media = await alloy("getMediaAnalyticsTracker");
    expect(Media).toBeDefined();
    expect(typeof Media.getInstance).toBe("function");

    const tracker = Media.getInstance();
    expect(typeof tracker.trackSessionStart).toBe("function");
    expect(typeof tracker.trackPlay).toBe("function");

    // Build media object using the helper (mirrors the original JS 3.x SDK API).
    const mediaInfo = Media.createMediaObject(
      "TestVideoName",
      "test-video-id",
      60,
      Media.StreamType.VOD,
      Media.MediaType.Video,
    );
    const contextData = {
      isUserLoggedIn: "false",
      tvStation: "Test TV Station",
    };

    // Session start — goes to /ee/.../v1/interact (mediaSessionHandler)
    await tracker.trackSessionStart(mediaInfo, contextData);

    // Wait for the session-start interact call to complete.
    const sessionCalls = await networkRecorder.findCalls(/edge\.adobedc\.net/, {
      retries: 10,
      delayMs: 100,
    });
    expect(sessionCalls.length).toBe(1);
    const sessionStartEvent = sessionCalls
      .map((c) => c.request.body?.events?.[0])
      .find((e) => e?.xdm?.eventType === "media.sessionStart");
    expect(sessionStartEvent).toBeDefined();
    expect(sessionStartEvent.xdm.eventType).toBe("media.sessionStart");

    // Play — goes to /va/ endpoint (mediaEventHandler)
    await tracker.trackPlay();

    // Pause — goes to /va/ endpoint
    await tracker.trackPause();

    // Session complete — goes to /va/ endpoint
    await tracker.trackComplete();

    // Wait for all three /va/ events to arrive.
    const vaCalls = await networkRecorder.findCalls(/\/va\//, {
      retries: 20,
      delayMs: 100,
      minCalls: 3,
    });
    expect(vaCalls.length).toBe(3);

    const vaEventTypes = vaCalls.map(
      (c) => c.request.body?.events?.[0]?.xdm?.eventType,
    );

    expect(vaEventTypes).toContain("media.play");
    expect(vaEventTypes).toContain("media.pauseStart");
    expect(vaEventTypes).toContain("media.sessionComplete");
  });
});
