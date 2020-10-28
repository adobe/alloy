import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions";
import createFixture from "../../helpers/createFixture";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import getResponseBody from "../../helpers/networkLogger/getResponseBody";
import createResponse from "../../../../src/core/createResponse";
import testServerUrl from "../../helpers/constants/testServerUrl";

const networkLogger = createNetworkLogger();
const config = compose(
  orgMainConfigMain,
  debugEnabled
);
const PAGE_WIDE_SCOPE = "__view__";
createFixture({
  title:
    "C782718 SPA support functional test with auto-rendering and view notifications",
  url: `${testServerUrl}?spaImplementationTest=true`,
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C782718",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const pageWideScopeNotificationPayload = [
  {
    id: "AT:eyJhY3Rpdml0eUlkIjoiMTIyNzA1IiwiZXhwZXJpZW5jZUlkIjoiMCJ9",
    scope: "__view__"
  }
];
const productsViewNotificationPayload = [
  {
    id: "AT:eyJhY3Rpdml0eUlkIjoiMTIyNzA1IiwiZXhwZXJpZW5jZUlkIjoiMCJ9",
    scope: "/products"
  }
];
const transformersViewNotificationPayload = [
  {
    id: "AT:eyJhY3Rpdml0eUlkIjoiMTIyNzA1IiwiZXhwZXJpZW5jZUlkIjoiMCJ9",
    scope: "/transformers"
  }
];
const triggerAlloyEvent = ClientFunction((viewName, scopes) => {
  return new Promise(resolve => {
    window
      .alloy("sendEvent", {
        renderDecisions: true,
        decisionScopes: scopes,
        xdm: {
          web: {
            webPageDetails: {
              viewName
            }
          }
        }
      })
      .then(result => {
        resolve(result);
      });
  });
});
const getDecisionContent = ClientFunction(elementId => {
  const container = document.getElementById(elementId);

  return container.innerText;
});

test("Test C782718: SPA support functional test with auto-rendering and view notifications", async () => {
  await configureAlloyInstance("alloy", config);

  await triggerAlloyEvent("/products", []);

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(3);

  const sendEventRequest = networkLogger.edgeEndpointLogs.requests[0];
  const requestBody = JSON.parse(sendEventRequest.request.body);
  await t
    .expect(requestBody.events[0].query.personalization.decisionScopes)
    .eql([PAGE_WIDE_SCOPE]);

  const personalizationSchemas =
    requestBody.events[0].query.personalization.schemas;

  const result = [
    "https://ns.adobe.com/personalization/dom-action",
    "https://ns.adobe.com/personalization/html-content-item",
    "https://ns.adobe.com/personalization/json-content-item",
    "https://ns.adobe.com/personalization/redirect-item"
  ].every(schema => !!personalizationSchemas.find(s => s === schema));

  await t.expect(result).eql(true);

  const response = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0])
  );
  const personalizationPayload = createResponse(response).getPayloadsByType(
    "personalization:decisions"
  );

  await t.expect(personalizationPayload.length).eql(3);
  // here we should verify that we have rendered decisions for page-wide scope and for /products view
  await t
    .expect(getDecisionContent("page-wide-scope-SPA_FUNCTIONAL_TEST"))
    .eql("spa functional test - page wide scope");
  await t
    .expect(getDecisionContent("products-view-spa-functional-test"))
    .eql("products decision for spa functional test");

  const notificationRequest = networkLogger.edgeEndpointLogs.requests[1];
  const notificationRequestBody = JSON.parse(notificationRequest.request.body);
  await t
    .expect(notificationRequestBody.events[0].xdm.eventType)
    .eql("display");
  await t
    .expect(notificationRequestBody.events[0].meta.personalization.decisions)
    .eql(pageWideScopeNotificationPayload);
  // notification for view rendered decisions
  const viewNotificationRequest = networkLogger.edgeEndpointLogs.requests[2];
  const viewNotificationRequestBody = JSON.parse(
    viewNotificationRequest.request.body
  );
  await t
    .expect(
      viewNotificationRequestBody.events[0].meta.personalization.decisions
    )
    .eql(productsViewNotificationPayload);

  // sendEvent at a view change, this shouldn't request any target data, it should use the existing cache

  await triggerAlloyEvent("/transformers", []);
  const viewChangeRequest = networkLogger.edgeEndpointLogs.requests[3];
  const viewChangeRequestBody = JSON.parse(viewChangeRequest.request.body);
  // assert that no personalization query was attached to the request
  await t.expect(viewChangeRequestBody.events[0].query).eql(undefined);
  await t
    .expect(getDecisionContent("transformers-view-spa-functional-test"))
    .eql("transformers decision for spa functional test");
  // check that a render view decision notification was sent
  const transformersViewNotificationRequest =
    networkLogger.edgeEndpointLogs.requests[4];
  const transformersViewNotificationRequestBody = JSON.parse(
    transformersViewNotificationRequest.request.body
  );
  await t
    .expect(transformersViewNotificationRequestBody.events[0].xdm.eventType)
    .eql("display");
  await t
    .expect(
      transformersViewNotificationRequestBody.events[0].meta.personalization
        .decisions
    )
    .eql(transformersViewNotificationPayload);

  // no decisions in cache for this specific view, should only send a notification
  await triggerAlloyEvent("/cart", []);

  const cartViewChangeRequest = networkLogger.edgeEndpointLogs.requests[5];
  const cartViewChangeRequestBody = JSON.parse(
    cartViewChangeRequest.request.body
  );
  // assert that no personalization query was attached to the request
  await t.expect(cartViewChangeRequestBody.events[0].query).eql(undefined);
  // assert that a notification call with xdm.web.webPageDetails.viewName and no personalization meta is sent
  const cartViewNotificationRequest =
    networkLogger.edgeEndpointLogs.requests[6];
  const cartViewNotificationRequestBody = JSON.parse(
    cartViewNotificationRequest.request.body
  );
  await t
    .expect(cartViewNotificationRequestBody.events[0].xdm.eventType)
    .eql("display");
  await t
    .expect(
      cartViewNotificationRequestBody.events[0].xdm.web.webPageDetails.viewName
    )
    .eql("/cart");
  await t.expect(cartViewNotificationRequestBody.events[0].meta).eql(undefined);
});
