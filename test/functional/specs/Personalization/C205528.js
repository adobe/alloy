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
import { t, RequestLogger } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger/index.js";
import createFixture from "../../helpers/createFixture/index.js";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts/index.js";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";

const networkLogger = createNetworkLogger();
const redirectEndpoint = /functional-test\/alloyTestPage.html\?redirectedTest=true/;

const redirectLogger = RequestLogger(redirectEndpoint);

const config = compose(orgMainConfigMain, debugEnabled);
createFixture({
  title:
    "C205528 A redirect offer should redirect the page to the URL in the redirect decision",
  url: `${TEST_PAGE_URL}?test=C205528`,
  requestHooks: [networkLogger.edgeEndpointLogs, redirectLogger]
});

test.meta({
  ID: "C205528",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C205528: A redirect offer should redirect the page to the URL in the redirect decision", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  try {
    await alloy.sendEvent({
      renderDecisions: true
    });
  } catch (e) {
    // an exception will be thrown because a redirect will be executed within the Alloy Client Function
  } finally {
    await t.expect(redirectLogger.count(() => true)).eql(1);
  }
});

test("Test C205528: A redirect offer should not redirect if renderDecisions is false", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent({});
  // wait 1 second for the redirect to happen
  await new Promise(resolve => setTimeout(resolve, 1000));
  await t.expect(redirectLogger.count(() => true)).eql(0);
});

test("Test 205528: When there is a redirect offer web sdk should not send a bottom of page event", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEventAsync({
    renderDecisions: true,
    personalization: {
      sendDisplayEvent: false
    }
  });
  await alloy.sendEventAsync({
    personalization: {
      includeRenderedPropositions: true
    }
  });

  await t.expect(redirectLogger.count(() => true)).eql(1);
  // 1 for the initial request, 1 for the redirect display notification
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(2);
});
