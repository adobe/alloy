import { t, Selector } from "testcafe";
import createFixture from "../../helpers/createFixture";
import addHtmlToBody from "../../helpers/dom/addHtmlToBody";
import {
  compose,
  orgMainConfigMain,
  clickCollectionEnabled,
  clickCollectionDisabled
} from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import preventLinkNavigation from "../../helpers/preventLinkNavigation";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url";
import createNetworkLogger from "../../helpers/networkLogger";

const networkLogger = createNetworkLogger();

createFixture({
  title:
    "C81182: Test onBeforeLinkClickSend callback when personalization metric involved",
  url: `${TEST_PAGE_URL}?test=C81182`,
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C81182",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const addLinkToBody = () => {
  return addHtmlToBody(
    `<a href="canceled.html"><span id="canceled-alloy-link-test">Link Click that is canceled</span></a>`
  );
};

const clickLink = async selector => {
  await t.click(Selector(selector));
};

const expectedExprienceDecisioning = {
  propositions: [
    {
      id: "AT:eyJhY3Rpdml0eUlkIjoiMTQ1NDQ4IiwiZXhwZXJpZW5jZUlkIjoiIn0=",
      scope: "__view__",
      scopeDetails: {
        decisionProvider: "TGT",
        activity: {
          id: "145448"
        },
        characteristics: {
          eventToken: "VwlBQpRYFcQXcG9jkRhiRA=="
        }
      }
    }
  ]
};

const assertRequestXdm = async (
  request,
  expectedWebInteraction,
  expectedData
) => {
  const requestBody = JSON.parse(request.request.body);
  const eventXdm = requestBody.events[0].xdm;
  const eventData = requestBody.events[0].data;
  await t.expect(eventXdm.eventType).eql("decisioning.propositionInteract");
  await t.expect(eventXdm.web.webInteraction).eql(expectedWebInteraction);
  await t.expect(eventData).eql(expectedData);
  await t
    // eslint-disable-next-line no-underscore-dangle
    .expect(eventXdm._experience.decisioning)
    .eql(expectedExprienceDecisioning);
};

test("Test C81182: Verify that onBeforeLinkClickSend removes the link-click details when personalization metric on link", async () => {
  await preventLinkNavigation();
  const alloy = createAlloyProxy();

  const testConfig = compose(orgMainConfigMain, clickCollectionEnabled, {
    onBeforeLinkClickSend: options => {
      const { data } = options;

      data.customField = "test";

      return false;
    }
  });
  await alloy.configure(testConfig);
  await alloy.sendEvent({ renderDecisions: true });

  await clickLink("#alloy-link-test");
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(3);
  const linkClickRequest = networkLogger.edgeEndpointLogs.requests[2];
  await assertRequestXdm(linkClickRequest, undefined, undefined);
});

test("Test C81182: Verify that onBeforeLinkClickSend augments request when personalization metric on link", async () => {
  await preventLinkNavigation();
  const alloy = createAlloyProxy();

  const testConfig = compose(orgMainConfigMain, clickCollectionEnabled, {
    onBeforeLinkClickSend: options => {
      const { xdm, data, clickedElement } = options;

      if (clickedElement.id === "alloy-link-test") {
        xdm.web.webInteraction.name = "augmented link name";
        xdm.web.webInteraction.region = "BODY";
        data.customField = "test123";
        return true;
      }

      return false;
    }
  });
  await alloy.configure(testConfig);
  await addLinkToBody();
  await alloy.sendEvent({ renderDecisions: true });

  await clickLink("#alloy-link-test");
  await clickLink("#canceled-alloy-link-test");

  const expectedXdmWebInteraction = {
    name: "augmented link name",
    region: "BODY",
    type: "other",
    URL: "https://alloyio.com/functional-test/valid.html",
    linkClicks: { value: 1 }
  };
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(3);
  const linkClickRequest = networkLogger.edgeEndpointLogs.requests[2];
  await assertRequestXdm(linkClickRequest, expectedXdmWebInteraction, {
    customField: "test123"
  });
});

test("Test C81182: Verify that personalization metric is sent when clickCollection is disabled", async () => {
  await preventLinkNavigation();
  const alloy = createAlloyProxy();

  const testConfig = compose(orgMainConfigMain, clickCollectionDisabled);
  await alloy.configure(testConfig);
  await addLinkToBody();
  await alloy.sendEvent({ renderDecisions: true });

  await clickLink("#alloy-link-test");
  await clickLink("#canceled-alloy-link-test");

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(3);
  const linkClickRequest = networkLogger.edgeEndpointLogs.requests[2];
  await assertRequestXdm(linkClickRequest, undefined, undefined);
});
