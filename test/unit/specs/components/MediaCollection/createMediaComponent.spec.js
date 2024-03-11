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
  let onBeforeMediaEvent;
  let trackMediaSession;

  const build = configs => {
    mediaComponent = createMediaComponent({
      config: configs,
      logger,
      trackMediaEvent,
      onBeforeMediaEvent,
      trackMediaSession
    });
  };

  beforeEach(() => {
    logger = jasmine.createSpyObj("logger", ["warn"]);
    onBeforeMediaEvent = jasmine.createSpy();
    trackMediaEvent = jasmine.createSpy();
    trackMediaSession = jasmine.createSpy();
    build(config);
  });

  it("should call trackSession when with invalid config", async () => {
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
    await createMediaSession.run(options);
    expect(trackMediaSession).toHaveBeenCalled();
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
    return expectAsync(sendMediaEvent.run(options)).toBeRejected();
  });
});
