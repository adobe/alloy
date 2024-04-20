/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { t, Selector } from "testcafe";
import createFixture from "../../helpers/createFixture";
import addHtmlToBody from "../../helpers/dom/addHtmlToBody";
import {
  compose,
  orgMainConfigMain,
  clickCollectionEnabled,
  clickCollectionEventGroupingDisabled
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

test("Test C81181: Verify that filterClickedElementProperties can cancel a request", async () => {
  const collectEndpointAsserter = await createCollectEndpointAsserter();
  await preventLinkNavigation();
  const alloy = createAlloyProxy();
  const testConfig = compose(orgMainConfigMain, clickCollectionEnabled, {
    clickCollection: {
      filterClickedElementProperties: () => {
        return false;
      }
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
  const testConfig = compose(
    orgMainConfigMain,
    clickCollectionEnabled,
    clickCollectionEventGroupingDisabled
  );
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

  const testConfig = compose(
    orgMainConfigMain,
    clickCollectionEnabled,
    clickCollectionEventGroupingDisabled,
    {
      onBeforeLinkClickSend: options => {
        const { clickedElement } = options;
        return clickedElement.id !== "canceled-alloy-link-test";
      }
    }
  );
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

test("Test C81181: Verify that filterClickedElementProperties can cancels a request based on link details", async () => {
  const collectEndpointAsserter = await createCollectEndpointAsserter();
  await preventLinkNavigation();
  const alloy = createAlloyProxy();

  const testConfig = compose(orgMainConfigMain, clickCollectionEnabled, {
    clickCollection: {
      eventGroupingEnabled: false,
      filterClickedElementProperties: props => {
        return props.clickedElement.id !== "canceled-alloy-link-test";
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

  const testConfig = compose(
    orgMainConfigMain,
    clickCollectionEnabled,
    clickCollectionEventGroupingDisabled,
    {
      // eslint-disable-next-line consistent-return
      onBeforeLinkClickSend: options => {
        const { xdm, data, clickedElement } = options;

        if (clickedElement.id === "alloy-link-test") {
          xdm.web.webInteraction.name = "Augmented name";
          data.customField = "test123";

          return true;
        }
        return false;
      }
    }
  );

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

  const expectedData = {
    __adobe: {
      analytics: {
        c: {
          a: {
            activitymap: {
              link: "Test Link",
              page: "https://alloyio.com/functional-test/testPage.html",
              pageIDType: 0,
              region: "BODY"
            }
          }
        }
      }
    },
    customField: "test123"
  };

  await assertRequestXdm(
    interactRequest,
    expectedXdmWebInteraction,
    expectedData
  );
});

test("Test C81181: Verify that filterClickedElementProperties can augment a request", async () => {
  const collectEndpointAsserter = await createCollectEndpointAsserter();
  await preventLinkNavigation();
  const alloy = createAlloyProxy();

  const testConfig = compose(orgMainConfigMain, clickCollectionEnabled, {
    clickCollection: {
      eventGroupingEnabled: false,
      filterClickedElementProperties: props => {
        if (props.clickedElement.id === "alloy-link-test") {
          props.linkName = "Augmented name";
          return true;
        }
        return false;
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

  const expectedData = {
    __adobe: {
      analytics: {
        c: {
          a: {
            activitymap: {
              link: "Augmented name",
              page: "https://alloyio.com/functional-test/testPage.html",
              pageIDType: 0,
              region: "BODY"
            }
          }
        }
      }
    }
  };

  await assertRequestXdm(
    interactRequest,
    expectedXdmWebInteraction,
    expectedData
  );
});
