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
import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger/index.js";
import { responseStatus } from "../../helpers/assertions/index.js";
import createFixture from "../../helpers/createFixture/index.js";
import { compose } from "../../helpers/constants/configParts/index.js";
import getResponseBody from "../../helpers/networkLogger/getResponseBody.js";
import createResponse from "../../helpers/createResponse.js";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import orgMediaConfig from "../../helpers/constants/configParts/orgMediaConfig.js";
import streamingMedia from "../../helpers/constants/configParts/streamingMedia.js";
import { sleep } from "../Migration/helper.js";

const networkLogger = createNetworkLogger();
const config = compose(orgMediaConfig, streamingMedia);
createFixture({
  title: "Streaming media in non-automatic mode",
  url: TEST_PAGE_URL,
  requestHooks: [
    networkLogger.edgeEndpointLogs,
    networkLogger.mediaPauseEndpointLogs,
    networkLogger.mediaPlayEndpointLogs,
    networkLogger.chapterStartEndpointLogs,
    networkLogger.pingEndpointLogs,
    networkLogger.chapterCompleteEndpointLogs,
    networkLogger.chapterSkipEndpointLogs,
    networkLogger.adStartEndpointLogs,
    networkLogger.adBreakStartEndpointLogs,
    networkLogger.adBreakCompleteEndpointLogs,
    networkLogger.adSkipEndpointLogs,
    networkLogger.adCompleteEndpointLogs,
    networkLogger.errorEndpointLogs,
    networkLogger.sessionCompleteEndpointLogs,
    networkLogger.sessionEndEndpointLogs,
    networkLogger.statesUpdateEndpointLogs,
    networkLogger.bitrateChangeEndpointLogs,
    networkLogger.bufferStartEndpointLogs,
  ],
});

test.meta({
  ID: "MA3",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});
const assertSessionStarted = async (alloy) => {
  const sessionPromise = await alloy.createMediaSession({
    xdm: {
      mediaCollection: {
        playhead: 0,
        sessionDetails: {
          length: 60,
          contentType: "VOD",
          name: "test name of the video",
        },
      },
    },
  });
  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const createSession = networkLogger.edgeEndpointLogs.requests[0];
  const requestBody = JSON.parse(createSession.request.body);
  await t.expect(requestBody.events[0].xdm.eventType).eql("media.sessionStart");
  await t.expect(requestBody.events[0].xdm.mediaCollection.playhead).eql(0);
  const response = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0]),
  );
  const mediaCollectionPayload = createResponse({
    content: response,
  }).getPayloadsByType("media-analytics:new-session");
  await t
    .expect(mediaCollectionPayload[0].sessionId)
    .eql(sessionPromise.sessionId);

  return sessionPromise;
};

const assertPingsNotSent = async () => {
  await sleep(10000);

  const secondPingEventRequest = networkLogger.pingEndpointLogs.requests[0];
  await t.expect(secondPingEventRequest).eql(undefined);
};
const sendMediaEvent = async (
  alloy,
  eventType,
  sessionId,
  additionalData = {},
) => {
  await alloy.sendMediaEvent({
    xdm: {
      eventType,
      mediaCollection: {
        playhead: 1,
        sessionID: sessionId,
        ...additionalData,
      },
    },
  });
};

const assertEventIsSent = async (endpointLogs, eventType, sessionId) => {
  const eventRequest = endpointLogs.requests[0];
  await responseStatus(endpointLogs.requests, 204);

  const event = JSON.parse(eventRequest.request.body).events[0];
  await t.expect(event.xdm.mediaCollection.sessionID).eql(sessionId);
  await t.expect(event.xdm.eventType).eql(eventType);
};

test("Test that MC component doesn't send pings automatically", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const { sessionId } = await assertSessionStarted(alloy);
  // play event
  await sendMediaEvent(alloy, "media.play", sessionId);
  await assertEventIsSent(
    networkLogger.mediaPlayEndpointLogs,
    "media.play",
    sessionId,
  );

  // pause event
  await sendMediaEvent(alloy, "media.pauseStart", sessionId);
  await assertEventIsSent(
    networkLogger.mediaPauseEndpointLogs,
    "media.pauseStart",
    sessionId,
  );

  // chapter start event
  await sendMediaEvent(alloy, "media.chapterStart", sessionId, {
    chapterDetails: {
      friendlyName: "Chapter 1",
      length: 10,
      index: 1,
      offset: 0,
    },
  });
  await assertEventIsSent(
    networkLogger.chapterStartEndpointLogs,
    "media.chapterStart",
    sessionId,
  );

  // chapter complete event
  await sendMediaEvent(alloy, "media.chapterComplete", sessionId);
  await assertEventIsSent(
    networkLogger.chapterCompleteEndpointLogs,
    "media.chapterComplete",
    sessionId,
  );

  // chapter skip event
  await sendMediaEvent(alloy, "media.chapterSkip", sessionId);
  await assertEventIsSent(
    networkLogger.chapterSkipEndpointLogs,
    "media.chapterSkip",
    sessionId,
  );

  // ad break start event
  await sendMediaEvent(alloy, "media.adBreakStart", sessionId, {
    advertisingPodDetails: {
      friendlyName: "Mid-roll",
      offset: 0,
      index: 1,
    },
  });
  await assertEventIsSent(
    networkLogger.adBreakStartEndpointLogs,
    "media.adBreakStart",
    sessionId,
  );
  // ad start event
  await sendMediaEvent(alloy, "media.adStart", sessionId, {
    advertisingDetails: {
      friendlyName: "Ad 1",
      name: "/uri-reference/001",
      length: 10,
      advertiser: "Adobe Marketing",
      campaignID: "Adobe Analytics",
      creativeID: "creativeID",
      creativeURL: "https://creativeurl.com",
      placementID: "placementID",
      siteID: "siteID",
      podPosition: 11,
      playerName: "HTML5 player",
    },
  });
  await assertEventIsSent(
    networkLogger.adStartEndpointLogs,
    "media.adStart",
    sessionId,
  );

  // ad complete event
  await sendMediaEvent(alloy, "media.adComplete", sessionId);
  await assertEventIsSent(
    networkLogger.adCompleteEndpointLogs,
    "media.adComplete",
    sessionId,
  );
  //  ad break complete event
  await sendMediaEvent(alloy, "media.adBreakComplete", sessionId);
  await assertEventIsSent(
    networkLogger.adBreakCompleteEndpointLogs,
    "media.adBreakComplete",
    sessionId,
  );
  // ad skip event
  await sendMediaEvent(alloy, "media.adSkip", sessionId);
  await assertEventIsSent(
    networkLogger.adSkipEndpointLogs,
    "media.adSkip",
    sessionId,
  );
  // error event
  await sendMediaEvent(alloy, "media.error", sessionId, {
    errorDetails: {
      name: "test-buffer-start",
      source: "player",
    },
  });
  await assertEventIsSent(
    networkLogger.errorEndpointLogs,
    "media.error",
    sessionId,
  );
  // bitrate change event
  await sendMediaEvent(alloy, "media.bufferStart", sessionId);
  await assertEventIsSent(
    networkLogger.bufferStartEndpointLogs,
    "media.bufferStart",
    sessionId,
  );
  // bitrate change event
  await sendMediaEvent(alloy, "media.bitrateChange", sessionId, {
    qoeDataDetails: {
      framesPerSecond: 1,
      bitrate: 35000,
      droppedFrames: 30,
      timeToStart: 1364,
    },
  });
  await assertEventIsSent(
    networkLogger.bitrateChangeEndpointLogs,
    "media.bitrateChange",
    sessionId,
  );
  //  states update event
  await sendMediaEvent(alloy, "media.statesUpdate", sessionId, {
    statesStart: [
      {
        name: "mute",
      },
      {
        name: "pictureInPicture",
      },
    ],
    statesEnd: [
      {
        name: "fullScreen",
      },
    ],
  });
  await assertEventIsSent(
    networkLogger.statesUpdateEndpointLogs,
    "media.statesUpdate",
    sessionId,
  );

  await assertPingsNotSent(alloy);
});
