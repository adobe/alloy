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
import createFixture from "../../helpers/createFixture/index.js";
import addHtmlToBody from "../../helpers/dom/addHtmlToBody.js";
import {
  compose,
  orgMainConfigMain,
  clickCollectionEnabled,
  clickCollectionDisabled
} from "../../helpers/constants/configParts/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";

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

const getClickedElement = ClientFunction(selector => {
  const linkElement = document.getElementById(selector);
  // eslint-disable-next-line no-underscore-dangle
  const result = window.___getLinkDetails(linkElement);

  if (!result) {
    return result;
  }
  return {
    xdm: result.xdm,
    data: result.data,
    elementId: result.clickedElement.id
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
    data: {
      customField: "test123"
    },
    xdm: {
      eventType: "web.webinteraction.linkClicks",
      web: {
        webInteraction: {
          URL: "https://alloyio.com/functional-test/valid.html",
          linkClicks: {
            value: 1
          },
          name: "augmented name",
          region: "BODY",
          type: "other"
        }
      }
    }
  };

  await alloy.configure(testConfig);
  await addLinksToBody();

  await t.expect(getClickedElement("alloy-link-test")).eql(expectedLinkDetails);
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

  await t.expect(getClickedElement("cancel-alloy-link-test")).eql(undefined);
});

test("Test C81183: Verify that it returns linkDetails irrespective on clickCollectionEnabled", async () => {
  const alloy = createAlloyProxy();

  const testConfig = compose(orgMainConfigMain, clickCollectionDisabled);

  await alloy.configure(testConfig);
  await addLinksToBody();
  const expectedLinkDetails = {
    elementId: "alloy-link-test",
    data: {},
    xdm: {
      eventType: "web.webinteraction.linkClicks",
      web: {
        webInteraction: {
          URL: "https://alloyio.com/functional-test/valid.html",
          linkClicks: {
            value: 1
          },
          name: "Test Link",
          region: "BODY",
          type: "other"
        }
      }
    }
  };

  await t.expect(getClickedElement("cancel-alloy-link-test")).eql(undefined);
  await t.expect(getClickedElement("alloy-link-test")).eql(expectedLinkDetails);
});
