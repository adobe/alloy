import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../helpers/networkLogger";
import fixtureFactory from "../helpers/fixtureFactory";
import configureAlloyInstance from "../helpers/configureAlloyInstance";
import createResponse from "../../../src/core/createResponse";
import getResponseBody from "../helpers/networkLogger/getResponseBody";

const networkLogger = createNetworkLogger();
fixtureFactory({
  title:
    "C28756 A form based offer should return if event command contains its scope.",
  requestHooks: [networkLogger.edgeEndpointLogs]
});
test.meta({
  ID: "C28756",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});
const triggerAlloyEvent = ClientFunction(() => {
  return window.alloy("event", {
    scopes: ["C28756-1"]
  });
});
test("C28756 A form based offer should return if event command contains its scope", async () => {
  await configureAlloyInstance("alloy", {
    configId: "60928f59-0406-4353-bfe3-22ed633c4f67",
    orgId: "334F60F35E1597910A495EC2@AdobeOrg"
  });
  // trigger an event
  await triggerAlloyEvent();
  const response = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0])
  );
  const alloyResponse = createResponse(response);
  const personalizationPayloads = alloyResponse.getPayloadsByType(
    "personalization:decisions"
  );
  await t.expect(personalizationPayloads).notEql([]);

  const scopedOffer = personalizationPayloads.find(
    payload => payload.scope === "C28756-1"
  );
  await t.expect(scopedOffer).ok();
  await t
    .expect(scopedOffer.items[0].schema)
    .eql("https://ns.adobe.com/personalization/json-content-item");
});
