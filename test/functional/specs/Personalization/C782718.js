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
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions";
import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import getResponseBody from "../../helpers/networkLogger/getResponseBody";
import createResponse from "../../helpers/createResponse";
import { TEST_PAGE_WITH_CSP as TEST_PAGE_WITH_CSP_URL } from "../../helpers/constants/url";
import flushPromiseChains from "../../helpers/flushPromiseChains";
import createAlloyProxy from "../../helpers/createAlloyProxy";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled);
const PAGE_WIDE_SCOPE = "__view__";
// spaImplementationTest=true is a query string param used for this specific target activity
createFixture({
  title: "C782718 SPA support with auto-rendering and view notifications",
  url: `${TEST_PAGE_WITH_CSP_URL}?spaImplementationTest=true`,
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C782718",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const getDecisionContent = ClientFunction(elementId => {
  const container = document.getElementById(elementId);

  return container.innerText;
});

const getDecisionsMetaByScope = (decisions, scope) => {
  const metas = [];
  decisions.forEach(decision => {
    if (decision.scope === scope) {
      metas.push({
        id: decision.id,
        scope: decision.scope,
        scopeDetails: decision.scopeDetails
      });
    }
  });
  return metas;
};

const simulatePageLoad = async alloy => {
  const resultingObject = await alloy.sendEvent({
    renderDecisions: true,
    xdm: {
      web: {
        webPageDetails: {
          viewName: "products"
        }
      }
    }
  });

  // asserts the request fired to Experience Edge has the expected event query
  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

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
    "https://ns.adobe.com/personalization/redirect-item"
  ].every(schema => personalizationSchemas.includes(schema));

  await t.expect(result).eql(true);

  const response = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0])
  );
  const personalizationPayload = createResponse({
    content: response
  }).getPayloadsByType("personalization:decisions");

  await t.expect(personalizationPayload.length).eql(3);

  // assert propositions were rendered for both page_load and view
  await t
    .expect(getDecisionContent("pageWideScope"))
    .eql("test for a page wide scope");
  await t
    .expect(getDecisionContent("personalization-products-container"))
    .eql("This is product view");

  // Let promises resolve so that the notification is sent.
  await flushPromiseChains();

  const notificationRequest = networkLogger.edgeEndpointLogs.requests[1];
  const notificationRequestBody = JSON.parse(notificationRequest.request.body);
  await t
    .expect(notificationRequestBody.events[0].xdm.eventType)
    .eql("decisioning.propositionDisplay");
  const pageWideScopeDecisionsMeta = getDecisionsMetaByScope(
    personalizationPayload,
    PAGE_WIDE_SCOPE
  );
  await t
    .expect(
      // eslint-disable-next-line no-underscore-dangle
      notificationRequestBody.events[0].xdm._experience.decisioning.propositions
    )
    .eql(pageWideScopeDecisionsMeta);
  await t
    .expect(
      // eslint-disable-next-line no-underscore-dangle
      notificationRequestBody.events[0].xdm._experience.decisioning
        .propositionEventType.display
    )
    .eql(1);
  // notification for view rendered decisions
  const viewNotificationRequest = networkLogger.edgeEndpointLogs.requests[2];
  const viewNotificationRequestBody = JSON.parse(
    viewNotificationRequest.request.body
  );
  const productsViewDecisionsMeta = getDecisionsMetaByScope(
    personalizationPayload,
    "products"
  );
  await t
    .expect(
      // eslint-disable-next-line no-underscore-dangle
      viewNotificationRequestBody.events[0].xdm._experience.decisioning
        .propositions
    )
    .eql(productsViewDecisionsMeta);
  await t
    .expect(
      // eslint-disable-next-line no-underscore-dangle
      viewNotificationRequestBody.events[0].xdm._experience.decisioning
        .propositionEventType.display
    )
    .eql(1);
  const allPropositionsWereRendered = resultingObject.propositions.every(
    proposition => proposition.renderAttempted
  );
  await t.expect(allPropositionsWereRendered).eql(true);

  return personalizationPayload;
};

const simulateViewChange = async (alloy, personalizationPayload) => {
  // sendEvent at a view change, this shouldn't request any target data, it should use the existing cache
  const resultingObject = await alloy.sendEvent({
    renderDecisions: true,
    decisionScopes: [],
    xdm: {
      web: {
        webPageDetails: {
          viewName: "cart"
        }
      }
    }
  });
  const viewChangeRequest = networkLogger.edgeEndpointLogs.requests[3];
  const viewChangeRequestBody = JSON.parse(viewChangeRequest.request.body);
  // assert that no personalization query was attached to the request
  await t.expect(viewChangeRequestBody.events[0].query).eql(undefined);
  await t.expect(getDecisionContent("cart")).eql("cart view proposition");
  // Let promises resolve so that the notification is sent.
  await flushPromiseChains();
  // check that the view change request payload contains the decisions that were rendered
  const cartViewDecisionsMeta = getDecisionsMetaByScope(
    personalizationPayload,
    "cart"
  );
  await t
    .expect(
      // eslint-disable-next-line no-underscore-dangle
      viewChangeRequestBody.events[0].xdm._experience.decisioning.propositions
    )
    .eql(cartViewDecisionsMeta);
  await t
    .expect(
      // eslint-disable-next-line no-underscore-dangle
      viewChangeRequestBody.events[0].xdm._experience.decisioning
        .propositionEventType.display
    )
    .eql(1);
  // assert we return the renderAttempted flag set to true
  const allPropositionsWereRendered = resultingObject.propositions.every(
    proposition => proposition.renderAttempted
  );
  await t.expect(allPropositionsWereRendered).eql(true);
};

const simulateViewChangeForNonExistingView = async alloy => {
  // no decisions in cache for this specific view, should only send a notification
  await alloy.sendEvent({
    renderDecisions: true,
    decisionScopes: [],
    xdm: {
      eventType: "noviewoffers",
      web: {
        webPageDetails: {
          viewName: "noView"
        }
      }
    }
  });

  const noViewViewChangeRequest = networkLogger.edgeEndpointLogs.requests[4];
  const noViewViewChangeRequestBody = JSON.parse(
    noViewViewChangeRequest.request.body
  );
  // assert that no personalization query was attached to the request
  await t.expect(noViewViewChangeRequestBody.events[0].query).eql(undefined);
  // assert that a notification call with xdm.web.webPageDetails.viewName and no personalization meta is sent
  await flushPromiseChains();
  const noViewNotificationRequest = networkLogger.edgeEndpointLogs.requests[5];
  const noViewNotificationRequestBody = JSON.parse(
    noViewNotificationRequest.request.body
  );
  await t
    .expect(noViewNotificationRequestBody.events[0].xdm.eventType)
    .eql("decisioning.propositionDisplay");
  await t
    .expect(
      noViewNotificationRequestBody.events[0].xdm.web.webPageDetails.viewName
    )
    .eql("noView");
  await t
    // eslint-disable-next-line no-underscore-dangle
    .expect(noViewNotificationRequestBody.events[0].xdm._experience)
    .eql(undefined);
};

test("Test C782718: SPA support with auto-rendering and view notifications", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);

  const personalizationPayload = await simulatePageLoad(alloy);

  await simulateViewChange(alloy, personalizationPayload);
  await simulateViewChangeForNonExistingView(alloy);
});
