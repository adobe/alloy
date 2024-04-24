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
import { ClientFunction, t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import createFixture from "../../helpers/createFixture";
import { compose } from "../../helpers/constants/configParts";
import getResponseBody from "../../helpers/networkLogger/getResponseBody";
import createResponse from "../../helpers/createResponse";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import orgMediaConfig from "../../helpers/constants/configParts/orgMediaConfig";
import streamingMedia from "../../helpers/constants/configParts/streamingMedia";
import { sleep } from "../Migration/helper";

const networkLogger = createNetworkLogger();
const config = compose(orgMediaConfig, streamingMedia);
createFixture({
  title: "Streaming media  for legacy migration use cases.",
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
    networkLogger.bufferStartEndpointLogs
  ]
});

test.meta({
  ID: "MA3",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const assertSessionStarted = async () => {
  await t.expect(networkLogger.edgeEndpointLogs.count(() => true)).gte(1);
  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const createSession = networkLogger.edgeEndpointLogs.requests[0];
  const requestBody = JSON.parse(createSession.request.body);
  await t.expect(requestBody.events[0].xdm.eventType).eql("media.sessionStart");
  await t.expect(requestBody.events[0].xdm.mediaCollection.playhead).eql(0);
  const response = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0])
  );
  const mediaCollectionPayload = createResponse({
    content: response
  }).getPayloadsByType("media-analytics:new-session");

  return mediaCollectionPayload[0].sessionId;
};

const assertPingsNotSent = async () => {
  await sleep(10000);
  const secondPingEventRequest = networkLogger.pingEndpointLogs.requests[2];
  await t.expect(secondPingEventRequest).eql(undefined);
};
const assertPingsSent = async sessionId => {
  await t.expect(networkLogger.pingEndpointLogs.count(() => true)).gte(1);
  const pingEventRequest = networkLogger.pingEndpointLogs.requests[0];
  const pingEvent = JSON.parse(pingEventRequest.request.body).events[0];
  await t.expect(pingEvent.xdm.mediaCollection.sessionID).eql(sessionId);
  await t.expect(pingEvent.xdm.eventType).eql("media.ping");
};
const assertEventIsSent = async (
  endpointLogs,
  eventType,
  sessionId,
  playhead,
  order = 0
) => {
  await t.expect(endpointLogs.count(() => true)).gte(order + 1);
  const eventRequest = endpointLogs.requests[order];
  await responseStatus(endpointLogs.requests, 204);

  const event = JSON.parse(eventRequest.request.body).events[0];
  await t.expect(event.xdm.mediaCollection.sessionID).eql(sessionId);
  await t.expect(event.xdm.mediaCollection.playhead).eql(playhead);
  await t.expect(event.xdm.eventType).eql(eventType);
};

const initializeTracker = ClientFunction(() => {
  return window.alloy("getMediaAnalyticsTracker").then(Media => {
    window.Media = Media;
    window.mediaTrackerInstance = Media.getInstance();
    return Media;
  });
});

const trackEvent = ClientFunction(eventType => {
  const event = window.Media.Event[eventType];
  window.mediaTrackerInstance.trackEvent(event);
});
const trackPlay = ClientFunction(() => {
  window.mediaTrackerInstance.trackPlay();
});
const trackPause = ClientFunction(() => {
  window.mediaTrackerInstance.trackPause();
});
const updatePlayhead = ClientFunction(playhead => {
  window.mediaTrackerInstance.updatePlayhead(playhead);
});

const startChapter = ClientFunction(() => {
  const chapterContextData = {
    segmentType: "Sample segment type"
  };
  const chapterInfo = window.Media.createChapterObject(
    "chapterNumber1",
    2,
    18,
    1
  );
  window.mediaTrackerInstance.trackEvent(
    window.Media.Event.ChapterStart,
    chapterInfo,
    chapterContextData
  );
});

const trackSessionStart = ClientFunction(() => {
  const Media = window.Media;
  const tracker = window.mediaTrackerInstance;
  const mediaInfo = Media.createMediaObject(
    "NinasVideoName",
    "Ninas player video",
    60,
    Media.StreamType.VOD,
    Media.MediaType.Video
  );
  const contextData = {
    isUserLoggedIn: "false",
    tvStation: "Sample TV station",
    programmer: "Sample programmer",
    assetID: "/uri-reference"
  };

  contextData[Media.VideoMetadataKeys.Episode] = "Sample Episode";
  contextData[Media.VideoMetadataKeys.Show] = "Sample Show";

  tracker.trackSessionStart(mediaInfo, contextData);
});

const trackAds = ClientFunction(() => {
  const tracker = window.mediaTrackerInstance;

  const adObject = window.Media.createAdObject("ad-name", "ad-id", 1, 15.0);

  const adMetadata = {};
  // Standard metadata keys provided by adobe.
  adMetadata[window.Media.AdMetadataKeys.Advertiser] = "Sample Advertiser";
  adMetadata[window.Media.AdMetadataKeys.CampaignId] = "Sample Campaign";
  // Custom metadata keys
  adMetadata.affiliate = "Sample affiliate";

  tracker.trackEvent(window.Media.Event.AdStart, adObject, adMetadata);

  // AdComplete
  tracker.trackEvent(window.Media.Event.AdComplete);

  // AdSkip
  tracker.trackEvent(window.Media.Event.AdSkip);

  // AdBreakStart
  const adBreakObject = window.Media.createAdBreakObject("preroll", 1, 0);
  tracker.trackEvent(window.Media.Event.AdBreakStart, adBreakObject);

  // AdBreakComplete
  tracker.trackEvent(window.Media.Event.AdBreakComplete);
});

const trackError = ClientFunction(errorId => {
  window.mediaTrackerInstance.trackError(errorId);
});

const trackPlaybackEvents = ClientFunction(() => {
  // BufferStart
  window.mediaTrackerInstance.trackEvent(window.Media.Event.BufferStart);

  // BufferComplete
  window.mediaTrackerInstance.trackEvent(window.Media.Event.BufferComplete);

  // SeekStart
  window.mediaTrackerInstance.trackEvent(window.Media.Event.SeekStart);

  // SeekComplete
  window.mediaTrackerInstance.trackEvent(window.Media.Event.SeekComplete);
});

const bitrateChange = ClientFunction(() => {
  const qoeObject = window.Media.createQoEObject(1000000, 24, 25, 10);
  window.mediaTrackerInstance.updateQoEObject(qoeObject);

  // Bitrate change
  window.mediaTrackerInstance.trackEvent(window.Media.Event.BitrateChange);
});

const stateChanges = ClientFunction(() => {
  // StateStart (ex: Mute is switched on)
  const stateObject = window.Media.createStateObject(
    window.Media.PlayerState.Mute
  );
  window.mediaTrackerInstance.trackEvent(
    window.Media.Event.StateStart,
    stateObject
  );

  // StateEnd
  window.mediaTrackerInstance.trackEvent(
    window.Media.Event.StateEnd,
    stateObject
  );
});

const sessionComplete = ClientFunction(() => {
  window.mediaTrackerInstance.trackComplete();
});

test("Test that legacy component send pings automatically and events are transformed correctly into XDM objects.", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await initializeTracker();
  await trackSessionStart();
  const sessionId = await assertSessionStarted();

  // play event
  await trackPlay();
  await assertEventIsSent(
    networkLogger.mediaPlayEndpointLogs,
    "media.play",
    sessionId,
    0
  );

  // pause event
  await trackPause();
  await assertEventIsSent(
    networkLogger.mediaPauseEndpointLogs,
    "media.pauseStart",
    sessionId,
    0
  );

  // chapter start event
  await startChapter();
  await assertEventIsSent(
    networkLogger.chapterStartEndpointLogs,
    "media.chapterStart",
    sessionId,
    0
  );

  await updatePlayhead(10);

  await trackEvent("ChapterComplete");

  // chapter skip event
  await trackEvent("ChapterSkip");

  await trackPlaybackEvents();
  // bitrate change event
  await bitrateChange();
  await stateChanges();
  // error event
  await trackError("test-buffer-start");
  // ad break start event

  await trackAds();
  await assertEventIsSent(
    networkLogger.chapterCompleteEndpointLogs,
    "media.chapterComplete",
    sessionId,
    10
  );

  await assertEventIsSent(
    networkLogger.chapterSkipEndpointLogs,
    "media.chapterSkip",
    sessionId,
    10
  );

  await assertEventIsSent(
    networkLogger.adBreakStartEndpointLogs,
    "media.adBreakStart",
    sessionId,
    10
  );
  await assertEventIsSent(
    networkLogger.adStartEndpointLogs,
    "media.adStart",
    sessionId,
    10
  );
  await assertEventIsSent(
    networkLogger.adCompleteEndpointLogs,
    "media.adComplete",
    sessionId,
    10
  );
  await assertEventIsSent(
    networkLogger.adBreakCompleteEndpointLogs,
    "media.adBreakComplete",
    sessionId,
    10
  );
  await assertEventIsSent(
    networkLogger.adSkipEndpointLogs,
    "media.adSkip",
    sessionId,
    10
  );

  await assertEventIsSent(
    networkLogger.errorEndpointLogs,
    "media.error",
    sessionId,
    10
  );

  await assertEventIsSent(
    networkLogger.bufferStartEndpointLogs,
    "media.bufferStart",
    sessionId,
    10
  );
  await assertEventIsSent(
    networkLogger.mediaPlayEndpointLogs,
    "media.play",
    sessionId,
    10,
    1
  );

  await assertEventIsSent(
    networkLogger.bitrateChangeEndpointLogs,
    "media.bitrateChange",
    sessionId,
    10
  );
  await assertEventIsSent(
    networkLogger.statesUpdateEndpointLogs,
    "media.statesUpdate",
    sessionId,
    10,
    0
  );
  await assertEventIsSent(
    networkLogger.statesUpdateEndpointLogs,
    "media.statesUpdate",
    sessionId,
    10,
    1
  );
  await sleep(10000);
  await assertPingsSent(sessionId);
  await sessionComplete();
  await sleep(10000);
  await assertPingsNotSent();
});
