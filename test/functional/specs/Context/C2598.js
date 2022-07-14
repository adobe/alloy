import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import createFixture from "../../helpers/createFixture";
import webContextConfig from "../../helpers/constants/webContextConfig";
import webContextAltConfig from "../../helpers/constants/webContextAltConfig";
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
  const expectedReferrer = TEST_PAGE_URL;
  const expectedURL = `${TEST_PAGE_URL}?test=C2598`;
  // navigate to set the document.referrer
  await t.eval(
    () => {
      window.document.location = expectedURL;
    },
    { dependencies: { expectedURL } }
  );

  const alloy = createAlloyProxy();
  await alloy.configure(webContextConfig);
  await alloy.sendEvent();

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const parsedBody = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body
  );

  await t.expect(parsedBody.events[0].xdm.web).ok();
  await t.expect(parsedBody.events[0].xdm.web.webPageDetails).ok();
  await t
    .expect(parsedBody.events[0].xdm.web.webPageDetails.URL)
    .eql(expectedURL);
  await t.expect(parsedBody.events[0].xdm.web.webReferrer).ok();
  await t
    .expect(parsedBody.events[0].xdm.web.webReferrer.URL)
    .eql(expectedReferrer);

  await t.expect(parsedBody.events[0].xdm.device).notOk();
  await t.expect(parsedBody.events[0].xdm.placeContext).notOk();
  await t.expect(parsedBody.events[0].xdm.environment).notOk();

  // make sure the second event doesn't have a referrer
  await alloy.sendEvent();
  const parsedBody2 = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[1].request.body
  );
  await t.expect(parsedBody2.events[0].xdm.web).ok();
  await t.expect(parsedBody2.events[0].xdm.web.webReferrer).notOk();

  // make sure another request on a different instance does have the referrer
  const alloy2 = createAlloyProxy("instance2");
  await alloy2.configure(webContextAltConfig);
  await alloy2.sendEvent();
  const parsedBody3 = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[2].request.body
  );
  await t.expect(parsedBody3.events[0].xdm.web).ok();
  await t.expect(parsedBody3.events[0].xdm.web.webReferrer).ok();
  await t
    .expect(parsedBody3.events[0].xdm.web.webReferrer.URL)
    .eql(expectedReferrer);
});
