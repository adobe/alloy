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
  orgMainConfigMain
} from "../../helpers/constants/configParts/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import preventLinkNavigation from "../../helpers/preventLinkNavigation.js";
import createCollectEndpointAsserter from "../../helpers/createCollectEndpointAsserter.js";

createFixture({
  title:
    "C8119: Does not send event with information about link clicks if disabled."
});

test.meta({
  ID: "C8119",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const addLinkToBody = () => {
  return addHtmlToBody(
    `<a id="alloy-link-test" href="blank.html">Test Link</a>`
  );
};

const clickLink = async () => {
  await t.click(Selector("#alloy-link-test"));
};

test("Test C8119: Load page with link. Click link. Verify no event sent.", async () => {
  const collectEndpointAsserter = await createCollectEndpointAsserter();
  await preventLinkNavigation();
  const alloy = createAlloyProxy();
  const testConfig = compose(orgMainConfigMain, {
    clickCollectionEnabled: false
  });
  await alloy.configure(testConfig);
  await addLinkToBody();
  await clickLink();
  await collectEndpointAsserter.assertNeitherCollectNorInteractCalled();
});
