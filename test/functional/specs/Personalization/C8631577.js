import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import createFixture from "../../helpers/createFixture";
import { compose, debugEnabled } from "../../helpers/constants/configParts";
import highEntropyUserAgentHintsContextConfig from "../../helpers/constants/highEntropyUserAgentHintsContextConfig";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import isUserAgentClientHintsSupported from "../../helpers/isUserAgentClientHintsSupported";

const networkLogger = createNetworkLogger();
const config = compose(highEntropyUserAgentHintsContextConfig, debugEnabled);

const ID = "C8631577";
const DESCRIPTION = `${ID} - Visitor should qualify for an experience based on high entropy client hint`;

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
  decisionScopes: ["64BitClientHint"]
};

test(DESCRIPTION, async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const eventResult = await alloy.sendEvent(sendEventOptions);

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  // Tests must be run using https otherwise this will return false
  if (await isUserAgentClientHintsSupported()) {
    const requestHeaders =
      networkLogger.edgeEndpointLogs.requests[0].request.headers;
    const parsedBody = JSON.parse(
      networkLogger.edgeEndpointLogs.requests[0].request.body
    );

    await t.expect(requestHeaders["sec-ch-ua"]).ok();
    await t.expect(requestHeaders["sec-ch-ua-mobile"]).ok();
    await t.expect(requestHeaders["sec-ch-ua-platform"]).ok();
    await t
      .expect(
        parsedBody.events[0].xdm.environment.browserDetails.userAgentClientHints
      )
      .ok();
    await t
      .expect(
        parsedBody.events[0].xdm.environment.browserDetails.userAgentClientHints
          .bitness
      )
      .ok();
    await t
      .expect(
        parsedBody.events[0].xdm.environment.browserDetails.userAgentClientHints
          .architecture
      )
      .ok();
    await t
      .expect(
        parsedBody.events[0].xdm.environment.browserDetails.userAgentClientHints
          .platformVersion
      )
      .ok();

    const bitness =
      parsedBody.events[0].xdm.environment.browserDetails.userAgentClientHints
        .bitness;
    if (bitness.indexOf("64") > -1) {
      await t.expect(eventResult.propositions.length).gt(0);
      const expectedProposition = eventResult.propositions.find(
        proposition => proposition.scope === "64BitClientHint"
      );
      await t.expect(expectedProposition).ok();
    }
  }
});
