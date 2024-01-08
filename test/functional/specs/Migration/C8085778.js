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
import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  targetMigrationEnabled
} from "../../helpers/constants/configParts";
import { TEST_PAGE, TEST_PAGE_AT_JS_ONE } from "../../helpers/constants/url";
import getResponseBody from "../../helpers/networkLogger/getResponseBody";
import {
  assertTargetMigrationEnabledIsSent,
  fetchMboxOffer,
  getEcid,
  MIGRATION_LOCATION,
  sleep
} from "./helper";
import migrationEnabled from "../../helpers/constants/configParts/migrationEnabled";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import createResponse from "../../helpers/createResponse";

const favoriteColor = "purple-123";
const networkLogger = createNetworkLogger();

const config = compose(
  orgMainConfigMain,
  debugEnabled,
  migrationEnabled,
  targetMigrationEnabled
);

createFixture({
  title:
    "C8085778: Use same visitor profile in mixed mode implementation - Update profile attribute " +
    "using web sdk and fetch offer based on profile attr using at.js 1.x",
  requestHooks: [
    networkLogger.edgeEndpointLogs,
    networkLogger.targetMboxJsonEndpointLogs
  ],
  url: TEST_PAGE,
  includeAlloyLibrary: true
});

test.meta({
  ID: "C8085778",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test.skip(
  "C8085778: Use same visitor profile in mixed mode implementation - Update profile attribute " +
    "using web sdk and fetch offer based on profile attr using at.js 1.x",
  async () => {
    const options = {
      renderDecisions: true,
      data: {
        __adobe: {
          target: {
            "profile.favoriteColor": favoriteColor
          }
        }
      }
    };
    const alloy = createAlloyProxy();
    await alloy.configure(config);
    await alloy.sendEvent(options);
    await sleep(3000);
    const sendEventRequest = networkLogger.edgeEndpointLogs.requests[0];
    // Check that targetMigrationEnabled flag is sent in meta
    await assertTargetMigrationEnabledIsSent(sendEventRequest);

    // Extract state:store payload
    const response = JSON.parse(
      getResponseBody(networkLogger.edgeEndpointLogs.requests[0])
    );

    const identityPayload = createResponse({
      content: response
    }).getPayloadsByType("identity:result");
    const ecid = getEcid(identityPayload)[0].id;

    // NAVIGATE to clean page
    await t.navigateTo(TEST_PAGE_AT_JS_ONE);
    // get mbox json API request
    await t
      .expect(networkLogger.targetMboxJsonEndpointLogs.count(() => true))
      .eql(1);
    await fetchMboxOffer({
      mbox: MIGRATION_LOCATION
    });
    await t
      .expect(networkLogger.targetMboxJsonEndpointLogs.count(() => true))
      .eql(2);
    const customMboxJsonRequest =
      networkLogger.targetMboxJsonEndpointLogs.requests[1];
    const mboxRequestUrlQuery = new URL(customMboxJsonRequest.request.url)
      .searchParams;
    const ecidMboxJsonRequest = mboxRequestUrlQuery.get("mboxMCGVID");
    // assert both interact and mbox json requests are sending the same identity
    await t.expect(ecid).eql(ecidMboxJsonRequest);
    const mboxJsonResponse = JSON.parse(getResponseBody(customMboxJsonRequest));
    const mboxContent = mboxJsonResponse.offers[0].html;

    await t
      .expect(mboxContent)
      .eql(`The favorite Color for this visitor is ${favoriteColor}.`);
  }
);
