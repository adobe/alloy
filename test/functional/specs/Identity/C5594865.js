import { t } from "testcafe";
import createFixture from "../../helpers/createFixture";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions";
import createResponse from "../../helpers/createResponse";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import getResponseBody from "../../helpers/networkLogger/getResponseBody";
import createRandomEcid from "../../helpers/createRandomEcid";

const config = compose(orgMainConfigMain, debugEnabled);

const networkLogger = createNetworkLogger();

const TS = new Date().getTime() / 1000;
const MCMID = createRandomEcid();
const MCORGID = config.orgId;
const adobemc = encodeURIComponent(
  `TS=${TS}|MCMID=${MCMID}|MCORGID=${MCORGID}`
);

createFixture({
  url: `${TEST_PAGE_URL}?adobe_mc=${adobemc}`,
  title:
    "C5594865: Identity can be maintained across domains via the adobe_mc query string parameter",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C5594865",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("C5594865: Identity can be maintained across domains via the adobe_mc query string parameter", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent({});
  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
  const request = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body
  );
  await t.expect(request.xdm.identityMap.ECID[0].id).eql(MCMID);

  const response = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0])
  );

  const payloads = createResponse({ content: response }).getPayloadsByType(
    "identity:result"
  );

  const ecidPayload = payloads.filter(
    payload => payload.namespace.code === "ECID"
  )[0];

  await t.expect(ecidPayload.id).eql(MCMID);

  const getIdentityValue = await alloy.getIdentity();
  await t.expect(getIdentityValue.identity.ECID).eql(MCMID);
});
