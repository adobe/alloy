import { t } from "testcafe";
import createFixture from "../../helpers/createFixture";
import cookies from "../../helpers/cookies";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import { MAIN_IDENTITY_COOKIE_NAME } from "../../helpers/constants/cookies";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import createNetworkLogger from "../../helpers/networkLogger";

const debugEnabledConfig = compose(
  orgMainConfigMain,
  debugEnabled
);

const networkLogger = createNetworkLogger();

createFixture({
  title: "C1703722: getIdentity works when first command after configure",
  requestHooks: [networkLogger.acquireEndpointLogs]
});

test.meta({
  ID: "C1703772",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("C1703722: getIdentity works when first command after configure", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(debugEnabledConfig);
  // this should get an ECID
  const identityResponse = await alloy.getIdentity();

  await t.expect(networkLogger.acquireEndpointLogs.requests.length).eql(1);
  const identityCookieValue = await cookies.get(MAIN_IDENTITY_COOKIE_NAME);
  await t.expect(identityCookieValue).ok("No identity cookie set.");
  await t.expect(identityResponse.identity).ok("No ecid returned");
  await t.expect(identityResponse.edge.regionId).gt(0);
});
