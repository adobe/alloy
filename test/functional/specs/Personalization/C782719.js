import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
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
// spaImplementationTest=true is a query string param used for this specific target activity
createFixture({
  title: "C782719 SPA support with auto-rendering disabled",
  url: `${TEST_PAGE_URL}?spaImplementationTest=true`,
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C782719",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const getDecisionScopes = ({ decisions }) => {
  return decisions.map(decision => {
    return decision.scope;
  });
};

// This test is skipped until the related activities are properly configured.
// https://jira.corp.adobe.com/browse/PDCL-4597
test.skip("Test C782719: SPA support with auto-rendering disabled", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const pageWideAndProductsViewDecisions = await alloy.sendEvent({
    renderDecisions: false,
    decisionScopes: [],
    xdm: {
      web: {
        webPageDetails: {
          viewName: "/products"
        }
      }
    }
  });

  // assert we get in sendEvent promise decisions for "__view__" and "/products"
  await t
    .expect(getDecisionScopes(pageWideAndProductsViewDecisions))
    .eql(["__view__", "/products"]);
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
  // sendEvent at a view change, this shouldn't request any target data, it should use the existing cache
  const transformersDecisions = await alloy.sendEvent({
    renderDecisions: false,
    decisionScopes: [],
    xdm: {
      web: {
        webPageDetails: {
          viewName: "/transformers"
        }
      }
    }
  });

  const viewChangeRequest = networkLogger.edgeEndpointLogs.requests[1];
  const viewChangeRequestBody = JSON.parse(viewChangeRequest.request.body);
  // assert that no personalization query was attached to the request
  await t.expect(viewChangeRequestBody.events[0].query).eql(undefined);
  // assert we have returned from cache decisions for "/transformers" view
  await t
    .expect(getDecisionScopes(transformersDecisions))
    .eql(["/transformers"]);

  // no decisions in cache for this specific view
  const cartDecisions = await alloy.sendEvent({
    renderDecisions: false,
    decisionScopes: [],
    xdm: {
      web: {
        webPageDetails: {
          viewName: "/cart"
        }
      }
    }
  });

  const cartViewChangeRequest = networkLogger.edgeEndpointLogs.requests[2];
  const cartViewChangeRequestBody = JSON.parse(
    cartViewChangeRequest.request.body
  );
  // assert that no personalization query was attached to the request
  await t.expect(cartViewChangeRequestBody.events[0].query).eql(undefined);
  // assert that cart decisions is undefined since we don't have cart decisions in cache
  await t.expect(cartDecisions).eql({ decisions: undefined });
});
