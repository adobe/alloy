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
import { TEST_PAGE, TEST_PAGE_AT_JS_TWO } from "../../helpers/constants/url";
import {
  fetchMboxOffer,
  getPropositionCustomContent,
  injectAlloyAndSendEvent,
  MIGRATION_LOCATION
} from "./helper";
import getResponseBody from "../../helpers/networkLogger/getResponseBody";
import createResponse from "../../helpers/createResponse";
import migrationEnabled from "../../helpers/constants/configParts/migrationEnabled";

const favoriteColor = "red-1234";

const networkLogger = createNetworkLogger();
const config = compose(
  orgMainConfigMain,
  debugEnabled,
  migrationEnabled,
  targetMigrationEnabled
);

createFixture({
  title:
    "C8085780: Use same visitor profile in mixed mode implementation - Update profile attribute " +
    "using at.js 2.x and fetch proposition offer based on profile attr using web sdk",
  requestHooks: [
    networkLogger.edgeEndpointLogs,
    networkLogger.targetDeliveryEndpointLogs
  ],
  url: TEST_PAGE_AT_JS_TWO,
  includeAlloyLibrary: false
});

test.meta({
  ID: "C8085780",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test(
  "C8085780: Use same visitor profile in mixed mode implementation - Update profile attribute " +
    "using at.js 2.x and fetch proposition offer based on profile attr using web sdk",
  async () => {
    //  delivery API request
    await fetchMboxOffer({
      params: {
        "profile.favoriteColor": favoriteColor
      }
    });
    await t
      .expect(networkLogger.targetDeliveryEndpointLogs.count(() => true))
      .eql(2);
    const deliveryRequest =
      networkLogger.targetDeliveryEndpointLogs.requests[1];
    await t.expect(deliveryRequest.response.statusCode).eql(200);
    const requestBody = JSON.parse(deliveryRequest.request.body);
    const { marketingCloudVisitorId } = requestBody.id;

    // NAVIGATE to a web sdk page
    await t.navigateTo(TEST_PAGE);
    await injectAlloyAndSendEvent(config, {
      decisionScopes: [MIGRATION_LOCATION]
    });
    const sendEventRequest = networkLogger.edgeEndpointLogs.requests[0];
    const response = JSON.parse(getResponseBody(sendEventRequest));
    const identityRequestBody = JSON.parse(sendEventRequest.request.body);
    const ecid = identityRequestBody.xdm.identityMap.ECID[0].id;

    // expect same ecid is used in both requests
    await t.expect(marketingCloudVisitorId).eql(ecid);
    const personalizationPayload = createResponse({
      content: response
    }).getPayloadsByType("personalization:decisions");

    const propositionCustomContent = getPropositionCustomContent(
      personalizationPayload
    );
    // expect to get a offer based on the profile attr updated in the previous call using legacy libs
    await t
      .expect(propositionCustomContent)
      .eql(`The favorite Color for this visitor is ${favoriteColor}.`);
  }
);
