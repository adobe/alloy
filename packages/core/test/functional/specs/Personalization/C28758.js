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
import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger/index.js";
import { responseStatus } from "../../helpers/assertions/index.js";
import createFixture from "../../helpers/createFixture/index.js";
import addHtmlToBody from "../../helpers/dom/addHtmlToBody.js";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
} from "../../helpers/constants/configParts/index.js";
import getResponseBody from "../../helpers/networkLogger/getResponseBody.js";
import createResponse from "../../helpers/createResponse.js";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import { injectInlineScript } from "../../helpers/createFixture/clientScripts.js";
import {
  shadowDomScript,
  shadowDomFixture,
} from "../../fixtures/Personalization/C28758.js";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled);
const PAGE_WIDE_SCOPE = "__view__";

const ieDetected = ClientFunction(() => !!document.documentMode);

createFixture({
  title: "C28758 A VEC offer with ShadowDOM selectors should render",
  url: `${TEST_PAGE_URL}?test=C28758`,
  requestHooks: [networkLogger.edgeEndpointLogs],
});

test.meta({
  ID: "C28758",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

const getSimpleShadowLabelText = ClientFunction(() => {
  const form = document.getElementById("form");
  const simpleShadowLabel =
    form.children[1].shadowRoot.children[0].getElementsByTagName("label")[1];

  return simpleShadowLabel.innerText;
});

const getNestedShadowLabelText = ClientFunction(() => {
  const form = document.getElementById("form");
  const nestedShadowLabel = form.children[3].shadowRoot
    .querySelector("buy-now-button")
    .shadowRoot.children[0].getElementsByTagName("label")[0];

  return nestedShadowLabel.innerText;
});

test("Test C28758: A VEC offer with ShadowDOM selectors should render", async () => {
  if (await ieDetected()) {
    return;
  }

  await injectInlineScript(shadowDomScript);
  await addHtmlToBody(shadowDomFixture);

  const alloy = createAlloyProxy();
  await alloy.configure(config);

  const eventResult = await alloy.sendEvent({ renderDecisions: true });

  await responseStatus(networkLogger.edgeEndpointLogs.requests, [200, 207]);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(2);

  const sendEventRequest = networkLogger.edgeEndpointLogs.requests[0];
  const requestBody = JSON.parse(sendEventRequest.request.body);

  await t
    .expect(requestBody.events[0].query.personalization.decisionScopes)
    .eql([PAGE_WIDE_SCOPE]);

  const personalizationSchemas =
    requestBody.events[0].query.personalization.schemas;

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

  await t.expect(getSimpleShadowLabelText()).eql("Simple Shadow offer!");
  await t.expect(getNestedShadowLabelText()).eql("Nested Shadow offer!");

  await t.expect(eventResult.decisions).eql([]);
  await t.expect(eventResult.propositions[0].renderAttempted).eql(true);
});
