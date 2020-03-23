import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../helpers/networkLogger";
import { responseStatus } from "../helpers/assertions";
import fixtureFactory from "../helpers/fixtureFactory";
import baseConfig from "../helpers/constants/baseConfig";
import configureAlloyInstance from "../helpers/configureAlloyInstance";
import createResponse from "../../../src/core/createResponse";
import getResponseBody from "../helpers/networkLogger/getResponseBody";

const networkLogger = createNetworkLogger();

fixtureFactory({
  title:
    "C28754 - Consenting to no purposes should result in no data handles in the response.",
  requestHooks: [networkLogger.setConsentEndpointLogs]
});

test.meta({
  ID: "C28754",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const setConsentOut = ClientFunction(() => {
  return window.alloy("setConsent", { general: "out" });
});

test("C28754 - Consenting to no purposes should result in no data handles in the response.", async () => {
  await configureAlloyInstance("alloy", {
    defaultConsent: { general: "pending" },
    ...baseConfig
  });

  // Revoke consent.
  await setConsentOut();

  await responseStatus(networkLogger.setConsentEndpointLogs.requests, 200);

  const response = JSON.parse(
    getResponseBody(networkLogger.setConsentEndpointLogs.requests[0])
  );

  const alloyResponse = createResponse(response);

  const idSyncsPayload = alloyResponse.getPayloadsByType("identity:exchange");
  const personalizationPayload = alloyResponse.getPayloadsByType(
    "personalization:decisions"
  );
  const audiencesPayload = alloyResponse.getPayloadsByType("activation:push");

  await t.expect(idSyncsPayload).eql([]);
  await t.expect(personalizationPayload).eql([]);
  await t.expect(audiencesPayload).eql([]);
});
