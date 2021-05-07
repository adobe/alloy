import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled);
const PAGE_WIDE_SCOPE = "__view__";
const decisionId =
  "AT:eyJhY3Rpdml0eUlkIjoiMTI2NTYxIiwiZXhwZXJpZW5jZUlkIjoiMCJ9";
const decisionContent = '<div id="C205529">Device based offer!</div>';

createFixture({
  title: "C205529: Receive offer based on device",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C205529",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C205529: Receive offer based on device", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const result = await alloy.sendEvent({
    xdm: {
      device: {
        screenWidth: 9999
      }
    }
  });

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const request = networkLogger.edgeEndpointLogs.requests[0];
  const requestBody = JSON.parse(request.request.body);
  const personalizationSchemas =
    requestBody.events[0].query.personalization.schemas;

  await t
    .expect(requestBody.events[0].query.personalization.decisionScopes)
    .eql([PAGE_WIDE_SCOPE]);

  const requestSchemas = [
    "https://ns.adobe.com/personalization/dom-action",
    "https://ns.adobe.com/personalization/html-content-item",
    "https://ns.adobe.com/personalization/json-content-item",
    "https://ns.adobe.com/personalization/redirect-item"
  ].every(schema => personalizationSchemas.includes(schema));

  await t.expect(requestSchemas).eql(true);

  const matchingDecision = result.decisions.find(decision => {
    return decision.id === decisionId;
  });

  await t.expect(matchingDecision).ok("Decision not found.");
  await t.expect(matchingDecision.scope).eql(PAGE_WIDE_SCOPE);
  await t.expect(matchingDecision.items[0].data.content).eql(decisionContent);
});
