import { t, Selector } from "testcafe";
import createFixture from "../../helpers/createFixture";
import addHtmlToBody from "../../helpers/dom/addHtmlToBody";
import {
  compose,
  orgMainConfigMain,
  clickCollectionEnabled
} from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import preventLinkNavigation from "../../helpers/preventLinkNavigation";
import createCollectEndpointAsserter from "../../helpers/createCollectEndpointAsserter";

createFixture({
  title: "C81181: Test onBeforeLinkClickSend callback"
});

test.meta({
  ID: "C81181",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const addLinksToBody = () => {
  return addHtmlToBody(
    `<a href="valid.html"><span id="alloy-link-test">Test Link</span></a>
    <a href="canceled.html"><span id="canceled-alloy-link-test">Link Click that is canceled</span></a>`
  );
};

const clickLink = async selector => {
  await t.click(Selector(selector));
};

const assertRequestXdm = async (
  request,
  expectedXdmWebInteraction,
  expectedData
) => {
  const requestBody = JSON.parse(request.request.body);
  const eventXdm = requestBody.events[0].xdm;
  const eventData = requestBody.events[0].data;
  await t.expect(eventXdm.eventType).eql("web.webinteraction.linkClicks");
  await t.expect(eventXdm.web.webInteraction).eql(expectedXdmWebInteraction);
  if (expectedData) {
    await t.expect(eventData).eql(expectedData);
  }
};

test("Test C81181: Verify that onBeforeLinkClickSend cancels a request", async () => {
  const collectEndpointAsserter = await createCollectEndpointAsserter();
  await preventLinkNavigation();
  const alloy = createAlloyProxy();

  const testConfig = compose(orgMainConfigMain, clickCollectionEnabled, {
    onBeforeLinkClickSend: () => {
      return false;
    }
  });
  await alloy.configure(testConfig);
  await addLinksToBody();
  await clickLink("#alloy-link-test");
  await collectEndpointAsserter.assertNeitherCollectNorInteractCalled();
});

test("Test C81181: Verify that if onBeforeLinkClickSend not defined and clickCollectionEnabled link clicks are collected", async () => {
  const collectEndpointAsserter = await createCollectEndpointAsserter();
  await preventLinkNavigation();
  const alloy = createAlloyProxy();

  const testConfig = compose(orgMainConfigMain, clickCollectionEnabled);
  await alloy.configure(testConfig);
  await addLinksToBody();
  await clickLink("#alloy-link-test");
  await collectEndpointAsserter.assertInteractCalledAndNotCollect();
  const interactRequest = collectEndpointAsserter.getInteractRequest();
  const expectedXdm = {
    name: "Test Link",
    region: "BODY",
    type: "other",
    URL: "https://alloyio.com/functional-test/valid.html",
    linkClicks: { value: 1 }
  };
  await assertRequestXdm(interactRequest, expectedXdm);
});

test("Test C81181: Verify that onBeforeLinkClickSend cancels a request based on link details", async () => {
  const collectEndpointAsserter = await createCollectEndpointAsserter();
  await preventLinkNavigation();
  const alloy = createAlloyProxy();

  const testConfig = compose(orgMainConfigMain, clickCollectionEnabled, {
    onBeforeLinkClickSend: options => {
      const { clickedElement } = options;

      return clickedElement.id !== "canceled-alloy-link-test";
    }
  });
  await alloy.configure(testConfig);
  await addLinksToBody();
  await clickLink("#canceled-alloy-link-test");
  await collectEndpointAsserter.assertNeitherCollectNorInteractCalled();
  await clickLink("#alloy-link-test");
  await collectEndpointAsserter.assertInteractCalledAndNotCollect();
  const interactRequest = collectEndpointAsserter.getInteractRequest();
  const expectedXdm = {
    name: "Test Link",
    region: "BODY",
    type: "other",
    URL: "https://alloyio.com/functional-test/valid.html",
    linkClicks: { value: 1 }
  };
  await assertRequestXdm(interactRequest, expectedXdm);
});

test("Test C81181: Verify that onBeforeLinkClickSend augments a request", async () => {
  const collectEndpointAsserter = await createCollectEndpointAsserter();
  await preventLinkNavigation();
  const alloy = createAlloyProxy();

  const testConfig = compose(orgMainConfigMain, clickCollectionEnabled, {
    // eslint-disable-next-line consistent-return
    onBeforeLinkClickSend: options => {
      const { xdm, data, clickedElement } = options;

      if (clickedElement.id === "alloy-link-test") {
        xdm.web.webInteraction.name = "Augmented name";
        data.customField = "test123";

        return true;
      }
    }
  });
  await alloy.configure(testConfig);
  await addLinksToBody();
  await clickLink("#canceled-alloy-link-test");
  await collectEndpointAsserter.assertNeitherCollectNorInteractCalled();
  await clickLink("#alloy-link-test");
  await collectEndpointAsserter.assertInteractCalledAndNotCollect();
  const interactRequest = collectEndpointAsserter.getInteractRequest();

  const expectedXdmWebInteraction = {
    name: "Augmented name",
    region: "BODY",
    type: "other",
    URL: "https://alloyio.com/functional-test/valid.html",
    linkClicks: { value: 1 }
  };

  await assertRequestXdm(interactRequest, expectedXdmWebInteraction, {
    customField: "test123"
  });
});
