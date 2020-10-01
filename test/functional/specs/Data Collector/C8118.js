import { t, Selector, ClientFunction } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import addAnchorToBody from "../../helpers/dom/addAnchorToBody";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";
import { orgMainConfigMain } from "../../helpers/constants/configParts";

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
  await configureAlloyInstance("alloy", orgMainConfigMain);
  await addAnchorToBody({
    text: "Test Link",
    attributes: {
      href: "blank.html",
      id: "alloy-link-test"
    }
  });
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
  await t.expect(request.response).notOk("sendBeacon wasn't used");
});
