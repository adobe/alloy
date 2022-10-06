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
  title:
    "C6589015: The Experience Edge location hint is used on the second request.",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C6589015",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("C6589015: The Experience Edge location hint is used on the second request.", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent({});

  const locationHint = await cookies.get(MAIN_CLUSTER_COOKIE_NAME);
  await t.expect(locationHint).ok();

  await alloy.sendEvent({});

  const urls = networkLogger.edgeEndpointLogs.requests.map(r => r.request.url);
  await t.expect(urls[0]).match(new RegExp("^https://[^/]+/[^/]+/v1/interact"));
  await t
    .expect(urls[1])
    .match(new RegExp(`^https://[^/]+/[^/]+/${locationHint}/v1/interact`));
});
