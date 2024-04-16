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
import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  clickCollectionEventGroupingDisabled
} from "../../helpers/constants/configParts";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import addHtmlToBody from "../../helpers/dom/addHtmlToBody";

const networkLogger = createNetworkLogger();
const config = compose(
  orgMainConfigMain,
  debugEnabled,
  clickCollectionEventGroupingDisabled
);

createFixture({
  title: "C14286730: Target SPA click interaction includes viewName",
  requestHooks: [networkLogger.edgeEndpointLogs],
  url: `${TEST_PAGE_URL}?test=C14286730`
});

test.meta({
  ID: "C28755",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C14286730: Target SPA click interaction includes viewName", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);

  await addHtmlToBody(
    `<div id="personalization-products-container">Products</div>`
  );
  await alloy.sendEvent({
    renderDecisions: true,
    xdm: {
      web: {
        webPageDetails: {
          viewName: "products"
        }
      }
    }
  });

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  // await t.expect(networkLogger.edgeEndpointLogs.count(() => true)).eql(2);

  await t.click(".clickme");

  // await t.expect(networkLogger.edgeEndpointLogs.count(() => true)).eql(3);

  const displayNotification = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body
  );
  const interactNotification = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[1].request.body
  );

  await t
    .expect(displayNotification.events[0].xdm.web.webPageDetails.viewName)
    .eql("products");
  await t
    .expect(interactNotification.events[0].xdm.web.webPageDetails.viewName)
    .eql("products");
});
