/*
Copyright 2025 Adobe. All rights reserved.
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

describe("Streaming Media Events", () => {
  test("media events include timestamp in xdm", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(mediaSessionHandler, mediaEventHandler);

    await alloy("configure", streamingMediaConfig);

    await alloy("createMediaSession", {
      playerId: "player1",
      xdm: {
        mediaCollection: {
          sessionDetails: {
            length: 60,
            contentType: "VOD",
            name: "test video",
          },
        },
      },
      getPlayerDetails: () => ({
        playhead: 10,
        qoeDataDetails: {
          bitrate: 1000,
          droppedFrames: 0,
          framesPerSecond: 30,
          timeToStart: 100,
        },
      }),
    });

    const sessionCall = await networkRecorder.findCall(/edge\.adobedc\.net/);
    expect(sessionCall).toBeDefined();
    expect(sessionCall.request.body.events[0].xdm.timestamp).toBeDefined();
    expect(sessionCall.request.body.events[0].xdm.eventType).toBe(
      "media.sessionStart",
    );

    await alloy("sendMediaEvent", {
      playerId: "player1",
      xdm: {
        eventType: "media.play",
      },
    });

    const mediaEventCalls = await networkRecorder.findCalls(/\/va\//);
    expect(mediaEventCalls.length).toBeGreaterThan(0);

    const playEvent = mediaEventCalls[0];
    expect(playEvent.request.body.events[0].xdm.timestamp).toBeDefined();
    expect(playEvent.request.body.events[0].xdm.eventType).toBe("media.play");
  });
});
