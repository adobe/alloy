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
} from "../../helpers/constants/configParts/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import preventLinkNavigation from "../../helpers/preventLinkNavigation.js";
import createCollectEndpointAsserter from "../../helpers/createCollectEndpointAsserter.js";

createFixture({
  title: "C8118: Send event with information about link clicks.",
});

test.meta({
  ID: "C8118",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

const addLinkToBody = () => {
  return addHtmlToBody(
    `<a href="blank.html"><span id="alloy-link-test">Test Link</span></a>`,
  );
};

const clickLink = async () => {
  await t.click(Selector("#alloy-link-test"));
};

const assertRequestXdm = async (request) => {
  const requestBody = JSON.parse(request.request.body);
  const eventXdm = requestBody.events[0].xdm;
  await t.expect(eventXdm.eventType).eql("web.webinteraction.linkClicks");
  await t.expect(eventXdm.web.webInteraction).eql({
    name: "Test Link",
    region: "BODY",
    type: "other",
    URL: "https://alloyio.com/functional-test/blank.html",
    linkClicks: { value: 1 },
  });
};

test("Test C8118: Verify link click sends a request to the collect endpoint when identity has been established, interact endpoint otherwise", async () => {
  const collectEndpointAsserter = await createCollectEndpointAsserter();
  await preventLinkNavigation();
  const alloy = createAlloyProxy();
  const testConfig = compose(orgMainConfigMain, clickCollectionEnabled);
  await alloy.configure(testConfig);
  await addLinkToBody();
  await clickLink();
  await collectEndpointAsserter.assertInteractCalledAndNotCollect();
  const interactRequest = collectEndpointAsserter.getInteractRequest();
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
  console.log("aa", collectRequest);
  await assertRequestXdm(collectRequest);
});
