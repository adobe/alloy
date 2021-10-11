import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import createFixture from "../../helpers/createFixture";
import webContextConfig from "../../helpers/constants/webContextConfig";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url";
import createAlloyProxy from "../../helpers/createAlloyProxy";

const networkLogger = createNetworkLogger();

createFixture({
  title:
    "C2598 - Adds only web context data when only web is specified in configuration.",
  requestHooks: [networkLogger.edgeEndpointLogs],
  url: TEST_PAGE_URL
});

test.meta({
  ID: "C2598",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C2598 - Adds only web context data when only web is specified in configuration.", async () => {
  // navigate to set the document.referrer
  await t.eval(() => {
    window.document.location = `${window.document.location}`;
  });

  const alloy = createAlloyProxy();
  await alloy.configure(webContextConfig);
  await alloy.sendEvent();

  console.log("requests status", networkLogger.edgeEndpointLogs.requests);

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const parsedBody = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body
  );

  await t.expect(parsedBody.events[0].xdm.web).ok();
  await t.expect(parsedBody.events[0].xdm.web.webPageDetails).ok();
  await t
    .expect(parsedBody.events[0].xdm.web.webPageDetails.URL)
    .eql(TEST_PAGE_URL);
  await t.expect(parsedBody.events[0].xdm.web.webReferrer).ok();
  await t
    .expect(parsedBody.events[0].xdm.web.webReferrer.URL)
    .eql(TEST_PAGE_URL);

  await t.expect(parsedBody.events[0].xdm.device).notOk();
  await t.expect(parsedBody.events[0].xdm.placeContext).notOk();
  await t.expect(parsedBody.events[0].xdm.environment).notOk();
});
