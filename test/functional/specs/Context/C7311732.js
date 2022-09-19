import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import createFixture from "../../helpers/createFixture";
import highEntropyUserAgentHintsContextConfig from "../../helpers/constants/highEntropyUserAgentHintsContextConfig";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url";
import isUserAgentClientHintsSupported from "../../helpers/isUserAgentClientHintsSupported";

const networkLogger = createNetworkLogger();

const ID = "C7311732";
const DESCRIPTION = `${ID} - Adds only userAgentClientHints context data when only highEntropyUserAgentHints is specified in configuration.`;

createFixture({
  title: DESCRIPTION,
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID,
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const sendEventOptions = {
  xdm: {
    web: {
      webPageDetails: {
        URL: TEST_PAGE_URL
      }
    }
  }
};

test(DESCRIPTION, async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(highEntropyUserAgentHintsContextConfig);
  await alloy.sendEvent(sendEventOptions);

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const parsedBody = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body
  );

  await t.expect(parsedBody.events[0].xdm.placeContext).notOk();
  await t.expect(parsedBody.events[0].xdm.web.webPageDetails).ok();
  await t.expect(parsedBody.events[0].xdm.device).notOk();
  if (await isUserAgentClientHintsSupported()) {
    await t.expect(parsedBody.events[0].xdm.environment.type).notOk();
    await t
      .expect(
        parsedBody.events[0].xdm.environment.browserDetails.userAgentClientHints
      )
      .ok();
  }
});
