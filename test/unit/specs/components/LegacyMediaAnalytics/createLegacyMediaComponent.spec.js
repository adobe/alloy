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

import createLegacyMediaComponent from "../../../../../src/components/LegacyMediaAnalytics/createLegacyMediaComponent.js";

describe("LegacyMediaAnalytics::createLegacyMediaComponent", () => {
  const config = {
    streamingMedia: {
      channel: "testChannel",
      playerName: "testPlayerName",
      appVersion: "testAppVersion",
    },
  };
  let logger;
  let legacyMediaComponent;
  let trackMediaEvent;
  let mediaResponseHandler;
  let trackMediaSession;
  let createMediaHelper;
  let createGetInstance;

  const build = (configs) => {
    legacyMediaComponent = createLegacyMediaComponent({
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
    logger = jasmine.createSpyObj("logger", ["info"]);
    mediaResponseHandler = jasmine.createSpy();
    trackMediaEvent = jasmine.createSpy();
    trackMediaSession = jasmine.createSpy();
    createMediaHelper = jasmine.createSpy();
    createGetInstance = jasmine.createSpy();
    build(config);
  });

  it("should reject promise when called with invalid config", async () => {
    build({});
    const getMediaAnalyticsTracker =
      legacyMediaComponent.commands.getMediaAnalyticsTracker;

    return expectAsync(getMediaAnalyticsTracker.run()).toBeRejected();
  });

  it("should call createGetInstance when getInstance Media API is called", async () => {
    build(config);

    const { getMediaAnalyticsTracker } = legacyMediaComponent.commands;
    const mediaApi = await getMediaAnalyticsTracker.run();
    mediaApi.getInstance();
    expect(createGetInstance).toHaveBeenCalled();
  });

  it("should call onBeforeMediaEvent when onBeforeEvent is called with legacy flag", async () => {
    build(config);
    const getPlayerDetails = () => {};
    const { onBeforeEvent } = legacyMediaComponent.lifecycle;
    const mediaOptions = {
      legacy: true,
      playerId: "testPlayerId",
      getPlayerDetails,
    };
    const onResponseHandler = (onResponse) => {
      onResponse({ response: {} });
    };
    onBeforeEvent({ mediaOptions, onResponse: onResponseHandler });
    expect(mediaResponseHandler).toHaveBeenCalledWith({
      getPlayerDetails,
      playerId: "testPlayerId",
      response: {},
    });
  });

  it("should not call onBeforeMediaEvent when onBeforeEvent is called without legacy flag", async () => {
    build(config);
    const getPlayerDetails = () => {};
    const { onBeforeEvent } = legacyMediaComponent.lifecycle;
    const mediaOptions = {
      legacy: false,
      playerId: "testPlayerId",
      getPlayerDetails,
    };
    const onResponseHandler = (onResponse) => {
      onResponse({ response: {} });
    };
    onBeforeEvent({ mediaOptions, onResponse: onResponseHandler });
    expect(mediaResponseHandler).not.toHaveBeenCalled();
  });
});
