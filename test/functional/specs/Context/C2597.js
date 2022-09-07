import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import createFixture from "../../helpers/createFixture";
import { orgMainConfigMain } from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import isUserAgentClientHintsSupported from "../../helpers/isUserAgentClientHintsSupported";

const networkLogger = createNetworkLogger();

const ID = "C2597";
const DESCRIPTION = `${ID} - Adds all context data to requests by default.`;

createFixture({
  title: DESCRIPTION,
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID,
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test(DESCRIPTION, async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(orgMainConfigMain);
  await alloy.sendEvent();

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const parsedBody = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body
  );

  await t.expect(parsedBody.events[0].xdm.device).ok();
  await t.expect(parsedBody.events[0].xdm.placeContext).ok();
  await t.expect(parsedBody.events[0].xdm.environment.type).ok();
  await t.expect(parsedBody.events[0].xdm.web.webPageDetails).ok();
  if (await isUserAgentClientHintsSupported()) {
    await t
      .expect(
        parsedBody.events[0].xdm.environment.browserDetails.userAgentClientHints
      )
      .notOk();
  }
});
