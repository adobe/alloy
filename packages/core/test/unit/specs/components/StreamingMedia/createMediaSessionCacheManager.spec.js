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

import { beforeEach, describe, it, expect } from "vitest";
import createMediaSessionCacheManager from "../../../../../src/components/StreamingMedia/createMediaSessionCacheManager.js";

describe("StreamingMedia::createMediaSessionCacheManager", () => {
  let mediaSessionCacheManager;
  beforeEach(() => {
    mediaSessionCacheManager = createMediaSessionCacheManager();
  });
  it("getSession should return correct session", () => {
    const playerId = "player1";
    const sessionDetails = {
      id: "session1",
    };
    mediaSessionCacheManager.storeSession({
      playerId,
      sessionDetails,
    });
    const result = mediaSessionCacheManager.getSession(playerId);
    expect(result).toEqual(sessionDetails);
  });
  it("stopPing should stop the Ping", () => {
    const playerId = "player1";
    const sessionDetails = {
      id: "session1",
      pingId: 1,
    };
    mediaSessionCacheManager.storeSession({
      playerId,
      sessionDetails,
    });
    const result = mediaSessionCacheManager.getSession(playerId);
    mediaSessionCacheManager.stopPing({
      playerId,
    });
    expect(result.pingId).toEqual(null);
  });
  it("storeSession should store the session", () => {
    const playerId = "player1";
    const sessionDetails = {
      id: "session1",
    };
    mediaSessionCacheManager.storeSession({
      playerId,
      sessionDetails,
    });
    const session = mediaSessionCacheManager.getSession(playerId);
    expect(session).toEqual(sessionDetails);
  });
  it("savePing should save the Ping", () => {
    const playerId = "player1";
    const sessionDetails = {
      id: "session1",
    };
    mediaSessionCacheManager.storeSession({
      playerId,
      sessionDetails,
    });
    mediaSessionCacheManager.savePing({
      playerId,
      pingId: 1,
    });
    const session = mediaSessionCacheManager.getSession(playerId);
    expect(session.pingId).toEqual(1);
  });
});
