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
import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import createFixture from "../../helpers/createFixture";
import { compose } from "../../helpers/constants/configParts";
import getResponseBody from "../../helpers/networkLogger/getResponseBody";
import createResponse from "../../helpers/createResponse";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import orgMediaConfig from "../../helpers/constants/configParts/orgMediaConfig";
import mediaCollection from "../../helpers/constants/configParts/mediaCollection";

const networkLogger = createNetworkLogger();
const config = compose(orgMediaConfig, mediaCollection);
createFixture({
  title: "Implement Media Collection in automatic mode",
  url: TEST_PAGE_URL,
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C28757",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test : Implement Media Collection in automatic mode", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const sessionResult = await alloy.createMediaSession({
    playerId: "player1",
    xdm: {
      mediaCollection: {
        sessionDetails: {
          length: 60,
          contentType: "VOD",
          name: "test name of the video"
        }
      }
    },
    onBeforeMediaEvent: () => {
      return {
        playhead: 3,
        qoeDataDetails: {
          bitrate: 1,
          droppedFrames: 2,
          framesPerSecond: 3,
          timeToStart: 4
        }
      };
    }
  });
  const playEventResult = await alloy.sendMediaEvent({
    playerId: "player1",
    xdm: {
      eventType: "media.play"
    }
  });
  console.log("play", playEventResult);

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const createSession = networkLogger.edgeEndpointLogs.requests[0];
  const requestBody = JSON.parse(createSession.request.body);
  await t.expect(requestBody.events[0].xdm.eventType).eql("media.sessionStart");
  await t.expect(requestBody.events[0].xdm.mediaCollection.playhead).eql(3);
  const response = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0])
  );
  const mediaCollectionPayload = createResponse({
    content: response
  }).getPayloadsByType("media-analytics:new-session");
  await t
    .expect(mediaCollectionPayload[0].sessionId)
    .eql(sessionResult.sessionId);
  const playEvent = networkLogger.mediaEdgeEndpointLogs.requests;
  const playEventBody = JSON.parse(playEvent.request.body).events[0];
  await t.expect(playEventBody.xdm.mediaCollection.playhead).eql(3);
  await t
    .expect(playEventBody.xdm.mediaCollection.sessionID)
    .eql(sessionResult.sessionId);
});
