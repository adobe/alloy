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
  debugEnabled,
} from "../../helpers/constants/configParts/index.js";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import addHtmlToHeader from "../../helpers/dom/addHtmlToHeader.js";
import addHtmlToBody from "../../helpers/dom/addHtmlToBody.js";
import createConsoleLogger from "../../helpers/consoleLogger/index.js";

const config = compose(orgMainConfigMain, debugEnabled);

createFixture({
  title:
    "C14299421: Prehiding style is removed when there is a problem rendering",
  url: `${TEST_PAGE_URL}?test=C14299421`,
});

test.meta({
  ID: "C14299421",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("Test C14299421: Prehiding style is removed when there is a problem rendering", async () => {
  const logger = await createConsoleLogger();

  // remove the heading so there is an error when trying to apply the personalization which is attached to the h1
  await t.eval(() => {
    window.document.body.children[0].remove();
  });
  await addHtmlToBody(`<div>Test C14299421 with missing heading</div>`);
  await addHtmlToHeader(
    `<style id="alloy-prehiding">body { visibility: hidden; }</style`,
  );

  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent({ renderDecisions: true });

  await t.expect(Selector("#alloy-prehiding").exists).notOk();
  // wait for the rendering to timeout
  await new Promise((resolve) => setTimeout(resolve, 5000));
  await logger.warn.expectMessageMatching(/Failed to execute action/);
});
