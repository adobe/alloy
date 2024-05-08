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
import createFixture from "../../helpers/createFixture/index.js";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts/index.js";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import createNetworkLogger from "../../helpers/networkLogger/index.js";

const config = compose(orgMainConfigMain, debugEnabled);

const networkLogger = createNetworkLogger();
createFixture({
  title: "C15325239: Top and bottom of page",
  url: `${TEST_PAGE_URL}?test=C15325239`,
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C15325239",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C15325239: Multiple top of page calls are supported.", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent({
    renderDecisions: true,
    type: "decisioning.propositionFetch",
    personalization: {
      sendDisplayEvent: false
    }
  });
  await alloy.sendEvent({
    type: "decisioning.propositionFetch",
    personalization: {
      decisionScopes: ["foo"],
      sendDisplayEvent: false
    }
  });
  await alloy.sendEventAsync({
    personalization: {
      includeRenderedPropositions: true
    }
  });

  await t.expect(networkLogger.edgeEndpointLogs.count(() => true)).eql(3);
});
