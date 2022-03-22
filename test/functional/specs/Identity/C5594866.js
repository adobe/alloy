import { t } from "testcafe";
import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import createNetworkLogger from "../../helpers/networkLogger";
import createResponse from "../../helpers/createResponse";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import getResponseBody from "../../helpers/networkLogger/getResponseBody";
import reloadPage from "../../helpers/reloadPage";
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
  title:
    "C5594866: Identity can be changed via the adobe_mc query string parameter",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "CqueryString1",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("C5594866: Identity can be changed via the adobe_mc query string parameter", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  // establish an identity cookie
  await alloy.sendEvent({});

  await reloadPage(`adobe_mc=${adobemc}`);
  await alloy.configure(config);
  await alloy.sendEvent({});

  const response = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[1])
  );

  const payloads = createResponse({ content: response }).getPayloadsByType(
    "identity:result"
  );

  const ecidPayload = payloads.filter(
    payload => payload.namespace.code === "ECID"
  )[0];

  await t.expect(ecidPayload.id).eql(MCMID);

  const ecid = await alloy.getIdentity();
  await t.expect(ecid.identity.ECID).eql(MCMID);
});
