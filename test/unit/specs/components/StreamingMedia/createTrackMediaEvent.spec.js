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
import createTrackMediaEvent from "../../../../../src/components/StreamingMedia/createTrackMediaEvent.js";
import MediaEvents from "../../../../../src/components/StreamingMedia/constants/eventTypes.js";

describe("createTrackMediaEvent", () => {
  let trackMediaEvent;
  let mediaEventManager;
  let mediaSessionCacheManager;
  let config;

  beforeEach(() => {
    mediaEventManager = {
      createMediaEvent: jasmine.createSpy(),
      augmentMediaEvent: jasmine.createSpy(),
      trackMediaEvent: jasmine.createSpy().and.returnValue(Promise.resolve()),
    };
    mediaSessionCacheManager = {
      getSession: jasmine.createSpy().and.returnValue({
        getPlayerDetails: jasmine.createSpy(),
        sessionPromise: Promise.resolve({ sessionId: "123" }),
      }),
      stopPing: jasmine.createSpy(),
      savePing: jasmine.createSpy(),
    };
    config = {
      streamingMedia: {
        adPingInterval: 5,
        mainPingInterval: 10,
      },
    };
    trackMediaEvent = createTrackMediaEvent({
      mediaEventManager,
      mediaSessionCacheManager,
      config,
    });
  });

  it("should send a media event", async () => {
    const options = {
      playerId: "player1",
      xdm: {
        eventType: "media.play",
      },
    };

    await trackMediaEvent(options);

    expect(mediaEventManager.createMediaEvent).toHaveBeenCalledWith({
      options,
    });
    expect(mediaSessionCacheManager.getSession).toHaveBeenCalledWith(
      options.playerId,
    );
    expect(mediaEventManager.augmentMediaEvent).toHaveBeenCalled();
    expect(mediaEventManager.trackMediaEvent).toHaveBeenCalled();
  });

  it("should stop the Ping for session complete event", async () => {
    const options = {
      playerId: "player1",
      xdm: {
        eventType: MediaEvents.SESSION_COMPLETE,
      },
    };

    await trackMediaEvent(options);

    expect(mediaSessionCacheManager.stopPing).toHaveBeenCalledWith({
      playerId: options.playerId,
    });
  });

  it("should save the Ping for non-session complete event", async () => {
    const options = {
      playerId: "player1",
      xdm: {
        eventType: "media.play",
      },
    };

    await trackMediaEvent(options);

    expect(mediaSessionCacheManager.savePing).toHaveBeenCalled();
  });
});
