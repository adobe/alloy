/* eslint-disable no-underscore-dangle */

import { ClientFunction, t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  thirdPartyCookiesDisabled,
  ajoConfigForStage
} from "../../helpers/constants/configParts";
import getResponseBody from "../../helpers/networkLogger/getResponseBody";
import createResponse from "../../helpers/createResponse";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import addHtmlToBody from "../../helpers/dom/addHtmlToBody";
import { testPageBody } from "../../fixtures/Personalization/C9932846";

const PAGE_WIDE_SCOPE = "__view__";
const AJO_TEST_SURFACE = "web://alloyio.com/personalizationAjo";

const networkLogger = createNetworkLogger();
const config = compose(
  orgMainConfigMain,
  ajoConfigForStage,
  debugEnabled,
  thirdPartyCookiesDisabled
);

const clickInnerTrackedElement = ClientFunction(() => {
  document
    .querySelector(
      "#root > DIV:nth-of-type(1) > DIV:nth-of-type(1) > H1:nth-of-type(1)"
    )
    .click();
});

createFixture({
  title: "C9932846: AJO click-tracking offers are delivered",
  url: `${TEST_PAGE_URL}?test=C9932846`,
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C9932846",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test.skip("Test C9932846: AJO click-tracking offers are delivered", async () => {
  await addHtmlToBody(testPageBody, true);
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const personalization = { surfaces: [AJO_TEST_SURFACE] };
  const eventResult = await alloy.sendEvent({
    renderDecisions: true,
    personalization
  });

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const sendEventRequest = networkLogger.edgeEndpointLogs.requests[0];
  const requestBody = JSON.parse(sendEventRequest.request.body);
  const personalizationSchemas =
    requestBody.events[0].query.personalization.schemas;

  await t
    .expect(requestBody.events[0].query.personalization.decisionScopes)
    .eql([PAGE_WIDE_SCOPE]);

  await t
    .expect(requestBody.events[0].query.personalization.surfaces)
    .contains(AJO_TEST_SURFACE);

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
  })
    .getPayloadsByType("personalization:decisions")
    .filter(
      payload =>
        payload.scope === AJO_TEST_SURFACE &&
        payload.items.every(item => item.data.type === "click")
    )[0];

  await t.expect(personalizationPayload.items.length).eql(2);
  await t
    .expect(personalizationPayload.items[0].characteristics.trackingLabel)
    .eql("inner-label1");
  await t.expect(personalizationPayload.items[0].data.type).eql("click");
  await t
    .expect(personalizationPayload.items[0].data.selector)
    .eql("#root > DIV:nth-of-type(1) > DIV:nth-of-type(1) > H1:nth-of-type(1)");
  await t
    .expect(personalizationPayload.items[1].characteristics.trackingLabel)
    .eql("outer-label1");
  await t.expect(personalizationPayload.items[1].data.type).eql("click");
  await t.expect(personalizationPayload.items[1].data.selector).eql("#root");

  await t.expect(eventResult.propositions[0].renderAttempted).eql(true);

  await clickInnerTrackedElement();

  const interactEventRequest = networkLogger.edgeEndpointLogs.requests[1];
  const interactEvent = JSON.parse(interactEventRequest.request.body).events[0];

  await t
    .expect(interactEvent.xdm.eventType)
    .eql("decisioning.propositionInteract");
  await t
    .expect(
      interactEvent.xdm._experience.decisioning.propositionEventType.interact
    )
    .eql(1);
  await t
    .expect(interactEvent.xdm._experience.decisioning.propositionAction.label)
    .eql("inner-label1");
  await t
    .expect(interactEvent.xdm._experience.decisioning.propositions.length)
    .eql(1);
  await t
    .expect(interactEvent.xdm._experience.decisioning.propositions[0].id)
    .eql(personalizationPayload.id);
  await t.expect(interactEvent.xdm.web.webPageDetails.viewName).notOk();
});
