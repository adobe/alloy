import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
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
createFixture({
  title: "C5805675: Default content offers should be delivered",
  url: `${TEST_PAGE_URL}?test=C5805675`,
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C5805675",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const extractDecisionsMeta = payload => {
  return payload.map(decision => {
    const { id, scope, scopeDetails } = decision;
    return { id, scope, scopeDetails };
  });
};

test("C5805675: Default content offers should be delivered", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const eventResult = await alloy.sendEvent({ renderDecisions: true });

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(2);

  const sendEventRequest = networkLogger.edgeEndpointLogs.requests[0];
  const requestBody = JSON.parse(sendEventRequest.request.body);
  const personalizationSchemas =
    requestBody.events[0].query.personalization.schemas;

  await t
    .expect(requestBody.events[0].query.personalization.decisionScopes)
    .eql([PAGE_WIDE_SCOPE]);

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

  await t.expect(personalizationPayload[0].scope).eql(PAGE_WIDE_SCOPE);
  await t.expect(personalizationPayload[0].items.length).eql(1);

  const defaultContentItem = personalizationPayload[0].items[0];

  await t.expect(defaultContentItem.id).eql("0");
  await t
    .expect(defaultContentItem.schema)
    .eql("https://ns.adobe.com/personalization/default-content-item");
  await t
    .expect(defaultContentItem.meta["activity.name"])
    .eql("Functional: C5805675 AB");
  await t.expect(defaultContentItem.meta["offer.name"]).eql("Default Content");
  await t.expect(defaultContentItem.data).eql(undefined);

  await t.expect(eventResult.propositions[0].renderAttempted).eql(true);

  const notificationPayload = extractDecisionsMeta(personalizationPayload);

  const sendNotificationRequest = networkLogger.edgeEndpointLogs.requests[1];
  const notificationRequestBody = JSON.parse(
    sendNotificationRequest.request.body
  );

  await t
    .expect(notificationRequestBody.events[0].xdm.eventType)
    .eql("decisioning.propositionDisplay");
  await t
    .expect(
      // eslint-disable-next-line no-underscore-dangle
      notificationRequestBody.events[0].xdm._experience.decisioning.propositions
    )
    .eql(notificationPayload);
  await t
    .expect(
      // eslint-disable-next-line no-underscore-dangle
      notificationRequestBody.events[0].xdm._experience.decisioning
        .propositionEventType.display
    )
    .eql(1);
});
