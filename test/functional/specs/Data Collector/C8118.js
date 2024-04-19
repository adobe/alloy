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
  title: "C8118: Collects and sends information about link clicks."
});

test.meta({
  ID: "C8118",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const INTERNAL_LINK_ANCHOR_1 = `<a href="blank.html"><span id="alloy-link-test">Test Link</span></a>`;
const INTERNAL_LINK_ANCHOR_2 = `<a href="blank.html" id="alloy-link-test">Internal Link</a>`;
const DOWNLOAD_LINK_ANCHOR = `<a href="example.zip" id="alloy-link-test" download>Download Zip File</a>`;
const EXTERNAL_LINK_ANCHOR = `<a href="https://example.com" id="alloy-link-test">External Link</a>`;

const addLinkToBody = link => {
  return addHtmlToBody(`${link}`);
};

const clickLink = async () => {
  await t.click(Selector("#alloy-link-test"));
};

const getEventTypeFromRequest = req => {
  const bodyJson = JSON.parse(req.request.body);
  return bodyJson.events[0].xdm.eventType;
};

const getWebInteractionFromRequest = req => {
  const bodyJson = JSON.parse(req.request.body);
  return bodyJson.events[0].xdm.web.webInteraction;
};

const getXdmFromRequest = req => {
  const bodyJson = JSON.parse(req.request.body);
  return bodyJson.events[0].xdm;
};

/* eslint no-underscore-dangle: 0 */
const getActivityMapDataFromRequest = req => {
  const bodyJson = JSON.parse(req.request.body);
  return bodyJson.events[0].data.__adobe.analytics.c.a.activitymap;
};

const assertRequestXdm = async req => {
  const eventType = getEventTypeFromRequest(req);
  await t.expect(eventType).eql("web.webinteraction.linkClicks");
  const webInteraction = getWebInteractionFromRequest(req);
  await t.expect(webInteraction).eql({
    name: "Test Link",
    region: "BODY",
    type: "other",
    URL: "https://alloyio.com/functional-test/blank.html",
    linkClicks: { value: 1 }
  });
};

test("Test C8118: Verify link click sends a request to the collect endpoint when identity has been established, interact endpoint otherwise", async () => {
  const testConfig = compose(
    orgMainConfigMain,
    clickCollectionEnabled,
    clickCollectionEventGroupingDisabled // To prevent internal link click to get cached
  );
  const collectEndpointAsserter = await createCollectEndpointAsserter();
  const alloy = createAlloyProxy();
  await alloy.configure(testConfig);
  await preventLinkNavigation();
  await addLinkToBody(INTERNAL_LINK_ANCHOR_1);
  await clickLink();
  await collectEndpointAsserter.assertInteractCalledAndNotCollect();
  const interactRequest = await collectEndpointAsserter.getInteractRequest();
  await collectEndpointAsserter.reset();
  // If an identity has not been established, we hit the interact endpoint using
  // fetch even though the user may be navigating away from the page. In the
  // real world where we're not blocking navigation, Alloy may
  // or may not get a response back before navigation completes. If Alloy does not
  // receive a response back, an identity cookie will not have been established, unfortunately,
  // but that is considered better than using sendBeacon that for sure would not establish
  // an identity.
  await assertRequestXdm(interactRequest);

  // Because an identity has been established, we can safely hit the collect
  // endpoint using sendBeacon.
  await clickLink();
  await collectEndpointAsserter.assertCollectCalledAndNotInteract();
  const collectRequest = collectEndpointAsserter.getCollectRequest();
  await assertRequestXdm(collectRequest);
});

test("Test C8118: Verify that a download link click data is not sent when download link click collection is disabled", async () => {
  const testConfig = compose(orgMainConfigMain, clickCollectionEnabled, {
    clickCollection: {
      downloadLinkEnabled: false,
      eventGroupingEnabled: false
    }
  });
  const collectEndpointAsserter = await createCollectEndpointAsserter();
  const alloy = createAlloyProxy();
  await alloy.configure(testConfig);
  await preventLinkNavigation();
  await addLinkToBody(DOWNLOAD_LINK_ANCHOR);
  await clickLink();
  await collectEndpointAsserter.assertNeitherCollectNorInteractCalled();
});

test("Test C8118: Verify that a download link click data is sent when download link click collection is enabled", async () => {
  const testConfig = compose(orgMainConfigMain, clickCollectionEnabled, {
    clickCollection: {
      downloadLinkEnabled: true,
      eventGroupingEnabled: false
    }
  });
  const collectEndpointAsserter = await createCollectEndpointAsserter();
  const alloy = createAlloyProxy();
  await alloy.configure(testConfig);
  await preventLinkNavigation();
  await addLinkToBody(DOWNLOAD_LINK_ANCHOR);
  await clickLink();
  await collectEndpointAsserter.assertInteractCalledAndNotCollect();
  const interactRequest = await collectEndpointAsserter.getInteractRequest();
  const webInteraction = await getWebInteractionFromRequest(interactRequest);
  await t.expect(webInteraction).eql({
    name: "Download Zip File",
    region: "BODY",
    type: "download",
    URL: "https://alloyio.com/functional-test/example.zip",
    linkClicks: { value: 1 }
  });
  const activityMapData = getActivityMapDataFromRequest(interactRequest);
  await t.expect(activityMapData).eql({
    page: "https://alloyio.com/functional-test/testPage.html",
    link: "Download Zip File",
    region: "BODY",
    pageIDType: 0
  });
});

test("Test C8118: Verify that a internal link click data is not sent when internal link click collection is disabled", async () => {
  const testConfig = compose(orgMainConfigMain, clickCollectionEnabled, {
    clickCollection: {
      internalLinkEnabled: false,
      eventGroupingEnabled: false
    }
  });
  const collectEndpointAsserter = await createCollectEndpointAsserter();
  const alloy = createAlloyProxy();
  await alloy.configure(testConfig);
  await preventLinkNavigation();
  await addLinkToBody(INTERNAL_LINK_ANCHOR_1);
  await clickLink();
  await collectEndpointAsserter.assertNeitherCollectNorInteractCalled();
});

test("Test C8118: Verify that a internal link click data is sent when internal link click collection is enabled", async () => {
  const testConfig = compose(orgMainConfigMain, clickCollectionEnabled, {
    clickCollection: {
      internalLinkEnabled: true,
      eventGroupingEnabled: false
    }
  });
  const collectEndpointAsserter = await createCollectEndpointAsserter();
  const alloy = createAlloyProxy();
  await alloy.configure(testConfig);
  await preventLinkNavigation();
  await addLinkToBody(INTERNAL_LINK_ANCHOR_2);
  await clickLink();
  await collectEndpointAsserter.assertInteractCalledAndNotCollect();
  const interactRequest = await collectEndpointAsserter.getInteractRequest();
  const webInteraction = await getWebInteractionFromRequest(interactRequest);
  await t.expect(webInteraction).eql({
    name: "Internal Link",
    region: "BODY",
    type: "other",
    URL: "https://alloyio.com/functional-test/blank.html",
    linkClicks: { value: 1 }
  });
  const activityMapData = getActivityMapDataFromRequest(interactRequest);
  await t.expect(activityMapData).eql({
    page: "https://alloyio.com/functional-test/testPage.html",
    link: "Internal Link",
    region: "BODY",
    pageIDType: 0
  });
});

test("Test C8118: Verify that a external link click data is not sent when external link click collection is disabled", async () => {
  const testConfig = compose(orgMainConfigMain, clickCollectionEnabled, {
    clickCollection: {
      externalLinkEnabled: false,
      eventGroupingEnabled: false
    }
  });
  const collectEndpointAsserter = await createCollectEndpointAsserter();
  const alloy = createAlloyProxy();
  await alloy.configure(testConfig);
  await preventLinkNavigation();
  await addLinkToBody(EXTERNAL_LINK_ANCHOR);
  await clickLink();
  await collectEndpointAsserter.assertNeitherCollectNorInteractCalled();
});

test("Test C8118: Verify that a external link click data is sent when external link click collection is enabled", async () => {
  const testConfig = compose(orgMainConfigMain, clickCollectionEnabled, {
    clickCollection: {
      externalLinkEnabled: true,
      eventGroupingEnabled: false
    }
  });
  const collectEndpointAsserter = await createCollectEndpointAsserter();
  const alloy = createAlloyProxy();
  await alloy.configure(testConfig);
  await preventLinkNavigation();
  await addLinkToBody(EXTERNAL_LINK_ANCHOR);
  await clickLink();
  await collectEndpointAsserter.assertInteractCalledAndNotCollect();
  const interactRequest = await collectEndpointAsserter.getInteractRequest();
  const webInteraction = await getWebInteractionFromRequest(interactRequest);
  await t.expect(webInteraction).eql({
    name: "External Link",
    region: "BODY",
    type: "exit",
    URL: "https://example.com",
    linkClicks: { value: 1 }
  });
  const activityMapData = getActivityMapDataFromRequest(interactRequest);
  await t.expect(activityMapData).eql({
    page: "https://alloyio.com/functional-test/testPage.html",
    link: "External Link",
    region: "BODY",
    pageIDType: 0
  });
});

test("Test C8118: Verify that a internal link click data is not sent when event grouping is enabled", async () => {
  const testConfig = compose(orgMainConfigMain, clickCollectionEnabled, {
    clickCollection: {
      internalLinkEnabled: true,
      eventGroupingEnabled: true
    }
  });
  const collectEndpointAsserter = await createCollectEndpointAsserter();
  const alloy = createAlloyProxy();
  await alloy.configure(testConfig);
  await preventLinkNavigation();
  await addLinkToBody(INTERNAL_LINK_ANCHOR_1);
  await clickLink();
  await collectEndpointAsserter.assertNeitherCollectNorInteractCalled();
});

test("Test C8118: Verify cached internal link click data is sent on the next page view event", async () => {
  const testConfig = compose(orgMainConfigMain, clickCollectionEnabled, {
    clickCollection: {
      internalLinkEnabled: true,
      eventGroupingEnabled: true
    }
  });
  const collectEndpointAsserter = await createCollectEndpointAsserter();
  const alloy = createAlloyProxy();
  await alloy.configure(testConfig);
  await preventLinkNavigation();
  await addLinkToBody(INTERNAL_LINK_ANCHOR_1);
  await clickLink();
  await collectEndpointAsserter.assertNeitherCollectNorInteractCalled();
  await collectEndpointAsserter.reset();
  await alloy.sendEvent({
    xdm: {
      web: {
        eventType: "web.webpagedetails.pageViews",
        webPageDetails: {
          name: "Test Page",
          pageViews: {
            value: 1
          }
        }
      }
    }
  });
  await collectEndpointAsserter.assertInteractCalledAndNotCollect();
  const interactRequest = await collectEndpointAsserter.getInteractRequest();
  const xdm = await getXdmFromRequest(interactRequest);
  await t.expect(xdm.web.webInteraction).eql({
    name: "Test Link",
    region: "BODY",
    type: "other",
    URL: "https://alloyio.com/functional-test/blank.html",
    linkClicks: { value: 1 }
  });
  await t.expect(xdm.web.webPageDetails).eql({
    URL: "https://alloyio.com/functional-test/testPage.html",
    name: "Test Page",
    pageViews: { value: 1 }
  });
  const activityMapData = getActivityMapDataFromRequest(interactRequest);
  await t.expect(activityMapData).eql({
    page: "https://alloyio.com/functional-test/testPage.html",
    link: "Test Link",
    region: "BODY",
    pageIDType: 0
  });
});
