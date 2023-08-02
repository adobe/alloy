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
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import getResponseBody from "../../helpers/networkLogger/getResponseBody";
import createResponse from "../../helpers/createResponse";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url";
import createAlloyProxy from "../../helpers/createAlloyProxy";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled);
const PAGE_WIDE_SCOPE = "__view__";
const FORM_BASED_SCOPE = "form-based-scope";

const DEFAULT_CONTENT_ITEM = {
  id: "0",
  schema: "https://ns.adobe.com/personalization/default-content-item",
  meta: {
    "activity.id": "139738",
    "activity.name": "Functional: C5805676",
    "experience.id": "0",
    "offer.id": "0",
    "offer.name": "Default Content"
  }
};

const MEASUREMENT_ITEM = {
  id: "139738",
  schema: "https://ns.adobe.com/personalization/measurement",
  data: {
    format: "application/vnd.adobe.target.metric",
    type: "click"
  }
};

createFixture({
  title: "C5805676: Merged metric propositions should be delivered",
  url: `${TEST_PAGE_URL}?test=C5805676`,
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C5805676",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C5805676: Merged metric propositions should be delivered", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const eventResult = await alloy.sendEvent({
    decisionScopes: [FORM_BASED_SCOPE]
  });

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const sendEventRequest = networkLogger.edgeEndpointLogs.requests[0];
  const requestBody = JSON.parse(sendEventRequest.request.body);
  const personalizationSchemas =
    requestBody.events[0].query.personalization.schemas;

  await t
    .expect(requestBody.events[0].query.personalization.decisionScopes)
    .eql([FORM_BASED_SCOPE, PAGE_WIDE_SCOPE]);

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
  }).getPayloadsByType("personalization:decisions");

  await t.expect(personalizationPayload[0].scope).eql(FORM_BASED_SCOPE);
  await t.expect(personalizationPayload[0].items.length).eql(2);

  await t.expect(personalizationPayload[0].items[0]).eql(DEFAULT_CONTENT_ITEM);
  await t.expect(personalizationPayload[0].items[1]).eql(MEASUREMENT_ITEM);

  const formBasedScopePropositions = eventResult.propositions.filter(
    proposition => proposition.scope === FORM_BASED_SCOPE
  );

  await t.expect(formBasedScopePropositions.length).eql(1);
  await t.expect(formBasedScopePropositions[0].items.length).eql(2);
  await t.expect(formBasedScopePropositions[0].renderAttempted).eql(false);
  await t
    .expect(formBasedScopePropositions[0].items[0])
    .eql(DEFAULT_CONTENT_ITEM);
  await t.expect(formBasedScopePropositions[0].items[1]).eql(MEASUREMENT_ITEM);
});
