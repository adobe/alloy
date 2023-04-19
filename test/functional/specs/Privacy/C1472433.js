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
import createAlloyProxy from "../../helpers/createAlloyProxy";
import reloadPage from "../../helpers/reloadPage";

const { ADOBE2_IN } = require("../../helpers/constants/consent");

const networkLogger = createNetworkLogger();

createFixture({
  title: "C1472433: Set-consent is not called when consent is the same",
  requestHooks: [
    networkLogger.setConsentEndpointLogs,
    networkLogger.edgeInteractEndpointLogs
  ]
});

test.meta({
  ID: "C1472433",
  SEVERITY: "P0",
  TEST_RUN: "REGRESSION"
});

const configuration = {
  defaultConsent: "pending",
  ...orgMainConfigMain
};

test("C1472433 - Set-consent is not called when consent is the same", async () => {
  // set consent to in
  const alloy = createAlloyProxy();
  await alloy.configure(configuration);
  await alloy.setConsent(ADOBE2_IN);
  await t.expect(networkLogger.setConsentEndpointLogs.requests.length).eql(1);

  // reload the page to make sure the hashes are stored
  await reloadPage();
  await alloy.configure(configuration);

  // send an event which should go out immediately
  await alloy.sendEvent();
  await t.expect(networkLogger.edgeInteractEndpointLogs.requests.length).eql(1);

  // set the consent to in again, and make sure an edge request isn't generated.
  await alloy.setConsent(ADOBE2_IN);
  await t.expect(networkLogger.setConsentEndpointLogs.requests.length).eql(1);
});
