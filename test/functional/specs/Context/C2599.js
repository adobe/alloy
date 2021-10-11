import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import createFixture from "../../helpers/createFixture";
import deviceContextConfig from "../../helpers/constants/deviceContextConfig";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url";

const networkLogger = createNetworkLogger();

createFixture({
  title:
    "C2599 - Adds only device context data when only device is specified in configuration.",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C2599",
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

test("C2599 - Adds only device context data when only device is specified in configuration.", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(deviceContextConfig);
  await alloy.sendEvent(sendEventOptions);

  console.log("requests status", networkLogger.edgeEndpointLogs.requests);

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const parsedBody = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body
  );

  await t.expect(parsedBody.events[0].xdm.device).ok();
  await t.expect(parsedBody.events[0].xdm.web.webPageDetails).ok();

  await t.expect(parsedBody.events[0].xdm.placeContext).notOk();
  await t.expect(parsedBody.events[0].xdm.environment).notOk();
});
