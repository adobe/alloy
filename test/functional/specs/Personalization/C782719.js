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
import createFixture from "../../helpers/createFixture/index.js";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
} from "../../helpers/constants/configParts/index.js";
import getResponseBody from "../../helpers/networkLogger/getResponseBody.js";
import createResponse from "../../helpers/createResponse.js";
import { TEST_PAGE_WITH_CSP as TEST_PAGE_WITH_CSP_URL } from "../../helpers/constants/url.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled);
const PAGE_WIDE_SCOPE = "__view__";
// spaImplementationTest=true is a query string param used for this specific target activity
createFixture({
  title: "C782719 SPA support with auto-rendering disabled",
  url: `${TEST_PAGE_WITH_CSP_URL}?spaImplementationTest=true`,
  requestHooks: [networkLogger.edgeEndpointLogs],
});

test.meta({
  ID: "C782719",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

const simulatePageLoad = async (alloy) => {
  const resultingObject = await alloy.sendEvent({
    renderDecisions: false,
    xdm: {
      web: {
        webPageDetails: {
          viewName: "products",
        },
      },
    },
  });

  // assert we get in sendEvent promise decisions for "__view__" and "products"
  const assertScope = resultingObject.propositions.every((proposition) =>
    ["__view__", "products"].includes(proposition.scope),
  );
  await t.expect(assertScope).eql(true);

  // only one request was fired, because we don't send notification calls
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

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

  await t.expect(personalizationPayload.length).eql(3);

  const noPropositionsWereRendered = resultingObject.propositions.every(
    (proposition) => !proposition.renderAttempted,
  );
  await t.expect(noPropositionsWereRendered).eql(true);

  return personalizationPayload;
};

const simulateViewChange = async (alloy) => {
  // sendEvent at a view change, this shouldn't request any target data, it should use the existing cache
  const resultingObject = await alloy.sendEvent({
    renderDecisions: false,
    xdm: {
      web: {
        webPageDetails: {
          viewName: "cart",
        },
      },
    },
  });
  const viewChangeRequest = networkLogger.edgeEndpointLogs.requests[1];
  const viewChangeRequestBody = JSON.parse(viewChangeRequest.request.body);
  // assert that no personalization query was attached to the request
  await t.expect(viewChangeRequestBody.events[0].query).eql(undefined);

  // assert we return the renderAttempted flag set to false
  const noPropositionsWereRendered = resultingObject.propositions.every(
    (proposition) => !proposition.renderAttempted,
  );
  await t.expect(noPropositionsWereRendered).eql(true);
};

const simulateViewChangeForNonExistingView = async (alloy) => {
  // no decisions in cache for this specific view should return empty array
  const resultingObject = await alloy.sendEvent({
    renderDecisions: true,
    xdm: {
      web: {
        webPageDetails: {
          viewName: "noView",
        },
      },
    },
  });

  const noViewViewChangeRequest = networkLogger.edgeEndpointLogs.requests[2];
  const noViewViewChangeRequestBody = JSON.parse(
    noViewViewChangeRequest.request.body,
  );
  // assert that no personalization query was attached to the request
  await t.expect(noViewViewChangeRequestBody.events[0].query).eql(undefined);

  await t.expect(resultingObject.propositions).eql([]);
};

test("Test C782719: SPA support with auto-rendering disabled", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);

  await simulatePageLoad(alloy);

  await simulateViewChange(alloy);
  await simulateViewChangeForNonExistingView(alloy);
});
