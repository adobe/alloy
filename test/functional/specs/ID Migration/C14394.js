import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import getResponseBody from "../../helpers/networkLogger/getResponseBody";
import { responseStatus } from "../../helpers/assertions";
import createFixture from "../../helpers/createFixture";
import createResponse from "../../../../src/core/createResponse";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  migrationEnabled
} from "../../helpers/constants/configParts";
import setLegacyIdentityCookie from "../../helpers/setLegacyIdentityCookie";
import createAlloyProxy from "../../helpers/createAlloyProxy";

const config = compose(
  orgMainConfigMain,
  debugEnabled,
  migrationEnabled
);

const networkLogger = createNetworkLogger();

createFixture({
  title:
    "C14394: When ID migration is enabled and no identity cookie is found but legacy identity cookie is found, the ECID will be sent on the request",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C14394",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C14394: When ID migration is enabled and no identity cookie is found but legacy identity cookie is found, the ECID will be sent on the request", async () => {
  await setLegacyIdentityCookie(orgMainConfigMain.orgId);

  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent({ renderDecisions: true });

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body
  );

  await t
    .expect(request.xdm.identityMap.ECID[0].id)
    .eql("16908443662402872073525706953453086963");

  const response = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0])
  );

  const payloads = createResponse({ content: response }).getPayloadsByType(
    "identity:result"
  );

  const ecidPayload = payloads.filter(
    payload => payload.namespace.code === "ECID"
  )[0];

  await t.expect(ecidPayload.id).eql("16908443662402872073525706953453086963");
});
