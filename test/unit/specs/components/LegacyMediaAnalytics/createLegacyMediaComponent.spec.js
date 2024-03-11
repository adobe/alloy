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

import createLegacyMediaComponent from "../../../../../src/components/LegacyMediaAnalytics/createLegacyMediaComponent";

describe("LegacyMediaAnalytics::createLegacyMediaComponent", () => {
  const config = {
    mediaCollection: {
      channel: "testChannel",
      playerName: "testPlayerName",
      appVersion: "testAppVersion"
    }
  };
  let logger;
  let legacyMediaComponent;
  let trackMediaEvent;
  let onBeforeMediaEvent;
  let trackMediaSession;
  let createMediaHelper;
  let createGetInstance;

  const build = configs => {
    legacyMediaComponent = createLegacyMediaComponent({
      config: configs,
      logger,
      trackMediaEvent,
      onBeforeMediaEvent,
      trackMediaSession,
      createMediaHelper,
      createGetInstance
    });
  };

  beforeEach(() => {
    logger = jasmine.createSpyObj("logger", ["warn", "debug"]);
    onBeforeMediaEvent = jasmine.createSpy();
    trackMediaEvent = jasmine.createSpy();
    trackMediaSession = jasmine.createSpy();
    createMediaHelper = jasmine.createSpy();
    createGetInstance = jasmine.createSpy();
    build(config);
  });

  it("should call logger.warn when with invalid config", async () => {
    build({});
    const getMediaAnalyticsTracker =
      legacyMediaComponent.commands.getMediaAnalyticsTracker;
    await getMediaAnalyticsTracker.run();
    expect(logger.warn).toHaveBeenCalled();
  });

  it("should call createGetInstance when getInstance Media API is called", async () => {
    build(config);

    const { getMediaAnalyticsTracker } = legacyMediaComponent.commands;
    const mediaApi = await getMediaAnalyticsTracker.run();
    mediaApi.getInstance();
    expect(createGetInstance).toHaveBeenCalled();
  });
  it("should call onBeforeMedia Event at on response when legacy is true", async () => {
    build(config);

    const { onBeforeEvent } = legacyMediaComponent.commands;
    await onBeforeEvent.run({});
    expect(createGetInstance).toHaveBeenCalled();
  });
});
