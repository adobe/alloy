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
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts/index.js";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import addHtmlToHeader from "../../helpers/dom/addHtmlToHeader.js";

const config = compose(orgMainConfigMain, debugEnabled);

createFixture({
  title:
    "C14299422: Prehiding style is removed when there is a personalization payload",
  url: `${TEST_PAGE_URL}?test=C14299421`
});

test.meta({
  ID: "C14299422",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C14299422: Prehiding style is removed when there is a personalization payload", async () => {
  await addHtmlToHeader(
    `<style id="alloy-prehiding">body { visibility: hidden; }</style`
  );

  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent({ renderDecisions: true });

  await t.expect(Selector("#alloy-prehiding").exists).notOk();
});
