/*
Copyright 2024 Adobe. All rights reserved.
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
  title: "Supports click tracking for links in shadow DOMs",
  requestHooks: [networkLogger.edgeEndpointLogs],
});

const linkId = "shadow-dom-link-test";

const insertShadowDomLink = ClientFunction(
  (mode = "open") => {
    const shadow = document.body.attachShadow({ mode });
    const div = document.createElement("div");
    div.setHTMLUnsafe(`<a id="${linkId}" href="#">${mode} shadow dom link</a>`);
    shadow.appendChild(div);
  },
  { dependencies: { linkId } },
);

test("Support click tracking for a link in an open shadow DOM", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(0);

  await insertShadowDomLink("open");

  await t.click(Selector("body").shadowRoot().find(`#${linkId}`));

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body,
  );

  await t
    .expect(request.events[0].xdm.web.webInteraction.name)
    .eql("shadow-dom-link-test");
});

// Skipped until we have a way to track clicks on a link in a closed shadow DOM
test.skip("Support click tracking for a link in an closed shadow DOM", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(0);

  await insertShadowDomLink("closed");

  await t.click(Selector("body").shadowRoot().find(`#${linkId}`));

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body,
  );

  await t
    .expect(request.events[0].xdm.web.webInteraction.name)
    .eql("shadow-dom-link-test");
});
