/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { vi, beforeEach, describe, it, expect } from "vitest";
import createTrackMediaSession from "../../../../../src/components/StreamingMedia/createTrackMediaSession.js";
import PlaybackState from "../../../../../src/components/StreamingMedia/constants/playbackState.js";

describe("createTrackMediaSession", () => {
  let trackMediaSession;
  let mediaEventManager;
  let mediaSessionCacheManager;
  let config;
  let logger;
  beforeEach(() => {
    logger = {
      warn: vi.fn(),
    };
    mediaEventManager = {
      createMediaSession: vi.fn(),
      augmentMediaEvent: vi.fn(),
      trackMediaSession: vi.fn().mockReturnValue(Promise.resolve()),
    };
    mediaSessionCacheManager = {
      storeSession: vi.fn(),
    };
    config = {
      streamingMedia: {
        playerName: "testPlayerName",
        channel: "testChannel",
        adPingInterval: 5,
        mainPingInterval: 10,
      },
    };
    trackMediaSession = createTrackMediaSession({
      config,
      logger,
      mediaEventManager,
      mediaSessionCacheManager,
    });
  });
  it("should track a session", async () => {
    const sessionPromise = Promise.resolve("123");
    const playerId = "testPlayerId";
    const playerName = "testPlayerName";
    const eventType = "media.sessionStart";
    const event = {
      eventType,
    };
    const getPlayerDetails = () => {};
    const options = {
      playerId,
      getPlayerDetails,
      xdm: {
        mediaCollection: {
          sessionDetails: {
            playerName,
          },
        },
      },
    };
    mediaEventManager.createMediaSession.mockReturnValue({
      eventType,
    });
    mediaEventManager.augmentMediaEvent.mockReturnValue({
      eventType,
      xdm: {
        mediaCollection: {
          sessionDetails: {
            playerName,
          },
          playhead: 0,
        },
      },
    });
    mediaEventManager.trackMediaSession.mockReturnValue(sessionPromise);
    await trackMediaSession(options);
    expect(mediaEventManager.createMediaSession).toHaveBeenCalledWith(options);
    expect(mediaEventManager.augmentMediaEvent).toHaveBeenCalledWith({
      event,
      playerId,
      getPlayerDetails,
    });
    expect(mediaEventManager.trackMediaSession).toHaveBeenCalledWith({
      event,
      mediaOptions: {
        playerId,
        getPlayerDetails,
        legacy: false,
      },
      edgeConfigOverrides: undefined,
    });
    expect(mediaSessionCacheManager.storeSession).toHaveBeenCalledWith({
      playerId,
      sessionDetails: {
        sessionPromise,
        getPlayerDetails,
        playbackState: PlaybackState.MAIN,
      },
    });
  });
  it("should not track session when no valid configs", async () => {
    config = {};
    trackMediaSession = createTrackMediaSession({
      config,
      mediaEventManager,
      mediaSessionCacheManager,
    });
    const options = {
      playerId: "player1",
      xdm: {
        eventType: "media.sessionStart",
      },
      getPlayerDetails: "",
    };
    return expect(trackMediaSession(options)).rejects.toThrowError();
  });
});
