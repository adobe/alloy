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
import { ClientFunction, t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import getBaseConfig from "../../helpers/getBaseConfig";
import { compose, debugEnabled } from "../../helpers/constants/configParts";

const networkLogger = createNetworkLogger();
const organizationId = "906E3A095DC834230A495FD6@AdobeOrg";
const dataStreamId = "8cefc5ca-1c2a-479f-88f2-3d42cc302514";

const orgMainConfigMain = getBaseConfig(organizationId, dataStreamId);
const config = compose(orgMainConfigMain, debugEnabled);

createFixture({
  title: "Test C13419240: Verify DOM action using the sendEvent command",
  requestHooks: [networkLogger.edgeEndpointLogs],
  url: `${TEST_PAGE_URL}?test=C13348429`
});

test.meta({
  ID: "C13419240",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const getIframeContainer = ClientFunction(() => {
  const element = document.querySelector("#alloy-messaging-container");
  return element ? element.innerHTML : "";
});

test("Test C13419240: Verify DOM action using the sendEvent command", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);

  await alloy.sendEvent({
    renderDecisions: true,
    decisionContext: {
      user: "alloy"
    }
  });

  const containerElement = await getIframeContainer();
  await t.expect(containerElement).contains("alloy-content-iframe");
});
