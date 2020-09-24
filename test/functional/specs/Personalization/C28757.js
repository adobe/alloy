import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
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
  title: "C28757 A VEC offer should render if renderDecision=true",
  url: `${testServerUrl}?test=C28755`,
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C28757",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const triggerAlloyEvent = ClientFunction(() => {
  return new Promise(resolve => {
    window
      .alloy("sendEvent", {
        renderDecisions: true
      })
      .then(result => {
        resolve(result);
      });
  });
});
const getDecisionContent = ClientFunction(() => {
  const container = document.getElementById("C28755");

  return container.innerText;
});

test("Test C28757: A VEC offer should render if renderDecision=true", async () => {
  await configureAlloyInstance("alloy", config);

  await triggerAlloyEvent();

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(2);

  const sendEventRequest = networkLogger.edgeEndpointLogs.requests[0];
  const requestBody = JSON.parse(sendEventRequest.request.body);
  await t
    .expect(requestBody.events[0].query.personalization.decisionScopes)
    .eql([PAGE_WIDE_SCOPE]);

  const personalizationUrls =
    requestBody.events[0].query.personalization.schemas;

  await t
    .expect(personalizationUrls)
    .contains("https://ns.adobe.com/personalization/dom-action")
    .expect(personalizationUrls)
    .contains("https://ns.adobe.com/personalization/html-content-item")
    .expect(personalizationUrls)
    .contains("https://ns.adobe.com/personalization/json-content-item")
    .expect(personalizationUrls)
    .contains("https://ns.adobe.com/personalization/redirect-item");

  const response = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0])
  );
  const personalizationPayload = createResponse(response).getPayloadsByType(
    "personalization:decisions"
  );

  await t.expect(personalizationPayload[0].scope).eql(PAGE_WIDE_SCOPE);
  await t.expect(getDecisionContent()).eql("Here is an awesome target offer!");
});
