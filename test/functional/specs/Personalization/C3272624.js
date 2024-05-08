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
import createNetworkLogger from "../../helpers/networkLogger/index.js";
import { responseStatus } from "../../helpers/assertions/index.js";
import createFixture from "../../helpers/createFixture/index.js";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts/index.js";
import getResponseBody from "../../helpers/networkLogger/getResponseBody.js";
import createResponse from "../../helpers/createResponse.js";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled);
const PAGE_WIDE_SCOPE = "__view__";
const decisionContent =
  '<span id="action_insert_1622750393761927">C3272624: An activity based on profile data attribute: `favoriteCategory`</span>';

createFixture({
  title: "C3272624: Support passing profile attributes and qualify for offers",
  url: `${TEST_PAGE_URL}?test=C3272624`,
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C3272624",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C3272624: Support passing profile attributes and qualify for offers", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent({
    renderDecisions: true,
    data: {
      __adobe: {
        target: {
          "profile.favoriteCategory": "shoes"
        }
      }
    }
  });

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(2);

  const sendEventRequest = networkLogger.edgeEndpointLogs.requests[0];
  const requestBody = JSON.parse(sendEventRequest.request.body);

  await t
    .expect(requestBody.events[0].query.personalization.decisionScopes)
    .eql([PAGE_WIDE_SCOPE]);

  const response = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0])
  );
  const personalizationPayload = createResponse({
    content: response
  }).getPayloadsByType("personalization:decisions");

  await t.expect(personalizationPayload[0].scope).eql(PAGE_WIDE_SCOPE);

  await t
    .expect(personalizationPayload[0].items[0].data.content)
    .eql(decisionContent);

  // Change the value of `favoriteCategory` profile attribute to `shirts`.
  // Offer should not return in the response.

  await alloy.sendEvent({
    renderDecisions: true,
    data: {
      __adobe: {
        target: {
          "profile.favoriteCategory": "shirts"
        }
      }
    }
  });

  const responseTwo = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[1])
  );
  const personalizationPayloadTwo = createResponse({
    content: responseTwo
  }).getPayloadsByType("personalization:decisions");

  await t.expect(personalizationPayloadTwo.length).eql(0);
});
