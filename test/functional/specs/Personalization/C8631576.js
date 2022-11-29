import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
// import highEntropyUserAgentHintsContextConfig from "../../helpers/constants/highEntropyUserAgentHintsContextConfig";
import createAlloyProxy from "../../helpers/createAlloyProxy";
// import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url";
import isUserAgentClientHintsSupported from "../../helpers/isUserAgentClientHintsSupported";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled);

const ID = "C8631576";
const DESCRIPTION = `${ID} - Visitor should qualify for an experience based on low entropy client hint`;

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
  decisionScopes: ["chromeBrowserClientHint"]
  // xdm: {
  //   web: {
  //     webPageDetails: {
  //       URL: TEST_PAGE_URL
  //     }
  //   }
  // }
};

test(DESCRIPTION, async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const eventResult = await alloy.sendEvent(sendEventOptions);

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  if (await isUserAgentClientHintsSupported()) {
    const requestHeaders =
      networkLogger.edgeEndpointLogs.requests[0].request.headers;
    await t.expect(requestHeaders["sec-ch-ua"]).ok();
    await t.expect(requestHeaders["sec-ch-ua-mobile"]).ok();
    await t.expect(requestHeaders["sec-ch-ua-platform"]).ok();

    if (requestHeaders["sec-ch-ua"].indexOf("Chrome") > -1) {
      await t.expect(eventResult.propositions.length).gt(0);
      const expectedProposition = eventResult.propositions.find(
        proposition => proposition.scope === "chromeBrowserClientHint"
      );
      await t.expect(expectedProposition).ok();
    }
  }
});
