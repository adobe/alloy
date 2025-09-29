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
import createMediaResponseHandler from "../../../../../src/components/StreamingMedia/createMediaResponseHandler.js";

describe("createMediaResponseHandler", () => {
  let trackMediaEvent;
  let mediaSessionCacheManager;
  let config;
  let logger;
  let mediaResponseHandler;
  let response;
  const getPlayerDetails = () => {};
  beforeEach(() => {
    response = {
      getPayloadsByType: vi.fn(),
    };
    mediaSessionCacheManager = {
      getSession: vi.fn().mockReturnValue({
        getPlayerDetails: vi.fn(),
        sessionPromise: Promise.resolve({
          sessionId: "123",
        }),
      }),
      stopPing: vi.fn(),
      savePing: vi.fn(),
    };
    config = {
      streamingMedia: {
        adPingInterval: 5,
        mainPingInterval: 10,
      },
    };
    logger = {
      info: vi.fn(),
    };
    trackMediaEvent = vi.fn();
    mediaResponseHandler = createMediaResponseHandler({
      mediaSessionCacheManager,
      logger,
      config,
      trackMediaEvent,
    });
  });
  it("should return empty object when no media payload", async () => {
    response.getPayloadsByType.mockReturnValue([]);
    const result = await mediaResponseHandler({
      response,
      playerId: "player1",
      getPlayerDetails,
    });
    await expect(result).toEqual({});
    await expect(mediaSessionCacheManager.savePing).not.toHaveBeenCalled();
  });
  it("should return session id", async () => {
    response.getPayloadsByType.mockReturnValue([
      {
        sessionId: "123",
      },
    ]);
    const result = await mediaResponseHandler({
      response,
      playerId: "player1",
      getPlayerDetails,
    });
    await expect(result).toEqual({
      sessionId: "123",
    });
    await expect(mediaSessionCacheManager.savePing).toHaveBeenCalled();
  });
  it("should return sessionId when no player or getPlayerDetails function", async () => {
    response.getPayloadsByType.mockReturnValue([
      {
        sessionId: "123",
      },
    ]);
    const result = await mediaResponseHandler({
      response,
    });
    await expect(result).toEqual({
      sessionId: "123",
    });
    await expect(mediaSessionCacheManager.savePing).not.toHaveBeenCalled();
  });
});
