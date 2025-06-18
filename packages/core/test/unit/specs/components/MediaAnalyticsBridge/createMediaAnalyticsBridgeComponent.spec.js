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
import createMediaAnalyticsBridgeComponent from "../../../../../src/components/MediaAnalyticsBridge/createMediaAnalyticsBridgeComponent.js";

describe("MediaAnalyticsBridge::createMediaAnalyticsBridgeComponent", () => {
  const config = {
    streamingMedia: {
      channel: "testChannel",
      playerName: "testPlayerName",
      appVersion: "testAppVersion",
    },
  };
  let logger;
  let mediaAnalyticsBridgeComponent;
  let trackMediaEvent;
  let mediaResponseHandler;
  let trackMediaSession;
  let createMediaHelper;
  let createGetInstance;
  const build = (configs) => {
    mediaAnalyticsBridgeComponent = createMediaAnalyticsBridgeComponent({
      config: configs,
      logger,
      trackMediaEvent,
      mediaResponseHandler,
      trackMediaSession,
      createMediaHelper,
      createGetInstance,
    });
  };
  beforeEach(() => {
    logger = {
      info: vi.fn(),
    };
    mediaResponseHandler = vi.fn();
    trackMediaEvent = vi.fn();
    trackMediaSession = vi.fn();
    createMediaHelper = vi.fn();
    createGetInstance = vi.fn();
    build(config);
  });
  it("should reject promise when called with invalid config", async () => {
    build({});
    const getMediaAnalyticsTracker =
      mediaAnalyticsBridgeComponent.commands.getMediaAnalyticsTracker;
    return expect(getMediaAnalyticsTracker.run()).rejects.toThrowError();
  });
  it("should call createGetInstance when getInstance Media API is called", async () => {
    build(config);
    const { getMediaAnalyticsTracker } = mediaAnalyticsBridgeComponent.commands;
    const mediaApi = await getMediaAnalyticsTracker.run();
    mediaApi.getInstance();
    expect(createGetInstance).toHaveBeenCalled();
  });
  it("should call onBeforeMediaEvent when onBeforeEvent is called with legacy flag", async () => {
    build(config);
    const getPlayerDetails = () => {};
    const { onBeforeEvent } = mediaAnalyticsBridgeComponent.lifecycle;
    const mediaOptions = {
      legacy: true,
      playerId: "testPlayerId",
      getPlayerDetails,
    };
    const onResponseHandler = (onResponse) => {
      onResponse({
        response: {},
      });
    };
    onBeforeEvent({
      mediaOptions,
      onResponse: onResponseHandler,
    });
    expect(mediaResponseHandler).toHaveBeenCalledWith({
      getPlayerDetails,
      playerId: "testPlayerId",
      response: {},
    });
  });
  it("should not call onBeforeMediaEvent when onBeforeEvent is called without legacy flag", async () => {
    build(config);
    const getPlayerDetails = () => {};
    const { onBeforeEvent } = mediaAnalyticsBridgeComponent.lifecycle;
    const mediaOptions = {
      legacy: false,
      playerId: "testPlayerId",
      getPlayerDetails,
    };
    const onResponseHandler = (onResponse) => {
      onResponse({
        response: {},
      });
    };
    onBeforeEvent({
      mediaOptions,
      onResponse: onResponseHandler,
    });
    expect(mediaResponseHandler).not.toHaveBeenCalled();
  });
});
