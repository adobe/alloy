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
import { t, ClientFunction } from "testcafe";
import createFixture from "../../helpers/createFixture";
import addHtmlToBody from "../../helpers/dom/addHtmlToBody";
import {
  compose,
  orgMainConfigMain,
  clickCollectionEnabled,
  clickCollectionDisabled
} from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";

const alloyMonitorScript = `
window.__alloyMonitors = window.__alloyMonitors || [];
window.__alloyMonitors.push({ 
    onInstanceConfigured: function(data) {   
        window.___getLinkDetails = data.getLinkDetails;
       }
    });`;

createFixture({
  title: "C81181: getLinkDetails monitoring hook function",
  monitoringHooksScript: alloyMonitorScript
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

const getLinkDetails = ClientFunction(selector => {
  const linkElement = document.getElementById(selector);
  // eslint-disable-next-line no-underscore-dangle
  const result = window.___getLinkDetails(linkElement);
  console.log(result);
  if (!result) {
    return result;
  }
  return {
    pageName: result.pageName,
    linkName: result.linkName,
    linkRegion: result.linkRegion,
    linkType: result.linkType,
    linkUrl: result.linkUrl,
    elementId: result.clickedElement ? result.clickedElement.id : undefined
  };
});

test("Test C81183: Verify that it returns the object augmented by onBeforeLinkClickSend", async () => {
  const alloy = createAlloyProxy();

  const testConfig = compose(orgMainConfigMain, clickCollectionEnabled, {
    onBeforeLinkClickSend: options => {
      const { xdm, data, clickedElement } = options;
      if (clickedElement.id === "cancel-alloy-link-test") {
        return false;
      }
      xdm.web.webInteraction.name = "augmented name";
      data.customField = "test123";

      return true;
    }
  });
  const expectedLinkDetails = {
    elementId: "alloy-link-test",
    linkName: "Test Link",
    linkRegion: "BODY",
    linkType: "other",
    linkUrl: "https://alloyio.com/functional-test/valid.html",
    pageName: "https://alloyio.com/functional-test/testPage.html"
  };
  await alloy.configure(testConfig);
  await addLinksToBody();
  const result = await getLinkDetails("alloy-link-test");
  await t.expect(result).eql(expectedLinkDetails);
});

test("Test C81183: Verify that it returns undefined if onBeforeLinkClickSend returns false", async () => {
  const alloy = createAlloyProxy();

  const testConfig = compose(orgMainConfigMain, clickCollectionEnabled, {
    onBeforeLinkClickSend: options => {
      const { xdm, data, clickedElement } = options;
      if (clickedElement.id === "cancel-alloy-link-test") {
        return false;
      }
      xdm.web.webInteraction.name = "augmented name";
      data.customField = "test123";

      return true;
    }
  });

  await alloy.configure(testConfig);
  await addLinksToBody();
  const linkDetails = await getLinkDetails("cancel-alloy-link-test");
  await t.wait(10000);
  await t.expect(linkDetails).eql({
    elementId: undefined,
    linkName: undefined,
    linkRegion: undefined,
    linkType: undefined,
    linkUrl: undefined,
    pageName: undefined
  });
});

test("Test C81183: Verify that it returns linkDetails irrespective on clickCollectionEnabled", async () => {
  const alloy = createAlloyProxy();

  const testConfig = compose(orgMainConfigMain, clickCollectionDisabled);

  await alloy.configure(testConfig);
  await addLinksToBody();
  const expectedLinkDetails = {
    elementId: "alloy-link-test",
    linkName: "Test Link",
    linkRegion: "BODY",
    linkType: "other",
    linkUrl: "https://alloyio.com/functional-test/valid.html",
    pageName: "https://alloyio.com/functional-test/testPage.html"
  };

  await t.expect(getLinkDetails("cancel-alloy-link-test")).eql({
    elementId: undefined,
    linkName: undefined,
    linkRegion: undefined,
    linkType: undefined,
    linkUrl: undefined,
    pageName: undefined
  });
  await t.expect(getLinkDetails("alloy-link-test")).eql(expectedLinkDetails);
});
