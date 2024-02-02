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

import createMediaComponent from "../../../../../src/components/MediaCollection/createMediaComponent";

describe("MediaCollection::createComponent", () => {
  const config = {
    mediaCollection: {
      channel: "testChannel",
      playerName: "testPlayerName",
      appVersion: "testAppVersion"
    }
  };
  let logger;
  let mediaComponent;
  let trackMediaEvent;
  let mediaEventManager;
  let mediaSessionCacheManager;

  const build = configs => {
    mediaComponent = createMediaComponent({
      config: configs,
      logger,
      trackMediaEvent,
      mediaEventManager,
      mediaSessionCacheManager
    });
  };

  beforeEach(() => {
    // setup common variables
    logger = jasmine.createSpyObj("logger", ["warn"]);
    mediaEventManager = jasmine.createSpyObj("mediaEventManager", [
      "createMediaSession",
      "augmentMediaEvent",
      "trackMediaSession"
    ]);
    trackMediaEvent = jasmine.createSpy();
    mediaSessionCacheManager = jasmine.createSpyObj(
      "mediaSessionCacheManager",
      ["storeSession"]
    );
    build(config);
  });

  it("should not initialize component with invalid config", () => {
    build({});
    const options = {
      playerId: "testPlayerId",
      getPlayerDetails: () => {},
      xdm: {
        mediaCollection: {
          sessionDetails: {
            playerName: "testPlayerName"
          }
        }
      }
    };

    const createMediaSession = mediaComponent.commands.createMediaSession;
    return createMediaSession.run(options).then(() => {
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  it("should track a session", async () => {
    const sessionPromise = Promise.resolve("123");
    const playerId = "testPlayerId";
    const playerName = "testPlayerName";
    const eventType = "media.sessionStart";
    const event = { eventType };
    const getPlayerDetails = () => {};

    const options = {
      playerId,
      getPlayerDetails,
      xdm: {
        mediaCollection: {
          sessionDetails: {
            playerName
          }
        }
      }
    };
    mediaEventManager.createMediaSession.and.returnValue({ eventType });
    mediaEventManager.augmentMediaEvent.and.returnValue({
      eventType,
      xdm: {
        mediaCollection: {
          sessionDetails: {
            playerName
          },
          playhead: 0
        }
      }
    });
    mediaEventManager.trackMediaSession.and.returnValue(sessionPromise);

    const { createMediaSession } = mediaComponent.commands;

    await createMediaSession.run(options);

    expect(mediaEventManager.createMediaSession).toHaveBeenCalledWith(options);

    expect(mediaEventManager.augmentMediaEvent).toHaveBeenCalledWith({
      event,
      playerId,
      getPlayerDetails
    });

    expect(mediaEventManager.trackMediaSession).toHaveBeenCalledWith({
      event,
      playerId,
      getPlayerDetails
    });

    expect(mediaSessionCacheManager.storeSession).toHaveBeenCalledWith({
      playerId,
      sessionDetails: {
        sessionPromise,
        getPlayerDetails
      }
    });
  });

  it("should not send media event if no valid configs", async () => {
    build({});
    const options = {
      playerId: "testPlayerId",
      xdm: {
        mediaCollection: {}
      }
    };

    const { sendMediaEvent } = mediaComponent.commands;
    await sendMediaEvent.run(options);
    expect(logger.warn).toHaveBeenCalled();
  });
});
