import { t, Selector, ClientFunction } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import addHtmlToBody from "../../helpers/dom/addHtmlToBody";
import sendBeaconMock from "../../helpers/sendBeaconMock";
import { orgMainConfigMain } from "../../helpers/constants/configParts";
import isSendBeaconSupported from "../../helpers/isSendBeaconSupported";
import testPageUrl from "../../helpers/constants/testPageUrl";
import createAlloyProxy from "../../helpers/createAlloyProxy";

const networkLogger = createNetworkLogger();

createFixture({
  title: "C8118: Send event with information about link clicks.",
  requestHooks: [
    networkLogger.edgeInteractEndpointLogs,
    networkLogger.edgeCollectEndpointLogs
  ]
});

test.meta({
  ID: "C8118",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const getLocation = ClientFunction(() => document.location.href.toString());

const addLinkToBody = () => {
  return addHtmlToBody(
    `<a href="blank.html"><span id="alloy-link-test">Test Link</span></a>`
  );
};

const clickLink = async () => {
  await t.click(Selector("#alloy-link-test"));
  await t.expect(getLocation()).contains("blank.html");
};

const assertRequest = async request => {
  const requestBody = JSON.parse(request.request.body);
  const eventXdm = requestBody.events[0].xdm;
  await t.expect(eventXdm.eventType).eql("web.webinteraction.linkClicks");
  await t.expect(eventXdm.web.webInteraction).eql({
    name: "Link Click",
    type: "other",
    URL: "https://alloyio.com/functional-test/blank.html",
    linkClicks: { value: 1 }
  });
};

test("Test C8118: Verify link click sends a request to the collect endpoint when identity has been established, interact endpoint otherwise", async () => {
  if (isSendBeaconSupported()) {
    await sendBeaconMock.mock();
  }
  const alloy = createAlloyProxy();
  await alloy.configure(orgMainConfigMain);
  await addLinkToBody();

  // If an identity has not been established, we hit the interact endpoint using
  // fetch even though the user may be navigating away from the page. We may
  // or may not get a response back before navigation completes. If we don't,
  // an identity will not have been established, unfortunately.
  await clickLink();

  // We cannot assert the interact endpoint has been called because Alloy uses
  // the fetch API in this case and there is no guarantee that the browser will
  // finish sending the request before navigating the user.

  // await t.expect(networkLogger.edgeCollectEndpointLogs.requests.length).eql(0);
  // await assertRequest(networkLogger.edgeInteractEndpointLogs.requests[0]);
  // if (isSendBeaconSupported()) {
  //   await t.expect(sendBeaconMock.getCallCount()).eql(0);
  // }

  // The link click took us to a new page. Let's go back to our test page.
  await t.navigateTo(testPageUrl);
  await networkLogger.clearLogs();

  if (isSendBeaconSupported()) {
    await sendBeaconMock.mock();
  }

  await alloy.configure(orgMainConfigMain);
  // Ensure an identity is established by sending an event in the regular manner.
  await alloy.sendEvent();
  await t.expect(networkLogger.edgeInteractEndpointLogs.requests.length).eql(1);
  await t.expect(networkLogger.edgeCollectEndpointLogs.requests.length).eql(0);
  if (isSendBeaconSupported()) {
    await t.expect(sendBeaconMock.getCallCount()).eql(0);
  }

  await networkLogger.clearLogs();

  // Because an identity has been established, we can safely hit the collect
  // endpoint using sendBeacon.
  await addLinkToBody();
  await clickLink();
  await t.expect(networkLogger.edgeInteractEndpointLogs.requests.length).eql(0);
  await t.expect(networkLogger.edgeCollectEndpointLogs.requests.length).eql(1);
  await assertRequest(networkLogger.edgeCollectEndpointLogs.requests[0]);
  if (isSendBeaconSupported()) {
    await t.expect(sendBeaconMock.getCallCount()).eql(1);
  }
});
