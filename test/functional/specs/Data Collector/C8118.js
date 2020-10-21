import { t, Selector, ClientFunction } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import addHtmlToBody from "../../helpers/dom/addHtmlToBody";
import sendBeaconMock from "../../helpers/sendBeaconMock";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";
import { orgMainConfigMain } from "../../helpers/constants/configParts";
import isSendBeaconSupported from "../../helpers/isSendBeaconSupported";

const networkLogger = createNetworkLogger();

createFixture({
  title: "C8118: Send event with information about link clicks.",
  requestHooks: [networkLogger.edgeCollectEndpointLogs]
});

test.meta({
  ID: "C8118",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const getLocation = ClientFunction(() => document.location.href.toString());

test("Test C8118: Load page with link. Click link. Verify event.", async () => {
  if (isSendBeaconSupported()) {
    await sendBeaconMock.mock();
  }
  await configureAlloyInstance("alloy", orgMainConfigMain);
  await addHtmlToBody(
    `<a href="blank.html"><span id="alloy-link-test">Test Link</span></a>`
  );

  await t.click(Selector("#alloy-link-test"));
  await t.expect(getLocation()).contains("blank.html");
  const request = networkLogger.edgeCollectEndpointLogs.requests[0];
  const requestBody = JSON.parse(request.request.body);
  const eventXdm = requestBody.events[0].xdm;
  await t.expect(eventXdm.eventType).eql("web.webinteraction.linkClicks");
  await t.expect(eventXdm.web.webInteraction).eql({
    name: "Link Click",
    type: "other",
    URL: "https://alloyio.com/functional-test/blank.html",
    linkClicks: { value: 1 }
  });
  if (isSendBeaconSupported()) {
    await t.expect(sendBeaconMock.getCallCount()).eql(1);
  }
});
