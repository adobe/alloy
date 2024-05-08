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
  thirdPartyCookiesDisabled,
  ajoConfigForStage
} from "../../helpers/constants/configParts/index.js";
import getResponseBody from "../../helpers/networkLogger/getResponseBody.js";
import createResponse from "../../helpers/createResponse.js";
import { TEST_PAGE_WITH_CSP } from "../../helpers/constants/url.js";
import flushPromiseChains from "../../helpers/flushPromiseChains.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";

const networkLogger = createNetworkLogger();
const config = compose(
  orgMainConfigMain,
  ajoConfigForStage,
  debugEnabled,
  thirdPartyCookiesDisabled
);
const AJO_TEST_SURFACE = "web://alloyio.com/personalizationAjoSpa";

createFixture({
  title: "C11389844: AJO SPA support",
  url: `${TEST_PAGE_WITH_CSP}?test=C11389844`,
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C11389844",
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

const addContentContainer = () => {
  return addHtmlToBody(
    `<div
        style={{ border: "1px solid red" }}
        id="personalization-products-container-ajo"
        className="personalization-container"
      >
        This is the AJO personalization placeholder for the products view.
        Personalized content has not been loaded.
      </div>`
  );
};

const simulatePageLoad = async alloy => {
  const personalization = { surfaces: [AJO_TEST_SURFACE] };

  await alloy.sendEvent({
    renderDecisions: true,
    personalization
  });

  // asserts the request fired to Experience Edge has the expected event query
  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  const sendEventRequest = networkLogger.edgeEndpointLogs.requests[0];
  const requestBody = JSON.parse(sendEventRequest.request.body);
  const surfaces = requestBody.events[0].query.personalization.surfaces;
  const hasSurfaces = surfaces.includes(AJO_TEST_SURFACE);

  await t.expect(hasSurfaces).eql(true);

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

  await t.expect(personalizationPayload.length).eql(1);
  await flushPromiseChains();

  return personalizationPayload;
};

const simulateViewChange = async (alloy, personalizationPayload) => {
  // sendEvent at a view change, this shouldn't request any data, it should use the existing cache
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

  const viewChangeRequest = networkLogger.edgeEndpointLogs.requests[1];
  const viewChangeRequestBody = JSON.parse(viewChangeRequest.request.body);
  const event = viewChangeRequestBody.events[0];
  const query = event.query;
  const web = event.xdm.web;
  // eslint-disable-next-line no-underscore-dangle
  const experience = event.xdm._experience;

  // assert that no personalization query was attached to the request
  await t.expect(query).eql(undefined);
  // assert that no personalization query was attached to the request
  await t.expect(web.webPageDetails.viewName).eql("products");

  await t
    .expect(getDecisionContent("personalization-products-container-ajo"))
    .eql("Welcome to AJO SPA products!");

  // Let promises resolve so that the notification is sent.
  await flushPromiseChains();

  // check that the view change request payload contains
  // the decisions that were rendered
  const productsViewDecisionsMeta = getDecisionsMetaByScope(
    personalizationPayload,
    "products"
  );

  await t
    .expect(experience.decisioning.propositions)
    .eql(productsViewDecisionsMeta);
  await t.expect(experience.decisioning.propositionEventType.display).eql(1);

  // assert we return the renderAttempted flag set to true
  const allPropositionsWereRendered = resultingObject.propositions.every(
    proposition => proposition.renderAttempted
  );

  await t.expect(allPropositionsWereRendered).eql(true);
};

test.skip("Test C11389844: AJO SPA support", async () => {
  const alloy = createAlloyProxy();

  await alloy.configure(config);
  await addContentContainer();

  const personalizationPayload = await simulatePageLoad(alloy);

  await simulateViewChange(alloy, personalizationPayload);
});
