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
const PAGE_SURFACE = TEST_PAGE_URL.replace(/^https?:/, "web:");
const decisionContent =
  '<div id="C28755">Here is an awesome target offer!</div>';

createFixture({
  title:
    "C28755: The first sendEvent on the page should fetch Personalization VEC offers",
  requestHooks: [networkLogger.edgeEndpointLogs],
  url: `${TEST_PAGE_URL}?test=C28755`,
});

test.meta({
  ID: "C28755",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("Test C28755: The first sendEvent on the page should fetch Personalization VEC offers", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const result = await alloy.sendEvent();

  await responseStatus(networkLogger.edgeEndpointLogs.requests, [200, 207]);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const request = networkLogger.edgeEndpointLogs.requests[0];
  const requestBody = JSON.parse(request.request.body);
  const personalizationSchemas =
    requestBody.events[0].query.personalization.schemas;

  await t
    .expect(requestBody.events[0].query.personalization.decisionScopes)
    .eql([PAGE_WIDE_SCOPE]);

  const results = [
    "https://ns.adobe.com/personalization/default-content-item",
    "https://ns.adobe.com/personalization/dom-action",
    "https://ns.adobe.com/personalization/html-content-item",
    "https://ns.adobe.com/personalization/json-content-item",
    "https://ns.adobe.com/personalization/redirect-item",
  ].every((schema) => personalizationSchemas.includes(schema));

  await t.expect(results).eql(true);

  const response = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0]),
  );
  const personalizationPayload = createResponse({
    content: response,
  }).getPayloadsByType("personalization:decisions");

  const scope = personalizationPayload[0].scope;
  await t.expect([PAGE_WIDE_SCOPE, PAGE_SURFACE].includes(scope)).ok();
  const payloadContents = personalizationPayload
    .flatMap((p) => p.items)
    .map((i) => i?.data?.content)
    .filter(Boolean);
  await t.expect(payloadContents).contains(decisionContent);

  await t.expect(result.decisions[0].renderAttempted).eql(undefined);
  await t
    .expect(result.propositions.every((p) => p.renderAttempted === false))
    .ok();
  await t.expect(result.decisions.length).gte(1);
  const decisionScopes = result.decisions.map((d) => d.scope);
  await t
    .expect(
      decisionScopes.some((s) => [PAGE_WIDE_SCOPE, PAGE_SURFACE].includes(s)),
    )
    .ok();
  const decisionContents = result.decisions
    .flatMap((d) => d.items)
    .map((i) => i?.data?.content)
    .filter(Boolean);
  await t.expect(decisionContents).contains(decisionContent);
});
