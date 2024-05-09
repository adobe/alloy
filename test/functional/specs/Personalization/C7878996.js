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
  debugEnabled,
} from "../../helpers/constants/configParts/index.js";
import getResponseBody from "../../helpers/networkLogger/getResponseBody.js";
import createResponse from "../../helpers/createResponse.js";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled);
const PAGE_WIDE_SCOPE = "__view__";
createFixture({
  title:
    "C7878996: A manual notification event without propositionEventType should return a successful response",
  url: `${TEST_PAGE_URL}?test=C28755`,
  requestHooks: [networkLogger.edgeEndpointLogs],
});

test.meta({
  ID: "C7878996",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

const extractDecisionsMeta = (payload) => {
  return payload.map((decision) => {
    const { id, scope, scopeDetails } = decision;
    return { id, scope, scopeDetails };
  });
};

const createNotificationEvent = (propositions) => {
  return {
    xdm: {
      _experience: {
        decisioning: {
          propositions,
        },
      },
      eventType: "decisioning.propositionDisplay",
    },
  };
};

test("Test C7878996: A manual notification event without propositionEventType should return a successful response", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const eventResult = await alloy.sendEvent({ renderDecisions: false });

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const sendEventRequest = networkLogger.edgeEndpointLogs.requests[0];
  const requestBody = JSON.parse(sendEventRequest.request.body);
  const personalizationSchemas =
    requestBody.events[0].query.personalization.schemas;

  await t
    .expect(requestBody.events[0].query.personalization.decisionScopes)
    .eql([PAGE_WIDE_SCOPE]);

  const result = [
    "https://ns.adobe.com/personalization/default-content-item",
    "https://ns.adobe.com/personalization/dom-action",
    "https://ns.adobe.com/personalization/html-content-item",
    "https://ns.adobe.com/personalization/json-content-item",
    "https://ns.adobe.com/personalization/redirect-item",
  ].every((schema) => personalizationSchemas.includes(schema));

  await t.expect(result).eql(true);

  const response = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0]),
  );
  const personalizationPayload = createResponse({
    content: response,
  }).getPayloadsByType("personalization:decisions");

  await t.expect(personalizationPayload[0].scope).eql(PAGE_WIDE_SCOPE);
  await t.expect(eventResult.propositions[0].renderAttempted).eql(false);

  const notificationPropositions = extractDecisionsMeta(personalizationPayload);

  const notificationEvent = createNotificationEvent(notificationPropositions);

  await alloy.sendEvent(notificationEvent);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(2);
  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
});
