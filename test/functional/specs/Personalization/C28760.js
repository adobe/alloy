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
  title:
    "C28760: A notification collect should be triggered if a VEC dom actions offer has been rendered",
  url: `${testServerUrl}?test=C28760`,
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C28760",
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

const extractDecisionsMeta = payload => {
  return payload.map(decision => {
    const { id, scope } = decision;
    return { id, scope };
  });
};

test("Test C28760: A notification collect should be triggered if a VEC dom actions offer has been rendered", async () => {
  await configureAlloyInstance("alloy", config);

  await triggerAlloyEvent();

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(2);

  const sendEventRequest = networkLogger.edgeEndpointLogs.requests[0];
  const requestBody = JSON.parse(sendEventRequest.request.body);
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
  await t.expect(personalizationPayload[1].scope).eql(PAGE_WIDE_SCOPE);

  const notificationPayload = extractDecisionsMeta(personalizationPayload);

  const sendNotificationRequest = networkLogger.edgeEndpointLogs.requests[1];
  const notificationRequestBody = JSON.parse(
    sendNotificationRequest.request.body
  );

  await t
    .expect(notificationRequestBody.events[0].xdm.eventType)
    .eql("display");
  await t
    .expect(notificationRequestBody.events[0].meta.personalization.decisions)
    .eql(notificationPayload);
});
