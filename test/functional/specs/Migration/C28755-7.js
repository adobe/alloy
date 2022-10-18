import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import { TEST_PAGE, TEST_PAGE_AT_JS_TWO } from "../../helpers/constants/url";
import {
  fetchMboxOfferWithParam,
  getPropositionCustomContent,
  injectAlloyAndSendEvent,
  sleep
} from "./helper";
import getResponseBody from "../../helpers/networkLogger/getResponseBody";
import createResponse from "../../helpers/createResponse";
import migrationEnabled from "../../helpers/constants/configParts/migrationEnabled";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled, migrationEnabled, {
  targetMigrationEnabled: true
});
const favoriteColor = "red-1234";
createFixture({
  title:
    "Mixed mode profile migration use case: AT.js is called first then we navigate to a page with Web SDK",
  requestHooks: [
    networkLogger.edgeEndpointLogs,
    networkLogger.targetDeliveryEndpointLogs
  ],
  url: `${TEST_PAGE_AT_JS_TWO}`,
  includeAlloyLibrary: false
});

test.meta({
  ID: "C28755",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Mixed mode profile migration use case: AT.js is called first then we navigate to a page with Web SDK", async () => {
  //  delivery API request
  await fetchMboxOfferWithParam(favoriteColor);
  await sleep(2000);
  const deliveryRequest = networkLogger.targetDeliveryEndpointLogs.requests[1];
  await t.expect(deliveryRequest.response.statusCode).eql(200);
  const requestBody = JSON.parse(deliveryRequest.request.body);
  const { marketingCloudVisitorId } = requestBody.id;

  // NAVIGATE to a web sdk page
  await t.navigateTo(TEST_PAGE);
  await injectAlloyAndSendEvent(config, { decisionScopes: ["nina1234"] });
  const sendEventRequest = networkLogger.edgeEndpointLogs.requests[0];
  const response = JSON.parse(getResponseBody(sendEventRequest));
  const identityRequestBody = JSON.parse(sendEventRequest.request.body);
  const ecid = identityRequestBody.xdm.identityMap.ECID[0].id;

  // expect same ecid is used in both requests
  await t.expect(marketingCloudVisitorId).eql(ecid);
  const personalizationPayload = createResponse({
    content: response
  }).getPayloadsByType("personalization:decisions");

  const propositionCustomContent = getPropositionCustomContent(
    personalizationPayload
  );
  // expect to get a offer based on the profile attr updated in the previous call using legacy libs
  await t
    .expect(propositionCustomContent)
    .eql(`The favorite Color for this visitor is ${favoriteColor}.`);
});
