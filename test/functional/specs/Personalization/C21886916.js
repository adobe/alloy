/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { t, Selector, ClientFunction } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger/index.js";
import createFixture from "../../helpers/createFixture/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import getBaseConfig from "../../helpers/getBaseConfig.js";
import {
  compose,
  debugEnabled,
} from "../../helpers/constants/configParts/index.js";

const networkLogger = createNetworkLogger();

const config = compose(getBaseConfig(), debugEnabled, {
  clickCollectionEnabled: true,
});

createFixture({
  title: "C21886916: Supports click tracking for links in shadow DOMs",
  requestHooks: [networkLogger.edgeEndpointLogs],
});

test.meta({
  ID: "C21886916",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

const insertShadowDomLink = ClientFunction(
  (
    mode = "open",
    linkId = "shadow-dom-link-test",
    innerText = "open shadow dom link",
  ) => {
    const shadow = document.body.attachShadow({ mode });
    const div = document.createElement("div");
    div.setHTMLUnsafe(`<a id="${linkId}" href="#">${innerText}</a>`);
    shadow.appendChild(div);
  },
);

/**
 * @param {Object} params
 * @param {import('testcafe').TestCafe} params.testCafe
 * @param {string} params.mode
 */
const testShadowRoot = async ({ testCafe, mode }) => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);

  await testCafe.expect(networkLogger.edgeEndpointLogs.requests.length).eql(0);

  const linkId = "shadow-dom-link-test";
  const linkText = `${mode} shadow dom link`;
  await insertShadowDomLink(mode, linkId, linkText);
  await testCafe.click(Selector("body").shadowRoot().find(`#${linkId}`));

  await testCafe.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body,
  );

  await testCafe
    .expect(request.events[0].xdm.web.webInteraction.name)
    .eql(linkText);
};

test("C21886916: Support click tracking for a link in an open shadow DOM", async () => {
  await testShadowRoot({ testCafe: t, mode: "open" });
});

test.skip("C21886916: Support click tracking for a link in an closed shadow DOM", async () => {
  await testShadowRoot({ testCafe: t, mode: "closed" });
});
