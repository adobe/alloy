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
const scope = "alloy-test-scope-1";
const decisionId =
  "AT:eyJhY3Rpdml0eUlkIjoiMTI2NDg2IiwiZXhwZXJpZW5jZUlkIjoiMCJ9";
const decisionContent = "<h3>welcome to TARGET AWESOME WORLD!!! </h3>";

createFixture({
  title:
    "C28756: A form based offer should return if event command contains its scope",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C28756",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C28756: A form based offer should return if event command contains its scope.", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const result = await alloy.sendEvent({
    decisionScopes: [scope]
  });

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const request = networkLogger.edgeEndpointLogs.requests[0];
  const requestBody = JSON.parse(request.request.body);
  const personalizationSchemas =
    requestBody.events[0].query.personalization.schemas;

  await t
    .expect(requestBody.events[0].query.personalization.decisionScopes)
    .eql([scope, "__view__"]);

  const results = [
    "https://ns.adobe.com/personalization/html-content-item",
    "https://ns.adobe.com/personalization/json-content-item",
    "https://ns.adobe.com/personalization/redirect-item"
  ].every(schema => personalizationSchemas.includes(schema));

  await t.expect(results).eql(true);

  await t.expect(result.decisions[0].renderAttempted).eql(undefined);
  await t.expect(result.propositions[0].renderAttempted).eql(false);
  const matchingDecision = result.decisions.find(decision => {
    return decision.id === decisionId;
  });
  await t.expect(matchingDecision).ok("Decision not found.");
  await t.expect(matchingDecision.scope).eql(scope);
  await t.expect(matchingDecision.items[0].data.content).eql(decisionContent);
});
