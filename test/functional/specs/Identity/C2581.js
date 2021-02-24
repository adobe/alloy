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
  title: "C2581: Queue events when no ECID available on client",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C2581",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C2581: Queue requests until we receive an ECID.", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(debugEnabledConfig);
  // this should get an ECID
  await alloy.sendEventAsync();
  // this should wait until the first event returns
  // so it can send the ECID in the request
  await alloy.sendEvent();
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(2);

  // make sure we have an ecid
  const identityCookieValue = await cookies.get(MAIN_IDENTITY_COOKIE_NAME);
  await t.expect(identityCookieValue).ok("No identity cookie found.");

  // make sure the ecid was sent as part of the second request
  await t
    .expect(networkLogger.edgeEndpointLogs.requests[1].request.body)
    .contains(identityCookieValue);
});
