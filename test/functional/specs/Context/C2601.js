import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import createFixture from "../../helpers/createFixture";
import placeContextConfig from "../../helpers/constants/placeContextConfig";
import createAlloyProxy from "../../helpers/createAlloyProxy";

const networkLogger = createNetworkLogger();

createFixture({
  title:
    "C2601 - Adds only placeContext context data when only device is specified in configuration.",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C2601",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const sendEventOptions = {
  xdm: {
    web: {
      webPageDetails: {
        URL: "https://alloyio.com/functional-test/alloyTestPage.html"
      }
    }
  }
};

test("C2601 - Adds only placeContext context data when only device is specified in configuration.", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(placeContextConfig);
  await alloy.sendEvent(sendEventOptions);

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const request = networkLogger.edgeEndpointLogs.requests[0].request.body;
  const stringifyRequest = JSON.parse(request);

  await t.expect(stringifyRequest.events[0].xdm.placeContext).ok();
  await t.expect(stringifyRequest.events[0].xdm.web.webPageDetails).ok();

  await t.expect(stringifyRequest.events[0].xdm.environment).notOk();
  await t.expect(stringifyRequest.events[0].xdm.device).notOk();
});
