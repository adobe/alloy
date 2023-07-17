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
import createFixture from "../../helpers/createFixture";
import createNetworkLogger from "../../helpers/networkLogger";
import orgMainConfigMain from "../../helpers/constants/configParts/orgMainConfigMain";
import reloadPage from "../../helpers/reloadPage";
import cookies from "../../helpers/cookies";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import {
  LEGACY_IDENTITY_COOKIE_NAME,
  MAIN_IDENTITY_COOKIE_NAME
} from "../../helpers/constants/cookies";

const { ADOBE2_OUT } = require("../../helpers/constants/consent");

const networkLogger = createNetworkLogger();

createFixture({
  title: "C1576777: When identity cookie is missing, stored consent is cleared",
  requestHooks: [
    networkLogger.setConsentEndpointLogs,
    networkLogger.edgeInteractEndpointLogs
  ]
});

test.meta({
  ID: "C1576777",
  SEVERITY: "P0",
  TEST_RUN: "REGRESSION"
});

const configuration = {
  defaultConsent: "in",
  debugEnabled: true,
  idMigrationEnabled: true,
  thirdPartyCookiesEnabled: false,
  ...orgMainConfigMain
};

test.skip("C1576777: When identity cookie is missing, stored consent is cleared", async () => {
  // set consent to out
  const alloy = createAlloyProxy();
  await alloy.configure(configuration);
  await alloy.setConsent(ADOBE2_OUT);

  // delete identity cookie, and reload
  await reloadPage();
  await cookies.remove(MAIN_IDENTITY_COOKIE_NAME);
  await cookies.remove(LEGACY_IDENTITY_COOKIE_NAME);
  await alloy.configure(configuration);

  // try to send an event it should go out since the stored consent should be cleared
  await alloy.sendEvent();

  // reload again because now we have an identity cookie
  await reloadPage();
  await alloy.configure(configuration);
  await alloy.sendEvent();

  await t.expect(networkLogger.edgeInteractEndpointLogs.requests.length).eql(2);
});
