import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import cookies from "../../helpers/cookies";
import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  thirdPartyCookiesDisabled,
  debugEnabled
} from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import { MAIN_CLUSTER_COOKIE_NAME } from "../../helpers/constants/cookies";

const networkLogger = createNetworkLogger();
const config = compose(
  orgMainConfigMain,
  debugEnabled,
  thirdPartyCookiesDisabled
);

createFixture({
  title: "C6944931: The legacy Adobe Target location hint is used.",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C6944931",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("C6944931: The legacy Adobe Target location hint is used.", async () => {
  // 38 = singapore, Konductor region ID 3
  await t.setCookies({
    name: "mboxEdgeCluster",
    value: "38",
    domain: "alloyio.com",
    path: "/"
  });
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent({});

  const locationHint = await cookies.get(MAIN_CLUSTER_COOKIE_NAME);
  await t.expect(locationHint).eql("sgp3");

  await alloy.sendEvent({});

  const urls = networkLogger.edgeEndpointLogs.requests.map(r => r.request.url);
  await t
    .expect(urls[0])
    .match(new RegExp("^https://[^/]+/[^/]+/t38/v1/interact"));
  await t
    .expect(urls[1])
    .match(new RegExp(`^https://[^/]+/[^/]+/sgp3/v1/interact`));
});
