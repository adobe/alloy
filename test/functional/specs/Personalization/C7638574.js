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

const PAGE_WIDE_SCOPE = "__view__";
const AJO_TEST_SURFACE = "web://alloyio.com/personalizationAjo";

const networkLogger = createNetworkLogger();
const cjmStageOrgConfig = {
  edgeDomain: "edge-int.adobedc.net",
  edgeConfigId: "19fc5fe9-37df-46da-8f5c-9eeff4f75ed9:prod",
  orgId: "745F37C35E4B776E0A49421B@AdobeOrg",
  edgeBasePath: "ee",
  thirdPartyCookiesEnabled: false
};
const config = compose(orgMainConfigMain, cjmStageOrgConfig, debugEnabled);

createFixture({
  title: "C7638574: AJO offers for custom surface are delivered",
  url: `${TEST_PAGE_URL}?test=C7638574`,
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C7638574",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test.skip("C7638574: AJO offers for custom surface are delivered", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const personalization = { surfaces: [AJO_TEST_SURFACE] };
  const eventResult = await alloy.sendEvent({
    renderDecisions: true,
    personalization
  });

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

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
  }).getPayloadsByType("personalization:decisions");

  await t.expect(personalizationPayload[0].scope).eql(AJO_TEST_SURFACE);
  await t.expect(personalizationPayload[0].items.length).eql(1);
  await t
    .expect(personalizationPayload[0].items[0].data.content)
    .eql("Welcome AJO Sandbox!");

  await t.expect(eventResult.propositions[0].renderAttempted).eql(true);
});
