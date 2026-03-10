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
  title: "C11693274: Does not search query parameters to qualify exit links.",
});

test.meta({
  ID: "C11693274",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

const addLinkToBody = () => {
  return addHtmlToBody(
    `<a href="https://example.com/?exclude-this=alloyio.com"><span id="alloy-link-test">Test Link</span></a>`,
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
    type: "exit",
    URL: "https://example.com/?exclude-this=alloyio.com",
    linkClicks: { value: 1 },
  });
};

test("Test C11693274: Verify URL query does not affect determining exit link type", async () => {
  const collectEndpointAsserter = await createCollectEndpointAsserter();
  await preventLinkNavigation();
  const alloy = createAlloyProxy();
  const testConfig = compose(orgMainConfigMain, clickCollectionEnabled);
  await alloy.configure(testConfig);
  await addLinkToBody();
  await clickLink();
  await collectEndpointAsserter.assertInteractCalledAndNotCollect();
  const interactRequest = await collectEndpointAsserter.getInteractRequest();
  await collectEndpointAsserter.reset();
  await assertRequestXdm(interactRequest);
});
