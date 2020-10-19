import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import createFixture from "../../helpers/createFixture";
import webContextConfig from "../../helpers/constants/webContextConfig";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";
import testServerUrl from "../../helpers/constants/testServerUrl";

const networkLogger = createNetworkLogger();

createFixture({
  title:
    "C2598 - Adds only web context data when only web is specified in configuration.",
  requestHooks: [networkLogger.edgeEndpointLogs],
  url: testServerUrl
});

test.meta({
  ID: "C2598",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const triggerAlloyEvent = ClientFunction(() => {
  return window.alloy("sendEvent", {
    xdm: {}
  });
});

test("Test C2598 - Adds only web context data when only web is specified in configuration.", async () => {
  // navigate to set the document.referrer
  await t.eval(() => {
    window.document.location = `${window.document.location}`;
  });

  await configureAlloyInstance("alloy", webContextConfig);
  await triggerAlloyEvent();

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const request = networkLogger.edgeEndpointLogs.requests[0].request.body;
  const stringifyRequest = JSON.parse(request);

  await t.expect(stringifyRequest.events[0].xdm.web).ok();
  await t.expect(stringifyRequest.events[0].xdm.web.webPageDetails).ok();
  await t
    .expect(stringifyRequest.events[0].xdm.web.webPageDetails.URL)
    .eql(testServerUrl);
  await t.expect(stringifyRequest.events[0].xdm.web.webReferrer).ok();
  await t
    .expect(stringifyRequest.events[0].xdm.web.webReferrer.URL)
    .eql(testServerUrl);

  await t.expect(stringifyRequest.events[0].xdm.device).notOk();
  await t.expect(stringifyRequest.events[0].xdm.placeContext).notOk();
  await t.expect(stringifyRequest.events[0].xdm.environment).notOk();
});
