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
import { sleep } from "../Migration/helper";

const networkLogger = createNetworkLogger();
const config = compose(orgMediaConfig, mediaCollection);
createFixture({
  title: "Media Collection in non-automatic mode",
  url: TEST_PAGE_URL,
  requestHooks: [
    networkLogger.edgeEndpointLogs,
    networkLogger.mediaEdgeEndpointLogs
  ]
});

test.meta({
  ID: "C28757",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test that MC component doesn't send pings or augment the events with playhead and session", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const { sessionId } = await alloy.createMediaSession({
    xdm: {
      mediaCollection: {
        playhead: 0,
        sessionDetails: {
          length: 60,
          contentType: "VOD",
          name: "test name of the video"
        }
      }
    }
  });

  await alloy.sendMediaEvent({
    xdm: {
      eventType: "media.play",
      mediaCollection: {
        playhead: 1,
        sessionID: sessionId
      }
    }
  });

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
  await t.expect(mediaCollectionPayload[0].sessionId).eql(sessionId);

  const playEventRequest = networkLogger.mediaEdgeEndpointLogs.requests[0];

  const playEvent = JSON.parse(playEventRequest.request.body).events[0];
  await t.expect(playEvent.xdm.mediaCollection.playhead).eql(1);
  await t.expect(playEvent.xdm.mediaCollection.sessionID).eql(sessionId);
  await new Promise(resolve => setTimeout(resolve, 2000));
  await sleep(10000);

  const pingEventRequest = networkLogger.mediaEdgeEndpointLogs.requests[3];
  await t.expect(pingEventRequest).eql(undefined);
});
