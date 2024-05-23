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
const decisionContent =
  '<div id="C28755">Here is an awesome target offer!</div>';

createFixture({
  title:
    "C14317242: defaultPersonalizationEnabled should control fetching VEC offers",
  requestHooks: [networkLogger.edgeEndpointLogs],
  url: `${TEST_PAGE_URL}?test=C28755`,
});

test.meta({
  ID: "C14317242",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("Test C14317242: defaultPersonalizationEnabled should control fetching VEC offers", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  // Does not fetch offers because requestPersonalization is false.
  await alloy.sendEvent({
    personalization: { defaultPersonalizationEnabled: false },
  });
  // Fetches offers because the cache has not been initialized.
  const result2 = await alloy.sendEvent({});
  // Fetches offers because initializePersonalization is true.
  const result3 = await alloy.sendEvent({
    personalization: { defaultPersonalizationEnabled: true },
  });

  await responseStatus(networkLogger.edgeEndpointLogs.requests, [200, 207]);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(3);

  const request1 = networkLogger.edgeEndpointLogs.requests[0];
  const requestBody1 = JSON.parse(request1.request.body);
  const request2 = networkLogger.edgeEndpointLogs.requests[1];
  const requestBody2 = JSON.parse(request2.request.body);
  const request3 = networkLogger.edgeEndpointLogs.requests[2];
  const requestBody3 = JSON.parse(request3.request.body);

  await t.expect(requestBody1.events[0].query).eql(undefined);
  await t
    .expect(requestBody2.events[0].query.personalization.decisionScopes)
    .eql([PAGE_WIDE_SCOPE]);
  await t
    .expect(requestBody3.events[0].query.personalization.decisionScopes)
    .eql([PAGE_WIDE_SCOPE]);

  const response2 = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[1]),
  );
  const personalizationPayload2 = createResponse({
    content: response2,
  }).getPayloadsByType("personalization:decisions");
  await t.expect(personalizationPayload2[0].scope).eql(PAGE_WIDE_SCOPE);
  await t
    .expect(personalizationPayload2[0].items[0].data.content)
    .eql(decisionContent);

  const response3 = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[2]),
  );
  const personalizationPayload3 = createResponse({
    content: response3,
  }).getPayloadsByType("personalization:decisions");
  await t.expect(personalizationPayload3[0].scope).eql(PAGE_WIDE_SCOPE);
  await t
    .expect(personalizationPayload3[0].items[0].data.content)
    .eql(decisionContent);

  await t.expect(result2.decisions[0].renderAttempted).eql(undefined);
  await t.expect(result2.propositions[0].renderAttempted).eql(false);
  await t.expect(result2.decisions.length).eql(1);
  await t.expect(result2.decisions[0].scope).eql(PAGE_WIDE_SCOPE);
  await t
    .expect(result2.decisions[0].items[0].data.content)
    .eql(decisionContent);

  await t.expect(result3.decisions[0].renderAttempted).eql(undefined);
  await t.expect(result3.propositions[0].renderAttempted).eql(false);
  await t.expect(result3.decisions.length).eql(1);
  await t.expect(result3.decisions[0].scope).eql(PAGE_WIDE_SCOPE);
  await t
    .expect(result3.decisions[0].items[0].data.content)
    .eql(decisionContent);
});
