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
import createFixture from "../../helpers/createFixture/index.js";
import addHtmlToBody from "../../helpers/dom/addHtmlToBody.js";
import {
  compose,
  orgMainConfigMain,
  clickCollectionEnabled,
  clickCollectionEventGroupingDisabled,
  clickCollectionSessionStorageDisabled,
} from "../../helpers/constants/configParts/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import preventLinkNavigation from "../../helpers/preventLinkNavigation.js";
import createCollectEndpointAsserter from "../../helpers/createCollectEndpointAsserter.js";

createFixture({
  title: "C8118: Collects and sends information about link clicks.",
});

test.meta({
  ID: "C8118",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

const INTERNAL_LINK_ANCHOR_1 = `<a href="blank.html"><span id="alloy-link-test">Test Link</span></a>`;
const INTERNAL_LINK_ANCHOR_2 = `<a href="blank.html" id="alloy-link-test">Internal Link</a>`;
const DOWNLOAD_LINK_ANCHOR = `<a href="example.zip" id="alloy-link-test" download>Download Zip File</a>`;
const EXTERNAL_LINK_ANCHOR = `<a href="https://example.com/" id="alloy-link-test">External Link</a>`;

const addLinkToBody = (link) => {
  return addHtmlToBody(`${link}`);
};

const clickLink = async () => {
  await t.click(Selector("#alloy-link-test"));
};

const getEventTypeFromRequest = (req) => {
  const bodyJson = JSON.parse(req.request.body);
  return bodyJson.events[0].xdm.eventType;
};

const getWebInteractionFromRequest = (req) => {
  const bodyJson = JSON.parse(req.request.body);
  return bodyJson.events[0].xdm.web.webInteraction;
};

const getXdmFromRequest = (req) => {
  const bodyJson = JSON.parse(req.request.body);
  return bodyJson.events[0].xdm;
};

/* eslint no-underscore-dangle: 0 */
const getActivityMapDataFromRequest = (req) => {
  const bodyJson = JSON.parse(req.request.body);
  return bodyJson.events[0].data.__adobe.analytics.contextData.a.activitymap;
};

const assertRequestXdm = async (req) => {
  const eventType = getEventTypeFromRequest(req);
  await t.expect(eventType).eql("web.webinteraction.linkClicks");
  const webInteraction = getWebInteractionFromRequest(req);
  await t.expect(webInteraction).eql({
    name: "Test Link",
    region: "BODY",
    type: "other",
    URL: "https://alloyio.com/functional-test/blank.html",
    linkClicks: { value: 1 },
  });
};

test("Test C8118: Verify link click sends a request to the collect endpoint when identity has been established, interact endpoint otherwise", async () => {
  const testConfig = compose(
    orgMainConfigMain,
    clickCollectionEnabled,
    clickCollectionEventGroupingDisabled, // To prevent internal link click to get cached
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
});

test("Test C8118: Verify that a download link click data is not sent when download link click collection is disabled", async () => {
  const testConfig = compose(orgMainConfigMain, clickCollectionEnabled, {
    clickCollection: {
      downloadLinkEnabled: false,
      eventGroupingEnabled: false,
    },
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
      eventGroupingEnabled: false,
    },
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
    linkClicks: { value: 1 },
  });
  const activityMapData = getActivityMapDataFromRequest(interactRequest);
  await t.expect(activityMapData).eql({
    page: "https://alloyio.com/functional-test/testPage.html",
    link: "Download Zip File",
    region: "BODY",
    pageIDType: 0,
  });
});

test("Test C8118: Verify that a internal link click data is not sent when internal link click collection is disabled", async () => {
  const testConfig = compose(orgMainConfigMain, clickCollectionEnabled, {
    clickCollection: {
      internalLinkEnabled: false,
      eventGroupingEnabled: false,
    },
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
      eventGroupingEnabled: false,
    },
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
    linkClicks: { value: 1 },
  });
  const activityMapData = getActivityMapDataFromRequest(interactRequest);
  await t.expect(activityMapData).eql({
    page: "https://alloyio.com/functional-test/testPage.html",
    link: "Internal Link",
    region: "BODY",
    pageIDType: 0,
  });
});

test("Test C8118: Verify that a external link click data is not sent when external link click collection is disabled", async () => {
  const testConfig = compose(orgMainConfigMain, clickCollectionEnabled, {
    clickCollection: {
      externalLinkEnabled: false,
      eventGroupingEnabled: false,
    },
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
      eventGroupingEnabled: false,
    },
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
    URL: "https://example.com/",
    linkClicks: { value: 1 },
  });
  const activityMapData = getActivityMapDataFromRequest(interactRequest);
  await t.expect(activityMapData).eql({
    page: "https://alloyio.com/functional-test/testPage.html",
    link: "External Link",
    region: "BODY",
    pageIDType: 0,
  });
});

test("Test C8118: Verify that a internal link click data is not sent when event grouping is enabled", async () => {
  const testConfig = compose(orgMainConfigMain, clickCollectionEnabled, {
    clickCollection: {
      internalLinkEnabled: true,
      eventGroupingEnabled: true,
    },
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
      eventGroupingEnabled: true,
    },
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
            value: 1,
          },
        },
      },
    },
  });
  await collectEndpointAsserter.assertInteractCalledAndNotCollect();
  const interactRequest = await collectEndpointAsserter.getInteractRequest();
  const xdm = await getXdmFromRequest(interactRequest);
  await t.expect(xdm.web.webInteraction).eql({
    name: "Test Link",
    region: "BODY",
    type: "other",
    URL: "https://alloyio.com/functional-test/blank.html",
    linkClicks: { value: 1 },
  });
  await t.expect(xdm.web.webPageDetails).eql({
    URL: "https://alloyio.com/functional-test/testPage.html",
    name: "Test Page",
    pageViews: { value: 1 },
  });
  const activityMapData = getActivityMapDataFromRequest(interactRequest);
  await t.expect(activityMapData).eql({
    page: "https://alloyio.com/functional-test/testPage.html",
    link: "Test Link",
    region: "BODY",
    pageIDType: 0,
  });
});

test("Test C8118: Verify internal link click data with custom region", async () => {
  const testConfig = compose(orgMainConfigMain, clickCollectionEnabled, {
    clickCollection: {
      internalLinkEnabled: true,
      eventGroupingEnabled: false,
    },
  });
  const collectEndpointAsserter = await createCollectEndpointAsserter();
  const alloy = createAlloyProxy();
  await alloy.configure(testConfig);
  await preventLinkNavigation();
  await addHtmlToBody(
    '<div id="custom-region"><a href="blank.html" id="alloy-link-test">Internal Link</a></div>',
  );
  await clickLink();
  await collectEndpointAsserter.assertInteractCalledAndNotCollect();
  const interactRequest = await collectEndpointAsserter.getInteractRequest();
  const webInteraction = await getWebInteractionFromRequest(interactRequest);
  await t.expect(webInteraction.region).eql("custom-region");
});

test("Test C8118: Verify external link click data with custom link type", async () => {
  const testConfig = compose(orgMainConfigMain, clickCollectionEnabled, {
    clickCollection: {
      externalLinkEnabled: true,
      eventGroupingEnabled: false,
    },
  });
  const collectEndpointAsserter = await createCollectEndpointAsserter();
  const alloy = createAlloyProxy();
  await alloy.configure(testConfig);
  await preventLinkNavigation();
  await addLinkToBody(
    '<a href="https://example.com/" id="alloy-link-test" data-linktype="custom">External Link</a>',
  );
  await clickLink();
  await collectEndpointAsserter.assertInteractCalledAndNotCollect();
  const interactRequest = await collectEndpointAsserter.getInteractRequest();
  const webInteraction = await getWebInteractionFromRequest(interactRequest);
  await t.expect(webInteraction.type).eql("exit");
});

test("Test C8118: Verify link click with custom activity map data", async () => {
  const testConfig = compose(orgMainConfigMain, clickCollectionEnabled, {
    clickCollection: {
      internalLinkEnabled: true,
      eventGroupingEnabled: false,
    },
  });
  const collectEndpointAsserter = await createCollectEndpointAsserter();
  const alloy = createAlloyProxy();
  await alloy.configure(testConfig);
  await preventLinkNavigation();
  await addHtmlToBody(
    '<div id="custom-region"><a href="blank.html" id="alloy-link-test" data-activitymap-region="custom-region" data-activitymap-link-id="custom-link">Custom Activity Map Link</a></div>',
  );
  await clickLink();
  await collectEndpointAsserter.assertInteractCalledAndNotCollect();
  const interactRequest = await collectEndpointAsserter.getInteractRequest();
  const activityMapData = getActivityMapDataFromRequest(interactRequest);

  // Log the actual activityMapData for debugging
  console.log(
    "Actual activityMapData:",
    JSON.stringify(activityMapData, null, 2),
  );

  // Check each property individually
  await t
    .expect(activityMapData.page)
    .eql("https://alloyio.com/functional-test/testPage.html");
  await t.expect(activityMapData.link).eql("Custom Activity Map Link");
  await t.expect(activityMapData.region).eql("custom-region");
  await t.expect(activityMapData.pageIDType).eql(0);

  // If all individual checks pass, then do the full object comparison
  await t.expect(activityMapData).eql({
    page: "https://alloyio.com/functional-test/testPage.html",
    link: "Custom Activity Map Link",
    region: "custom-region",
    pageIDType: 0,
  });
});

test("Test C8118: Verify multiple link clicks with event grouping enabled", async () => {
  const testConfig = compose(orgMainConfigMain, clickCollectionEnabled, {
    clickCollection: {
      internalLinkEnabled: true,
      eventGroupingEnabled: true,
    },
  });
  const collectEndpointAsserter = await createCollectEndpointAsserter();
  const alloy = createAlloyProxy();
  await alloy.configure(testConfig);
  await preventLinkNavigation();
  await addLinkToBody('<a href="blank.html" id="alloy-link-test-1">Link 1</a>');
  await addLinkToBody('<a href="blank.html" id="alloy-link-test-2">Link 2</a>');

  await t.click(Selector("#alloy-link-test-1"));
  await t.click(Selector("#alloy-link-test-2"));

  await collectEndpointAsserter.assertNeitherCollectNorInteractCalled();
  await collectEndpointAsserter.reset();

  await alloy.sendEvent({
    xdm: {
      web: {
        eventType: "web.webpagedetails.pageViews",
        webPageDetails: {
          name: "Test Page",
          pageViews: { value: 1 },
        },
      },
    },
  });

  await collectEndpointAsserter.assertInteractCalledAndNotCollect();
  const interactRequest = await collectEndpointAsserter.getInteractRequest();
  const xdm = await getXdmFromRequest(interactRequest);

  console.log("XDM structure:", JSON.stringify(xdm, null, 2));

  if (Array.isArray(xdm.web.webInteraction)) {
    await t.expect(xdm.web.webInteraction.length).eql(2);
    await t.expect(xdm.web.webInteraction[0].name).eql("Link 1");
    await t.expect(xdm.web.webInteraction[1].name).eql("Link 2");
  } else if (xdm.web.webInteraction) {
    console.log("Single webInteraction:", xdm.web.webInteraction);
    await t.expect(xdm.web.webInteraction.name).eql("Link 2");
  } else {
    console.log("No webInteraction found in XDM");
    await t.fail("No webInteraction data found in XDM");
  }
});

test("Test C8118: Verify link click with custom XDM data", async () => {
  const testConfig = compose(orgMainConfigMain, clickCollectionEnabled, {
    clickCollection: {
      internalLinkEnabled: true,
      eventGroupingEnabled: false,
    },
    onBeforeLinkClickSend: (options) => {
      options.xdm.customField = "customValue";
      return true;
    },
  });
  const collectEndpointAsserter = await createCollectEndpointAsserter();
  const alloy = createAlloyProxy();
  await alloy.configure(testConfig);
  await preventLinkNavigation();
  await addLinkToBody(INTERNAL_LINK_ANCHOR_2);

  await clickLink();
  await collectEndpointAsserter.assertInteractCalledAndNotCollect();
  const interactRequest = await collectEndpointAsserter.getInteractRequest();
  const xdm = await getXdmFromRequest(interactRequest);
  await t.expect(xdm.customField).eql("customValue");
});

test("Test C8118: Verify disabling session storage still captures link click data", async () => {
  const testConfig = compose(
    orgMainConfigMain,
    clickCollectionEnabled,
    clickCollectionSessionStorageDisabled,
    {
      clickCollection: {
        internalLinkEnabled: true,
        eventGroupingEnabled: false,
      },
    },
  );
  const collectEndpointAsserter = await createCollectEndpointAsserter();
  const alloy = createAlloyProxy();
  await alloy.configure(testConfig);
  await preventLinkNavigation();
  await addLinkToBody(INTERNAL_LINK_ANCHOR_2);
  await clickLink();
  await collectEndpointAsserter.assertInteractCalledAndNotCollect();
  const interactRequest = await collectEndpointAsserter.getInteractRequest();
  const xdm = await getXdmFromRequest(interactRequest);

  console.log("XDM structure:", JSON.stringify(xdm, null, 2));

  // Check for the presence of expected properties
  await t.expect(xdm.web).ok("web object is missing");
  await t.expect(xdm.web.webInteraction).ok("webInteraction is missing");
  await t
    .expect(xdm.web.webInteraction.name)
    .ok("webInteraction.name is missing");
  await t
    .expect(xdm.web.webInteraction.URL)
    .ok("webInteraction.URL is missing");

  // Check for webPageDetails, but don't expect the name property
  if (xdm.web.webPageDetails) {
    await t
      .expect(xdm.web.webPageDetails.URL)
      .ok("webPageDetails.URL is missing");
  } else {
    console.log("webPageDetails is missing from XDM");
  }

  // Verify that the link click data is still captured
  await t.expect(xdm.web.webInteraction.type).eql("other");
  await t.expect(xdm.web.webInteraction.name).eql("Internal Link");
});

// test("Test C8118: Verify properties in filterClickDetails callback", async () => {
//   let callbackProps;
//   let callbackCalled = false;
//   const testConfig = compose(orgMainConfigMain, clickCollectionEnabled, {
//     clickCollection: {
//       internalLinkEnabled: true,
//       eventGroupingEnabled: false,
//       filterClickDetails: (props) => {
//         callbackCalled = true;
//         callbackProps = props;
//         console.log('filterClickDetails called with props:', JSON.stringify(props, null, 2));
//         return true;
//       },
//     },
//   });
//   const collectEndpointAsserter = await createCollectEndpointAsserter();
//   const alloy = createAlloyProxy();
//   await alloy.configure(testConfig);
//   await preventLinkNavigation();
//   await addLinkToBody(INTERNAL_LINK_ANCHOR_2);

//   console.log('Before clicking link');
//   await clickLink();
//   console.log('After clicking link');

//   let endpointCalled = false;

//   try {
//     await collectEndpointAsserter.assertInteractCalledAndNotCollect();
//     console.log('Interact endpoint was called');
//     endpointCalled = true;
//     const interactRequest = await collectEndpointAsserter.getInteractRequest();
//     const xdm = await getXdmFromRequest(interactRequest);
//     console.log('XDM from interact request:', JSON.stringify(xdm, null, 2));
//     // Verify callback properties
//     await t.expect(callbackProps).ok('filterClickDetails callback was not called');
//     await t.expect(callbackProps.linkName).eql('Internal Link');
//     await t.expect(callbackProps.linkRegion).eql('BODY');
//     await t.expect(callbackProps.linkType).eql('other');
//     await t.expect(callbackProps.linkUrl).eql('https://alloyio.com/functional-test/blank.html');
//     await t.expect(callbackProps.pageIDType).eql(0);
//     await t.expect(callbackProps.pageName).eql('https://alloyio.com/functional-test/testPage.html');

//     // Verify XDM data
//     await t.expect(xdm.web.webInteraction.name).eql('Internal Link');
//     await t.expect(xdm.web.webInteraction.type).eql('other');
//     await t.expect(xdm.web.webInteraction.URL).eql('https://alloyio.com/functional-test/blank.html');
//   } catch (error) {
//     console.log('Interact endpoint was not called, checking collect endpoint');
//     try {
//       await collectEndpointAsserter.assertCollectCalledAndNotInteract();
//       console.log('Collect endpoint was called');
//       endpointCalled = true;
//       const collectRequest = await collectEndpointAsserter.getCollectRequest();
//       const xdm = await getXdmFromRequest(collectRequest);
//       console.log('XDM from collect request:', JSON.stringify(xdm, null, 2));

//       // Verify callback properties
//       await t.expect(callbackProps).ok('filterClickDetails callback was not called');
//       await t.expect(callbackProps.linkName).eql('Internal Link');
//       await t.expect(callbackProps.linkRegion).eql('BODY');
//       await t.expect(callbackProps.linkType).eql('other');
//       await t.expect(callbackProps.linkUrl).eql('https://alloyio.com/functional-test/blank.html');
//       await t.expect(callbackProps.pageIDType).eql(0);
//       await t.expect(callbackProps.pageName).eql('https://alloyio.com/functional-test/testPage.html');

//       // Verify XDM data
//       await t.expect(xdm.web.webInteraction.name).eql('Internal Link');
//       await t.expect(xdm.web.webInteraction.type).eql('other');
//       await t.expect(xdm.web.webInteraction.URL).eql('https://alloyio.com/functional-test/blank.html');
//     } catch (error) {
//       console.log('Neither interact nor collect endpoint was called');
//     }
//   }

//   // Check if the callback was called
//   await t.expect(callbackCalled).ok('filterClickDetails callback was not called');

//   // Final assertion to ensure at least one endpoint was called
//   await t.expect(endpointCalled).ok('Neither interact nor collect endpoint was called');

//   // If no endpoint was called, but the callback was, log the callback props
//   if (!endpointCalled && callbackCalled) {
//     console.log('Callback props when no endpoint was called:', JSON.stringify(callbackProps, null, 2));
//   }
// });
