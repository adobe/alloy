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
import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  thirdPartyCookiesDisabled,
  ajoConfigForStage
} from "../../helpers/constants/configParts";
import getResponseBody from "../../helpers/networkLogger/getResponseBody";
import createResponse from "../../helpers/createResponse";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url";
import createAlloyProxy from "../../helpers/createAlloyProxy";

const PAGE_WIDE_SCOPE = "__view__";
const AJO_TEST_SURFACE = "web://alloyio.com/personalizationAjo";

const networkLogger = createNetworkLogger();
const config = compose(
  orgMainConfigMain,
  ajoConfigForStage,
  debugEnabled,
  thirdPartyCookiesDisabled
);

createFixture({
  title: "C7638574: AJO offers for custom surface are delivered",
  url: `${TEST_PAGE_URL}?test=C7638574`,
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C7638574",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C7638574: AJO offers for custom surface are delivered", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const personalization = { surfaces: [AJO_TEST_SURFACE] };
  const eventResult = await alloy.sendEvent({
    renderDecisions: true,
    personalization
  });

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const sendEventRequest = networkLogger.edgeEndpointLogs.requests[0];
  const requestBody = JSON.parse(sendEventRequest.request.body);
  const personalizationSchemas =
    requestBody.events[0].query.personalization.schemas;

  await t
    .expect(requestBody.events[0].query.personalization.decisionScopes)
    .eql([PAGE_WIDE_SCOPE]);

  await t
    .expect(requestBody.events[0].query.personalization.surfaces)
    .contains(AJO_TEST_SURFACE);

  const result = [
    "https://ns.adobe.com/personalization/default-content-item",
    "https://ns.adobe.com/personalization/dom-action",
    "https://ns.adobe.com/personalization/html-content-item",
    "https://ns.adobe.com/personalization/json-content-item",
    "https://ns.adobe.com/personalization/redirect-item"
  ].every(schema => personalizationSchemas.includes(schema));

  await t.expect(result).eql(true);

  const response = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0])
  );
  const personalizationPayload = createResponse({
    content: response
  })
    .getPayloadsByType("personalization:decisions")
    .filter(
      payload =>
        payload.scope === AJO_TEST_SURFACE &&
        payload.items.some(item => item.data.type === "setHtml")
    )[0];

  await t.expect(personalizationPayload.items.length).eql(1);
  await t
    .expect(personalizationPayload.items[0].data.content)
    .eql("Welcome AJO Sandbox!");

  await t.expect(eventResult.propositions[0].renderAttempted).eql(true);
});
