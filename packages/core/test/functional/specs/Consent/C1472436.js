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
import createNetworkLogger from "../../helpers/networkLogger/index.js";
import orgMainConfigMain from "../../helpers/constants/configParts/orgMainConfigMain.js";
import reloadPage from "../../helpers/reloadPage.js";
import flushPromiseChains from "../../helpers/flushPromiseChains.js";
import cookies from "../../helpers/cookies.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import { ADOBE2_IN } from "../../helpers/constants/consent.js";
import { MAIN_CONSENT_COOKIE_NAME } from "../../helpers/constants/cookies.js";

const networkLogger = createNetworkLogger();

createFixture({
  title:
    "C1472436: Set-consent is called when consent cookie is missing even though consent is the same",
  requestHooks: [
    networkLogger.setConsentEndpointLogs,
    networkLogger.edgeInteractEndpointLogs,
  ],
});

test.meta({
  ID: "C1472436",
  SEVERITY: "P0",
  TEST_RUN: "REGRESSION",
});

const configuration = {
  defaultConsent: "pending",
  debugEnabled: true,
  ...orgMainConfigMain,
};

test("C1472436: Set-consent is called when consent cookie is missing even though consent is the same", async () => {
  // set consent to in
  const alloy = createAlloyProxy();
  await alloy.configure(configuration);
  await alloy.setConsent(ADOBE2_IN);
  await t.expect(networkLogger.setConsentEndpointLogs.requests.length).eql(1);

  // delete consent cookie, and reload
  await reloadPage();
  await cookies.remove(MAIN_CONSENT_COOKIE_NAME);
  await alloy.configure(configuration);

  // try to send an event, but it should be queued
  const sendEventResponse = await alloy.sendEventAsync();
  await flushPromiseChains();
  await t.expect(networkLogger.edgeInteractEndpointLogs.requests.length).eql(0);

  // set the consent to IN
  await alloy.setConsent(ADOBE2_IN);
  await t.expect(networkLogger.setConsentEndpointLogs.requests.length).eql(2);

  // make sure the event goes out
  await sendEventResponse.result;
  await t.expect(networkLogger.edgeInteractEndpointLogs.requests.length).eql(1);
});
