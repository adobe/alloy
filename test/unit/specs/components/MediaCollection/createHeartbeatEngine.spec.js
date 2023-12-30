/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

// test/createHeartbeatEngine.test.js

import createHeartbeatEngine from "../../../../../src/components/MediaCollection/createHeartbeatEngine";

describe("createHeartbeatEngine", () => {
  let config;
  let mediaEventManager;
  let mediaSessionCacheManager;
  let playerId;
  let sessionId;
  let onBeforeMediaEvent;
  let heartbeatEngine;

  beforeEach(() => {
    config = {
      mediaCollection: {
        mainPingInterval: 1
      }
    };
    mediaEventManager = jasmine.createSpyObj("mediaEventManager", [
      "createMediaEvent",
      "trackMediaEvent"
    ]);
    mediaEventManager.createMediaEvent.and.returnValue(Promise.resolve());
    mediaEventManager.trackMediaEvent.and.returnValue(Promise.resolve());
    mediaSessionCacheManager = {
      getSession: jasmine.createSpy("getSession"),
      updateLastTriggeredEventTS: jasmine.createSpy(
        "updateLastTriggeredEventTS"
      )
    };
    playerId = "player1";
    sessionId = "session1";
    onBeforeMediaEvent = jasmine
      .createSpy("onBeforeMediaEvent")
      .and.returnValue({ playhead: 0, qoeDataDetails: {} });
    heartbeatEngine = createHeartbeatEngine({
      config,
      mediaEventManager,
      mediaSessionCacheManager
    });
  });

  it("should call onBeforeMediaEvent if current interval is greater than mainPingInterval", () => {
    const playerSession = {
      latestTriggeredEvent: Date.now() - 2000
    };
    mediaSessionCacheManager.getSession.and.returnValue(playerSession);

    heartbeatEngine({ playerId, sessionId, onBeforeMediaEvent });

    expect(onBeforeMediaEvent).toHaveBeenCalledWith(playerId);
  });

  it("should not call onBeforeMediaEvent if current interval is less than mainPingInterval", () => {
    const playerSession = {
      latestTriggeredEvent: Date.now()
    };
    mediaSessionCacheManager.getSession.and.returnValue(playerSession);

    heartbeatEngine({ playerId, sessionId, onBeforeMediaEvent });

    expect(onBeforeMediaEvent).not.toHaveBeenCalled();
  });
});
