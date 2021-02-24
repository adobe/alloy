import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions";
import createFixture from "../../helpers/createFixture";
import createResponse from "../../../../src/core/createResponse";
import getResponseBody from "../../helpers/networkLogger/getResponseBody";
import {
  compose,
  orgMainConfigMain,
  consentPending
} from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";

import { CONSENT_OUT } from "../../helpers/constants/consent";

const config = compose(
  orgMainConfigMain,
  consentPending
);

const networkLogger = createNetworkLogger();

createFixture({
  title:
    "C28754 - Consenting to no purposes should result in no data handles in the response.",
  requestHooks: [networkLogger.setConsentEndpointLogs]
});

test.meta({
  ID: "C28754",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("C28754 - Consenting to no purposes should result in no data handles in the response.", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);

  await alloy.setConsent(CONSENT_OUT);
  await responseStatus(networkLogger.setConsentEndpointLogs.requests, 200);

  const response = JSON.parse(
    getResponseBody(networkLogger.setConsentEndpointLogs.requests[0])
  );

  const alloyResponse = createResponse({ content: response });

  const idSyncsPayload = alloyResponse.getPayloadsByType("identity:exchange");
  const personalizationPayload = alloyResponse.getPayloadsByType(
    "personalization:decisions"
  );
  const audiencesPayload = alloyResponse.getPayloadsByType("activation:push");

  await t.expect(idSyncsPayload).eql([]);
  await t.expect(personalizationPayload).eql([]);
  await t.expect(audiencesPayload).eql([]);
});
