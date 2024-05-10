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
import createNetworkLogger from "../../helpers/networkLogger/index.js";
import { responseStatus } from "../../helpers/assertions/index.js";
import createFixture from "../../helpers/createFixture/index.js";
import webContextConfig from "../../helpers/constants/webContextConfig.js";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import isUserAgentClientHintsSupported from "../../helpers/isUserAgentClientHintsSupported.js";

const networkLogger = createNetworkLogger();

const ID = "C2598";
const DESCRIPTION = `${ID} - Adds only web context data when only web is specified in configuration.`;

createFixture({
  title: DESCRIPTION,
  requestHooks: [networkLogger.edgeEndpointLogs],
  url: TEST_PAGE_URL,
});

test.meta({
  ID,
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test(DESCRIPTION, async () => {
  // navigate to set the document.referrer
  await t.eval(() => {
    window.document.location = `${window.document.location}`;
  });

  const alloy = createAlloyProxy();
  await alloy.configure(webContextConfig);
  await alloy.sendEvent();

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const parsedBody = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body,
  );

  await t.expect(parsedBody.events[0].xdm.web).ok();
  await t.expect(parsedBody.events[0].xdm.web.webPageDetails).ok();
  await t
    .expect(parsedBody.events[0].xdm.web.webPageDetails.URL)
    .eql(TEST_PAGE_URL);
  await t.expect(parsedBody.events[0].xdm.web.webReferrer).ok();
  await t
    .expect(parsedBody.events[0].xdm.web.webReferrer.URL)
    .eql(TEST_PAGE_URL);

  await t.expect(parsedBody.events[0].xdm.device).notOk();
  await t.expect(parsedBody.events[0].xdm.placeContext).notOk();
  await t.expect(parsedBody.events[0].xdm.environment).notOk();

  if (await isUserAgentClientHintsSupported()) {
    await t
      .expect(
        parsedBody.events[0].xdm?.environment?.browserDetails
          ?.userAgentClientHints,
      )
      .notOk();
  }
});
