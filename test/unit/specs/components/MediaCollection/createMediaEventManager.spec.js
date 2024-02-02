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

// tests for createMediaEventManager.js

import createMediaEventManager from "../../../../../src/components/MediaCollection/createMediaEventManager";

describe("MediaCollection::createMediaEventManager", () => {
  let config;
  let eventManager;
  let consent;
  let sendEdgeNetworkRequest;
  let mediaEventManager;
  let logger;

  beforeEach(() => {
    config = {
      mediaCollection: {
        playerName: "player1",
        channel: "channel1",
        version: "1.0.0"
      }
    };
    logger = jasmine.createSpyObj("logger", ["warn"]);
    eventManager = jasmine.createSpyObj("eventManager", [
      "createEvent",
      "sendEvent"
    ]);
    consent = jasmine.createSpyObj("consent", ["awaitConsent"]);
    sendEdgeNetworkRequest = jasmine
      .createSpy("sendEdgeNetworkRequest")
      .and.returnValue(Promise.resolve());
    mediaEventManager = createMediaEventManager({
      config,
      eventManager,
      consent,
      sendEdgeNetworkRequest,
      logger
    });
  });

  it("should create a media event with user xdm", () => {
    const options = { xdm: {} };
    const event = {
      setUserXdm: jasmine.createSpy("setUserXdm"),
      toJSON: () => ({ a: 1 })
    };

    eventManager.createEvent.and.returnValue(event);

    const result = mediaEventManager.createMediaEvent({ options });

    expect(result.toJSON()).toEqual(event.toJSON());
  });

  it("should create a media session with player name, channel, and version", () => {
    const options = {
      xdm: {
        mediaCollection: {
          playerName: "player1",
          channel: "channel1",
          version: "1.0.0",
          sessionDetails: {}
        }
      }
    };

    const event = {
      setUserXdm: jasmine.createSpy("setUserXdm"),
      mergeXdm: jasmine.createSpy("mergeXdm"),
      toJSON: () => ({ a: 1 })
    };

    eventManager.createEvent.and.returnValue(event);

    const result = mediaEventManager.createMediaSession(options);

    expect(result.toJSON()).toEqual(event.toJSON());
  });

  it("should augment media event with playhead, qoeDataDetails, and sessionID", () => {
    const event = {
      mergeXdm: jasmine.createSpy("mergeXdm")
    };
    const playerId = "player1";
    const getPlayerDetails = jasmine
      .createSpy("getPlayerDetails")
      .and.returnValue({
        playhead: 10,
        qoeDataDetails: { duration: 60 }
      });
    const sessionID = "session1";

    const result = mediaEventManager.augmentMediaEvent({
      event,
      playerId,
      getPlayerDetails,
      sessionID
    });

    expect(result).toBe(event);
    expect(getPlayerDetails).toHaveBeenCalledWith({ playerId });
    expect(event.mergeXdm).toHaveBeenCalledWith({
      mediaCollection: {
        playhead: 10,
        qoeDataDetails: { duration: 60 },
        sessionID: "session1"
      }
    });
  });

  it("should track media session with event, playerId, and getPlayerDetails", () => {
    const event = {};
    const playerId = "player1";
    const getPlayerDetails = jasmine.createSpy("getPlayerDetails");

    mediaEventManager.trackMediaSession({
      event,
      playerId,
      getPlayerDetails
    });

    expect(eventManager.sendEvent).toHaveBeenCalledWith(event, {
      playerId,
      getPlayerDetails
    });
  });

  it("should track media event with action and send request to Edge Network", async () => {
    const event = jasmine.createSpyObj("event", ["finalize"]);
    const action = "play";

    consent.awaitConsent.and.returnValue(Promise.resolve());

    await mediaEventManager.trackMediaEvent({ event, action });

    expect(event.finalize).toHaveBeenCalled();
    expect(sendEdgeNetworkRequest).toHaveBeenCalled();
  });
});
