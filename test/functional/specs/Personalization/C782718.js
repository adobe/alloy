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
import createResponse from "../../../../src/core/createResponse";
import testPageUrl from "../../helpers/constants/testPageUrl";
import flushPromiseChains from "../../helpers/flushPromiseChains";
import createAlloyProxy from "../../helpers/createAlloyProxy";

const networkLogger = createNetworkLogger();
const config = compose(
  orgMainConfigMain,
  debugEnabled
);
const PAGE_WIDE_SCOPE = "__view__";
// spaImplementationTest=true is a query string param used for this specific target activity
createFixture({
  title: "C782718 SPA support with auto-rendering and view notifications",
  url: `${testPageUrl}?spaImplementationTest=true`,
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
        scope: decision.scope
      });
    }
  });
  return metas;
};

test.skip("Test C782718: SPA support with auto-rendering and view notifications", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);

  await alloy.sendEvent({
    renderDecisions: true,
    decisionScopes: [],
    xdm: {
      web: {
        webPageDetails: {
          viewName: "/products"
        }
      }
    }
  });
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
  ].every(schema => personalizationSchemas.includes(schema));

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

  // Let promises resolve so that the notification is sent.
  await flushPromiseChains();

  const notificationRequest = networkLogger.edgeEndpointLogs.requests[1];
  const notificationRequestBody = JSON.parse(notificationRequest.request.body);
  await t
    .expect(notificationRequestBody.events[0].xdm.eventType)
    .eql("display");
  const pageWideScopeDecisionsMeta = getDecisionsMetaByScope(
    personalizationPayload,
    PAGE_WIDE_SCOPE
  );
  await t
    // eslint-disable-next-line no-underscore-dangle
    .expect(notificationRequestBody.events[0].xdm._experience.propositions)
    .eql(pageWideScopeDecisionsMeta);
  // notification for view rendered decisions
  const viewNotificationRequest = networkLogger.edgeEndpointLogs.requests[2];
  const viewNotificationRequestBody = JSON.parse(
    viewNotificationRequest.request.body
  );
  const productsViewDecisionsMeta = getDecisionsMetaByScope(
    personalizationPayload,
    "/products"
  );
  await t
    // eslint-disable-next-line no-underscore-dangle
    .expect(viewNotificationRequestBody.events[0].xdm._experience.propositions)
    .eql(productsViewDecisionsMeta);

  // sendEvent at a view change, this shouldn't request any target data, it should use the existing cache
  await alloy.sendEvent({
    renderDecisions: true,
    decisionScopes: [],
    xdm: {
      web: {
        webPageDetails: {
          viewName: "/transformers"
        }
      }
    }
  });
  const viewChangeRequest = networkLogger.edgeEndpointLogs.requests[3];
  const viewChangeRequestBody = JSON.parse(viewChangeRequest.request.body);
  // assert that no personalization query was attached to the request
  await t.expect(viewChangeRequestBody.events[0].query).eql(undefined);
  await t
    .expect(getDecisionContent("transformers-view-spa-functional-test"))
    .eql("transformers decision for spa functional test");
  // Let promises resolve so that the notification is sent.
  await flushPromiseChains();
  // check that a render view decision notification was sent
  const transformersViewNotificationRequest =
    networkLogger.edgeEndpointLogs.requests[4];
  const transformersViewNotificationRequestBody = JSON.parse(
    transformersViewNotificationRequest.request.body
  );
  await t
    .expect(transformersViewNotificationRequestBody.events[0].xdm.eventType)
    .eql("display");
  const transformersViewDecisionsMeta = getDecisionsMetaByScope(
    personalizationPayload,
    "/transformers"
  );

  await t
    .expect(
      // eslint-disable-next-line no-underscore-dangle
      transformersViewNotificationRequestBody.events[0].xdm._experience
        .propositions
    )
    .eql(transformersViewDecisionsMeta);

  // no decisions in cache for this specific view, should only send a notification
  await alloy.sendEvent({
    renderDecisions: true,
    decisionScopes: [],
    xdm: {
      web: {
        webPageDetails: {
          viewName: "/cart"
        }
      }
    }
  });

  const cartViewChangeRequest = networkLogger.edgeEndpointLogs.requests[5];
  const cartViewChangeRequestBody = JSON.parse(
    cartViewChangeRequest.request.body
  );
  // assert that no personalization query was attached to the request
  await t.expect(cartViewChangeRequestBody.events[0].query).eql(undefined);
  // assert that a notification call with xdm.web.webPageDetails.viewName and no personalization meta is sent
  await flushPromiseChains();
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
  await t
    // eslint-disable-next-line no-underscore-dangle
    .expect(cartViewNotificationRequestBody.events[0].xdm._experience)
    .eql(undefined);
});
