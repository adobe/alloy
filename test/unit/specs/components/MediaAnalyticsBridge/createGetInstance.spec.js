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
import createGetInstance from "../../../../../src/components/MediaAnalyticsBridge/createGetInstance.js";

describe("createGetInstance", () => {
  const logger = {
    warn: vi.fn(),
  };
  let trackMediaSession;
  let trackMediaEvent;
  let uuid;
  beforeEach(() => {
    trackMediaSession = vi.fn();
    trackMediaEvent = vi.fn();
    uuid = vi.fn().mockReturnValue("1234-5678-9101-1121");
  });
  it("should return an object", () => {
    const result = createGetInstance({
      logger,
      trackMediaSession,
      trackMediaEvent,
      uuid,
    });
    expect(typeof result).toBe("object");
    expect(typeof result.trackSessionStart).toBe("function");
    expect(typeof result.trackPlay).toBe("function");
    expect(typeof result.trackComplete).toBe("function");
    expect(typeof result.trackPause).toBe("function");
    expect(typeof result.trackError).toBe("function");
    expect(typeof result.trackEvent).toBe("function");
    expect(typeof result.trackSessionEnd).toBe("function");
    expect(typeof result.updatePlayhead).toBe("function");
    expect(typeof result.updateQoEObject).toBe("function");
    expect(typeof result.destroy).toBe("function");
  });
  it("when play is called", () => {
    const result = createGetInstance({
      logger,
      trackMediaSession,
      trackMediaEvent,
      uuid,
    });
    result.trackSessionStart({
      sessionDetails: {},
    });
    result.trackPlay();
    expect(trackMediaEvent).toHaveBeenCalledWith({
      playerId: "1234-5678-9101-1121",
      xdm: {
        eventType: "media.play",
        mediaCollection: {},
      },
    });
  });
  it("when pause is called", () => {
    const result = createGetInstance({
      logger,
      trackMediaSession,
      trackMediaEvent,
      uuid,
    });
    result.trackSessionStart({
      sessionDetails: {},
    });
    result.trackPause();
    expect(trackMediaEvent).toHaveBeenCalledWith({
      playerId: "1234-5678-9101-1121",
      xdm: {
        eventType: "media.pauseStart",
        mediaCollection: {},
      },
    });
  });
  it("when sessionStart is called", () => {
    const result = createGetInstance({
      logger,
      trackMediaSession,
      trackMediaEvent,
      uuid,
    });
    const sessionDetails = {
      name: "test",
      friendlyName: "test1",
      length: "test2",
      streamType: "vod",
      contentType: "video/mp4",
    };
    const meta = {
      isUserLoggedIn: "false",
      tvStation: "Sample TV station",
      programmer: "Sample programmer",
      assetID: "/uri-reference",
      "a.media.episode": "episode1",
    };
    result.trackSessionStart(
      {
        sessionDetails,
      },
      meta,
    );
    expect(trackMediaSession).toHaveBeenCalledWith({
      playerId: "1234-5678-9101-1121",
      getPlayerDetails: expect.any(Function),
      xdm: {
        eventType: "media.sessionStart",
        mediaCollection: {
          sessionDetails: {
            name: "test",
            friendlyName: "test1",
            length: "test2",
            streamType: "vod",
            contentType: "video/mp4",
            episode: "episode1",
          },
          customMetadata: [
            {
              name: "isUserLoggedIn",
              value: "false",
            },
            {
              name: "tvStation",
              value: "Sample TV station",
            },
            {
              name: "programmer",
              value: "Sample programmer",
            },
            {
              name: "assetID",
              value: "/uri-reference",
            },
          ],
        },
      },
    });
  });
  it("when trackError is called", () => {
    const result = createGetInstance({
      logger,
      trackMediaSession,
      trackMediaEvent,
      uuid,
    });
    result.trackSessionStart({
      sessionDetails: {},
    });
    result.trackError("error");
    expect(trackMediaEvent).toHaveBeenCalledWith({
      playerId: "1234-5678-9101-1121",
      xdm: {
        eventType: "media.error",
        mediaCollection: {
          errorDetails: {
            name: "error",
            source: "player",
          },
        },
      },
    });
    expect(logger.warn).toHaveBeenCalled();
  });
  it("when trackComplete is called", () => {
    const result = createGetInstance({
      logger,
      trackMediaSession,
      trackMediaEvent,
      uuid,
    });
    result.trackSessionStart({
      sessionDetails: {},
    });
    result.trackComplete();
    expect(trackMediaEvent).toHaveBeenCalledWith({
      playerId: "1234-5678-9101-1121",
      xdm: {
        eventType: "media.sessionComplete",
        mediaCollection: {},
      },
    });
  });
  it("when trackSessionEnd is called", () => {
    const result = createGetInstance({
      logger,
      trackMediaSession,
      trackMediaEvent,
      uuid,
    });
    result.trackSessionStart({
      sessionDetails: {},
    });
    result.trackSessionEnd();
    expect(trackMediaEvent).toHaveBeenCalledWith({
      playerId: "1234-5678-9101-1121",
      xdm: {
        eventType: "media.sessionEnd",
        mediaCollection: {},
      },
    });
  });
  it("when state update is called", () => {
    const result = createGetInstance({
      logger,
      trackMediaSession,
      trackMediaEvent,
      uuid,
    });
    const state = {
      name: "muted",
    };
    result.trackSessionStart({
      sessionDetails: {},
    });
    result.trackEvent("stateStart", state);
    expect(trackMediaEvent).toHaveBeenCalledWith({
      playerId: "1234-5678-9101-1121",
      xdm: {
        eventType: "media.statesUpdate",
        mediaCollection: {
          statesStart: [
            {
              name: "muted",
            },
          ],
        },
      },
    });
  });
  it("when state update is called", () => {
    const result = createGetInstance({
      logger,
      trackMediaSession,
      trackMediaEvent,
      uuid,
    });
    const state = {
      name: "muted",
    };
    result.trackSessionStart({
      sessionDetails: {},
    });
    result.trackEvent("stateEnd", state);
    expect(trackMediaEvent).toHaveBeenCalledWith({
      playerId: "1234-5678-9101-1121",
      xdm: {
        eventType: "media.statesUpdate",
        mediaCollection: {
          statesEnd: [
            {
              name: "muted",
            },
          ],
        },
      },
    });
  });
  it("when track adds is called add get's converted correctly", () => {
    const result = createGetInstance({
      logger,
      trackMediaSession,
      trackMediaEvent,
      uuid,
    });
    const advertisingDetails = {
      friendlyName: "test",
      name: "trst1",
      podPosition: 2,
      length: 100,
    };
    const adContextData = {
      affiliate: "Sample affiliate 2",
      campaign: "Sample ad campaign 2",
      "a.media.ad.advertiser": "Sample Advertiser 2",
      "a.media.ad.campaign": "csmpaign2",
    };
    result.trackSessionStart({
      sessionDetails: {},
    });
    result.trackEvent(
      "adStart",
      {
        advertisingDetails,
      },
      adContextData,
    );
    expect(trackMediaEvent).toHaveBeenCalledWith({
      playerId: "1234-5678-9101-1121",
      xdm: {
        eventType: "media.adStart",
        mediaCollection: {
          advertisingDetails: {
            friendlyName: "test",
            name: "trst1",
            podPosition: 2,
            length: 100,
            advertiser: "Sample Advertiser 2",
            campaignID: "csmpaign2",
          },
          customMetadata: [
            {
              name: "affiliate",
              value: "Sample affiliate 2",
            },
            {
              name: "campaign",
              value: "Sample ad campaign 2",
            },
          ],
        },
      },
    });
  });
});
