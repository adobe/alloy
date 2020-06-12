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
const decisionContent =
  '<div id="C28755"> Here is an awesome target offer!</div>';

createFixture({
  title:
    "C28755: A VEC offer for all visitors should return in every event if __view__ scope exist",
  requestHooks: [networkLogger.edgeEndpointLogs],
  url: `${testServerUrl}?test=C28755`
});

test.meta({
  ID: "C28755",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const triggerAlloyEvent = ClientFunction(decisionScope => {
  return new Promise(resolve => {
    window
      .alloy("sendEvent", {
        decisionScopes: [decisionScope]
      })
      .then(result => {
        resolve(result);
      });
  });
});

test("Test C28755: A VEC offer for all visitors should return in every event if __view__ scope exist", async () => {
  await configureAlloyInstance("alloy", config);

  const result = await triggerAlloyEvent(PAGE_WIDE_SCOPE);

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const request = networkLogger.edgeEndpointLogs.requests[0];
  const requestBody = JSON.parse(request.request.body);

  await t
    .expect(requestBody.events[0].query.personalization.decisionScopes)
    .eql([PAGE_WIDE_SCOPE]);
  await t
    .expect(requestBody.events[0].query.personalization.schemas)
    .eql([
      "https://ns.adobe.com/personalization/dom-action",
      "https://ns.adobe.com/personalization/html-content-item",
      "https://ns.adobe.com/personalization/json-content-item",
      "https://ns.adobe.com/personalization/redirect-item"
    ]);

  const response = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0])
  );
  const personalizationPayload = createResponse(response).getPayloadsByType(
    "personalization:decisions"
  );

  await t.expect(personalizationPayload[0].scope).eql(PAGE_WIDE_SCOPE);
  await t
    .expect(personalizationPayload[0].items[0].data.content)
    .eql(decisionContent);

  await t.expect(result.decisions.length).eql(1);
  await t.expect(result.decisions[0].scope).eql(PAGE_WIDE_SCOPE);
  await t
    .expect(result.decisions[0].items[0].data.content)
    .eql(decisionContent);
});
