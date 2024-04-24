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

import createMediaSessionCacheManager from "../../../../../src/components/StreamingMedia/createMediaSessionCacheManager";

describe("StreamingMedia::createMediaSessionCacheManager", () => {
  let mediaSessionCacheManager;

  beforeEach(() => {
    mediaSessionCacheManager = createMediaSessionCacheManager();
  });

  it("getSession should return correct session", () => {
    const playerId = "player1";
    const sessionDetails = { id: "session1" };
    mediaSessionCacheManager.storeSession({ playerId, sessionDetails });

    const result = mediaSessionCacheManager.getSession(playerId);

    expect(result).toEqual(sessionDetails);
  });

  it("stopHeartbeat should stop the heartbeat", () => {
    const playerId = "player1";
    const sessionDetails = { id: "session1", heartbeatId: 1 };

    mediaSessionCacheManager.storeSession({ playerId, sessionDetails });

    const result = mediaSessionCacheManager.getSession(playerId);

    mediaSessionCacheManager.stopHeartbeat({ playerId });

    expect(result.heartbeatId).toEqual(null);
  });

  it("storeSession should store the session", () => {
    const playerId = "player1";
    const sessionDetails = { id: "session1" };
    mediaSessionCacheManager.storeSession({ playerId, sessionDetails });

    const session = mediaSessionCacheManager.getSession(playerId);

    expect(session).toEqual(sessionDetails);
  });

  it("saveHeartbeat should save the heartbeat", () => {
    const playerId = "player1";
    const sessionDetails = { id: "session1" };
    mediaSessionCacheManager.storeSession({ playerId, sessionDetails });
    mediaSessionCacheManager.saveHeartbeat({ playerId, heartbeatId: 1 });

    const session = mediaSessionCacheManager.getSession(playerId);

    expect(session.heartbeatId).toEqual(1);
  });
});
